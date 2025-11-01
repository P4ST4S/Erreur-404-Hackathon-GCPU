"""
Vertex AI Service Wrapper
Pre-configured functions to interact with Vertex AI Agent.
"""

import vertexai
from vertexai.generative_models import (
    GenerativeModel,
    Tool,
    FunctionDeclaration,
    Part,
    GenerationConfig,
)
from typing import Dict, List, Optional, Any
import json
import app.core.config as settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


class VertexAIService:
    """
    Vertex AI Agent wrapper service
    Usage: vertex_service.analyze_file(file_data)
    """

    def __init__(self):
        """Initialize Vertex AI with project credentials."""
        vertexai.init(project=settings.gcs_project_id, location=settings.gcp_location)

        self.model = GenerativeModel(
            model_name="gemini-2.5-pro",
            system_instruction=self._get_system_instruction()
            generation_config=GenerationConfig(
                temperature=1,
                top_p=0.95,
                top_k=40,
                max_output_tokens=8192,
            )
        )

        self.tools = self._create_tools()

        logger.info("Vertex AI Service initialized successfully.")
    
    def _get_system_instruction(self) -> str:
        """System prompt for the anonymization agent"""
        return """
        You are an expert medical data anonymization agent.
        
        Your responsibilities:
        1. Analyze uploaded medical files (CSV, JSON, Excel, FHIR)
        2. Detect the country/regulation (HIPAA, GDPR, CNIL, etc.)
        3. Identify sensitive fields that need anonymization
        4. Recommend anonymization techniques per field
        5. Explain your reasoning clearly
        
        Available tools:
        - inspect_with_dlp: Detect sensitive patterns (emails, SSN, phone numbers)
        - analyze_healthcare: Detect medical entities (diagnoses, medications)
        - calculate_risk: Calculate re-identification risk (k-anonymity)
        
        Always reason step-by-step and explain your decisions.
        Be conservative with sensitive data - when in doubt, anonymize.
        """

    def _create_tools(self) -> List[Tool]:
        """Define function tools available to the agent"""
        inspect_dlp = FunctionDeclaration(
            name="inspect_with_dlp",
            description="Detect sensitive data patterns like emails, SSN, phone numbers using Google DLP API",
            parameters={
                "type": "object",
                "properties": {
                    "data": {
                        "type": "string",
                        "description": "Sample data to inspect (JSON string)"
                    },
                    "info_types": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Types to detect: EMAIL_ADDRESS, PHONE_NUMBER, PERSON_NAME, etc."
                    }
                },
                "required": ["data"]
            }
        )
        
        analyze_healthcare = FunctionDeclaration(
            name="analyze_healthcare",
            description="Analyze medical entities using Google Healthcare Natural Language API",
            parameters={
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "Medical text to analyze"
                    }
                },
                "required": ["text"]
            }
        )
        
        calculate_risk = FunctionDeclaration(
            name="calculate_risk",
            description="Calculate re-identification risk (k-anonymity score)",
            parameters={
                "type": "object",
                "properties": {
                    "dataset_sample": {
                        "type": "string",
                        "description": "Sample of the dataset (JSON)"
                    },
                    "quasi_identifiers": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of quasi-identifier column names"
                    }
                },
                "required": ["dataset_sample", "quasi_identifiers"]
            }
        )
        
        return [Tool(function_declarations=[inspect_dlp, analyze_healthcare, calculate_risk])]
    
    async def analyze_file(
        self,
        filename: str,
        columns: List[str],
        sample_data: Dict[str, Any],
        file_type: str = "csv"
    ) -> Dict[str, Any]:
        """
        Analyze a file and get anonymization strategy
        
        Args:
            filename: Name of the uploaded file
            columns: List of column names
            sample_data: Sample rows (first 5-10 rows)
            file_type: Type of file (csv, json, excel, fhir)
        
        Returns:
            Dict with agent's analysis and recommendations
        """
        logger.info(f"Analyzing file: {filename}")
        
        # Create prompt for the agent
        prompt = f"""
        Analyze this medical file and recommend an anonymization strategy:
        
        Filename: {filename}
        File type: {file_type}
        Columns: {', '.join(columns)}
        
        Sample data (first rows):
        {json.dumps(sample_data, indent=2)}
        
        Tasks:
        1. Identify what type of medical data this is (clinical trial, patient records, etc.)
        2. Detect which fields are sensitive and need anonymization
        3. For each sensitive field, recommend the best anonymization technique
        4. Estimate the re-identification risk level
        
        Use the available tools if needed to detect patterns and calculate risks.
        Provide your analysis in JSON format.
        """
        
        try:
            # Start chat with the agent
            chat = self.model.start_chat()
            
            # Send message with tools
            response = chat.send_message(
                prompt,
                tools=self.tools
            )
            
            # Handle function calls if agent wants to use tools
            while response.candidates[0].content.parts[0].function_call:
                function_call = response.candidates[0].content.parts[0].function_call
                logger.info(f"Agent calling function: {function_call.name}")
                
                # Execute the requested function
                function_response = await self._execute_function(function_call)
                
                # Send function result back to agent
                response = chat.send_message(
                    Part.from_function_response(
                        name=function_call.name,
                        response={"result": function_response}
                    )
                )
            
            # Extract final text response
            result = response.text
            logger.info("File analysis completed")
            
            # Try to parse as JSON, otherwise return as text
            try:
                return json.loads(result)
            except json.JSONDecodeError:
                return {"analysis": result, "raw_response": True}
                
        except Exception as e:
            logger.error(f"Error analyzing file: {str(e)}")
            raise
    
    async def detect_country(
        self,
        columns: List[str],
        sample_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Detect the country/regulation from the data
        
        Args:
            columns: Column names
            sample_data: Sample data rows
            
        Returns:
            Dict with detected country, confidence, and clues
        """
        logger.info("Detecting country/regulation")
        
        prompt = f"""
        Analyze this medical dataset and detect which country/regulation it's from:
        
        Columns: {', '.join(columns)}
        Sample data: {json.dumps(sample_data, indent=2)}
        
        Look for clues:
        - SSN format → USA (HIPAA)
        - NIR format → France (CNIL)
        - NHS number → UK
        - Phone number format (+1, +33, +44, etc.)
        - Postal code format
        - Column names language (English, French, etc.)
        
        Return JSON:
        {{
            "country": "USA" | "France" | "UK" | "Canada" | "Unknown",
            "regulation": "HIPAA" | "GDPR" | "CNIL" | "PIPEDA" | "Unknown",
            "confidence": 0.0-1.0,
            "clues": ["clue1", "clue2"]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = json.loads(response.text)
            logger.info(f"Detected country: {result.get('country')} ({result.get('confidence')*100:.0f}%)")
            return result
        except Exception as e:
            logger.error(f"Error detecting country: {str(e)}")
            return {
                "country": "Unknown",
                "regulation": "Unknown",
                "confidence": 0.0,
                "clues": [],
                "error": str(e)
            }
    
    async def generate_anonymization_strategy(
        self,
        columns: List[str],
        regulation: str,
        detected_sensitive_fields: List[str]
    ) -> Dict[str, Any]:
        """
        Generate anonymization strategy based on regulation
        
        Args:
            columns: All column names
            regulation: HIPAA, GDPR, CNIL, etc.
            detected_sensitive_fields: Fields detected as sensitive by DLP/Healthcare API
            
        Returns:
            Dict with strategy per field
        """
        logger.info(f"Generating anonymization strategy for {regulation}")
        
        prompt = f"""
        Generate an anonymization strategy for these fields according to {regulation}:
        
        All columns: {', '.join(columns)}
        Detected sensitive fields: {', '.join(detected_sensitive_fields)}
        
        For each field, decide:
        - Action: keep, suppress, mask, pseudonymize, generalize, date_shift, hash
        - Reason: why this action
        - Risk level: low, medium, high
        
        Rules for {regulation}:
        - HIPAA: Must remove 18 identifiers (names, dates except year, SSN, etc.)
        - GDPR: Pseudonymization acceptable, keep medical data for legitimate purposes
        - CNIL: Similar to GDPR but stricter on NIR (French SSN)
        
        Return JSON:
        {{
            "strategy": {{
                "field_name": {{
                    "action": "suppress",
                    "reason": "Contains personal names (HIPAA identifier)",
                    "risk": "high"
                }},
                ...
            }},
            "overall_risk": "low" | "medium" | "high",
            "compliance": ["HIPAA", "GDPR"]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = json.loads(response.text)
            logger.info("Anonymization strategy generated")
            return result
        except Exception as e:
            logger.error(f"Error generating strategy: {str(e)}")
            raise
    
    async def map_to_schema(
        self,
        source_columns: List[str],
        target_schema_fields: List[str],
        sample_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Map source columns to target schema fields
        
        Args:
            source_columns: Columns from uploaded file
            target_schema_fields: Fields in the target schema
            sample_data: Sample data to understand content
            
        Returns:
            Mapping suggestions with confidence scores
        """
        logger.info("Mapping columns to schema")
        
        prompt = f"""
        Map these source columns to target schema fields:
        
        Source columns: {', '.join(source_columns)}
        Target schema fields: {', '.join(target_schema_fields)}
        
        Sample data: {json.dumps(sample_data, indent=2)}
        
        For each source column, find the best matching target field.
        Consider:
        - Semantic similarity (patient_id → patient_id)
        - Aliases (nom → name, age_years → age)
        - Data content
        
        Return JSON:
        {{
            "mappings": {{
                "source_column": {{
                    "target_field": "patient_id",
                    "confidence": 0.95,
                    "reason": "Exact match"
                }},
                ...
            }}
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = json.loads(response.text)
            logger.info("Schema mapping completed")
            return result
        except Exception as e:
            logger.error(f"Error mapping schema: {str(e)}")
            raise
    
    async def _execute_function(self, function_call) -> Dict[str, Any]:
        """
        Execute a function called by the agent
        This is where you'd call actual DLP API, Healthcare API, etc.
        """
        function_name = function_call.name
        args = dict(function_call.args)
        
        logger.info(f"Executing function: {function_name}")
        
        # Placeholder - you'll implement actual API calls
        if function_name == "inspect_with_dlp":
            # TODO: Call actual DLP API
            return {"findings": ["EMAIL_ADDRESS", "PHONE_NUMBER"], "count": 5}
        
        elif function_name == "analyze_healthcare":
            # TODO: Call actual Healthcare NL API
            return {"entities": ["PERSON", "DATE", "DIAGNOSIS"], "count": 12}
        
        elif function_name == "calculate_risk":
            # TODO: Calculate actual k-anonymity
            return {"k_anonymity": 8, "risk_level": "low"}
        
        return {"error": "Function not implemented"}


# Singleton instance
_vertex_service: Optional[VertexAIService] = None

def get_vertex_service() -> VertexAIService:
    """
    Get or create Vertex AI service instance (singleton)
    Usage: vertex_service = get_vertex_service()
    """
    global _vertex_service
    if _vertex_service is None:
        _vertex_service = VertexAIService()
    return _vertex_service
    