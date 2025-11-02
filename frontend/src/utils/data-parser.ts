/**
 * Data Parser Utilities
 *
 * Utilities to parse various medical data file formats (CSV, JSON, Excel)
 * and convert them into a standardized format for the DataTable component.
 */

import type { MedicalDataRow, ColumnMetadata } from "@/types/data-table";

/**
 * Parse CSV file content
 */
export function parseCSV(content: string): {
  data: MedicalDataRow[];
  columns: ColumnMetadata[];
} {
  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length === 0) {
    return { data: [], columns: [] };
  }
  const headers = parseCSVLine(lines[0]);
  const columns: ColumnMetadata[] = headers.map((header, index) => ({
    id: `col_${index}`,
    header: header.trim(),
    type: detectColumnType(header.toLowerCase()),
    isSensitive: isSensitiveColumn(header.toLowerCase()),
    shouldAnonymize: isSensitiveColumn(header.toLowerCase()),
  }));
  const data: MedicalDataRow[] = lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line);
    const row: MedicalDataRow = { id: `row_${index}` };

    columns.forEach((col, colIndex) => {
      row[col.id] = values[colIndex] || "";
    });

    return row;
  });

  return { data, columns };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Parse JSON file content
 */
export function parseJSON(content: string): {
  data: MedicalDataRow[];
  columns: ColumnMetadata[];
} {
  try {
    const parsed = JSON.parse(content);
    const dataArray = Array.isArray(parsed) ? parsed : [parsed];

    if (dataArray.length === 0) {
      return { data: [], columns: [] };
    }
    const allKeys = new Set<string>();
    dataArray.forEach((obj) => {
      Object.keys(obj).forEach((key) => allKeys.add(key));
    });
    const columns: ColumnMetadata[] = Array.from(allKeys).map((key, index) => ({
      id: `col_${index}`,
      header: key,
      type: detectColumnType(key.toLowerCase()),
      isSensitive: isSensitiveColumn(key.toLowerCase()),
      shouldAnonymize: isSensitiveColumn(key.toLowerCase()),
    }));
    const data: MedicalDataRow[] = dataArray.map((obj, index) => ({
      id: `row_${index}`,
      ...obj,
    }));

    return { data, columns };
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return { data: [], columns: [] };
  }
}

/**
 * Detect column type based on column name
 */
function detectColumnType(
  columnName: string
): ColumnMetadata["type"] {
  const lower = columnName.toLowerCase();

  if (
    lower.includes("email") ||
    lower.includes("e-mail") ||
    lower.includes("mail")
  ) {
    return "email";
  }

  if (
    lower.includes("phone") ||
    lower.includes("tel") ||
    lower.includes("mobile") ||
    lower.includes("cell")
  ) {
    return "phone";
  }

  if (
    lower.includes("ssn") ||
    lower.includes("social security") ||
    lower.includes("security number")
  ) {
    return "ssn";
  }

  if (
    lower.includes("mrn") ||
    lower.includes("medical record") ||
    lower.includes("patient id") ||
    lower.includes("patient_id")
  ) {
    return "mrn";
  }

  if (
    lower.includes("date") ||
    lower.includes("dob") ||
    lower.includes("birth")
  ) {
    return "date";
  }

  if (
    lower.includes("age") ||
    lower.includes("count") ||
    lower.includes("number") ||
    lower.includes("id")
  ) {
    return "number";
  }

  if (
    lower.includes("active") ||
    lower.includes("enabled") ||
    lower.includes("flag")
  ) {
    return "boolean";
  }

  return "string";
}

/**
 * Check if a column contains sensitive data
 */
function isSensitiveColumn(columnName: string): boolean {
  const sensitivePatterns = [
    "name",
    "first",
    "last",
    "patient",
    "ssn",
    "social security",
    "dob",
    "birth",
    "email",
    "phone",
    "address",
    "street",
    "city",
    "zip",
    "postal",
    "mrn",
    "medical record",
    "insurance",
    "policy",
    "account",
  ];

  const lower = columnName.toLowerCase();
  return sensitivePatterns.some((pattern) => lower.includes(pattern));
}

/**
 * Generate sample medical data for testing
 */
export function generateSampleData(
  rowCount: number = 1000
): {
  data: MedicalDataRow[];
  columns: ColumnMetadata[];
} {
  const columns: ColumnMetadata[] = [
    {
      id: "mrn",
      header: "MRN",
      type: "mrn",
      isSensitive: true,
      shouldAnonymize: true,
    },
    {
      id: "firstName",
      header: "First Name",
      type: "string",
      isSensitive: true,
      shouldAnonymize: true,
    },
    {
      id: "lastName",
      header: "Last Name",
      type: "string",
      isSensitive: true,
      shouldAnonymize: true,
    },
    {
      id: "dob",
      header: "Date of Birth",
      type: "date",
      isSensitive: true,
      shouldAnonymize: true,
    },
    {
      id: "age",
      header: "Age",
      type: "number",
      isSensitive: false,
      shouldAnonymize: false,
    },
    {
      id: "gender",
      header: "Gender",
      type: "string",
      isSensitive: false,
      shouldAnonymize: false,
    },
    {
      id: "email",
      header: "Email",
      type: "email",
      isSensitive: true,
      shouldAnonymize: true,
    },
    {
      id: "phone",
      header: "Phone",
      type: "phone",
      isSensitive: true,
      shouldAnonymize: true,
    },
    {
      id: "diagnosis",
      header: "Diagnosis",
      type: "string",
      isSensitive: false,
      shouldAnonymize: false,
    },
    {
      id: "treatment",
      header: "Treatment",
      type: "string",
      isSensitive: false,
      shouldAnonymize: false,
    },
  ];

  const firstNames = [
    "John",
    "Jane",
    "Michael",
    "Emily",
    "David",
    "Sarah",
    "James",
    "Emma",
    "Robert",
    "Olivia",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
  ];
  const genders = ["Male", "Female", "Other"];
  const diagnoses = [
    "Hypertension",
    "Diabetes Type 2",
    "Asthma",
    "Arthritis",
    "Depression",
    "Anxiety",
    "Migraine",
    "COPD",
  ];
  const treatments = [
    "Medication",
    "Physical Therapy",
    "Counseling",
    "Surgery",
    "Lifestyle Changes",
    "Monitoring",
  ];

  const data: MedicalDataRow[] = Array.from({ length: rowCount }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const age = Math.floor(Math.random() * 60) + 20;
    const year = 2024 - age;

    return {
      id: `row_${i}`,
      mrn: `MRN${String(100000 + i).padStart(6, "0")}`,
      firstName,
      lastName,
      dob: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
      age,
      gender: genders[Math.floor(Math.random() * genders.length)],
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
      treatment: treatments[Math.floor(Math.random() * treatments.length)],
    };
  });

  return { data, columns };
}

/**
 * Read file content as text
 */
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Parse uploaded file based on its type
 */
export async function parseFile(file: File): Promise<{
  data: MedicalDataRow[];
  columns: ColumnMetadata[];
}> {
  const content = await readFileAsText(file);

  if (file.type === "text/csv" || file.name.endsWith(".csv")) {
    return parseCSV(content);
  }

  if (
    file.type === "application/json" ||
    file.name.endsWith(".json") ||
    file.name.endsWith(".fhir")
  ) {
    return parseJSON(content);
  }
  return parseCSV(content);
}
