import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ConflictDetectionResponse, MergeMapping, ColumnMappingGroup, ColumnInfo } from "@/types/conflict";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export default function ConflictResolution() {
  const { datasetId } = useParams<{ datasetId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState(false);
  const [conflictData, setConflictData] = useState<ConflictDetectionResponse | null>(null);
  const [mappingGroups, setMappingGroups] = useState<ColumnMappingGroup[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!datasetId) return;

    const validateDataset = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/validate/${datasetId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to validate dataset");
        }

        const data: ConflictDetectionResponse = await response.json();
        setConflictData(data);

        if (data.has_conflicts) {
          const groups: ColumnMappingGroup[] = data.conflicts.map((conflict) => ({
            finalName: conflict.column_name,
            selectedColumns: new Map(),
            availableColumns: conflict.variations,
          }));
          setMappingGroups(groups);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        toast({
          title: "Validation Failed",
          description: "Failed to validate dataset. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    validateDataset();
  }, [datasetId, toast]);

  const handleColumnSelection = (groupIndex: number, fileId: number, columnName: string) => {
    setMappingGroups((prev) => {
      const updated = [...prev];
      const group = updated[groupIndex];

      if (columnName === "none") {
        group.selectedColumns.delete(fileId);
      } else {
        group.selectedColumns.set(fileId, columnName);
      }

      return updated;
    });
  };

  const handleFinalNameChange = (groupIndex: number, newName: string) => {
    setMappingGroups((prev) => {
      const updated = [...prev];
      updated[groupIndex].finalName = newName;
      return updated;
    });
  };

  const addMappingGroup = () => {
    const allColumns: ColumnInfo[] = [];
    conflictData?.conflicts.forEach((conflict) => {
      conflict.variations.forEach((col) => {
        if (!allColumns.find((c) => c.file_id === col.file_id && c.name === col.name)) {
          allColumns.push(col);
        }
      });
    });

    setMappingGroups((prev) => [
      ...prev,
      {
        finalName: "",
        selectedColumns: new Map(),
        availableColumns: allColumns,
      },
    ]);
  };

  const removeMappingGroup = (groupIndex: number) => {
    setMappingGroups((prev) => prev.filter((_, idx) => idx !== groupIndex));
  };

  const handleMerge = async () => {
    if (!datasetId || !conflictData) return;

    const merges: MergeMapping = {};

    mappingGroups.forEach((group) => {
      if (group.finalName.trim() && group.selectedColumns.size > 0) {
        const columns = Array.from(group.selectedColumns.values());
        merges[group.finalName.trim()] = columns;
      }
    });

    if (!conflictData.has_conflicts) {
      const allColumnNames = new Set<string>();
      conflictData.conflicts.forEach((conflict) => {
        conflict.variations.forEach((col) => allColumnNames.add(col.name));
      });

      allColumnNames.forEach((colName) => {
        merges[colName] = [colName];
      });
    }

    setMerging(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/merge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dataset_id: parseInt(datasetId),
          merges,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to merge files");
      }

      const result = await response.json();

      toast({
        title: "Merge Successful",
        description: result.message || "Files merged successfully",
      });

      navigate(`/anonymize/${datasetId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during merge");
      toast({
        title: "Merge Failed",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setMerging(false);
    }
  };

  const canMerge = () => {
    if (!conflictData) return false;

    if (!conflictData.has_conflicts) return true;

    return mappingGroups.every(
      (group) => group.finalName.trim() !== "" && group.selectedColumns.size > 0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Validating dataset...</p>
        </div>
      </div>
    );
  }

  if (error && !conflictData) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/dashboard")} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Conflict Resolution</h1>
        <p className="text-muted-foreground">
          Review and resolve column conflicts before merging your dataset
        </p>
      </div>

      {conflictData && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {conflictData.has_conflicts ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    Conflicts Detected
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    No Conflicts Found
                  </>
                )}
              </CardTitle>
              <CardDescription>{conflictData.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Columns</p>
                  <p className="text-2xl font-bold">{conflictData.total_columns}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conflicts</p>
                  <p className="text-2xl font-bold">{conflictData.conflicts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!conflictData.has_conflicts && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Ready to Merge</CardTitle>
                <CardDescription>
                  All columns are consistent across files. You can proceed with merging.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleMerge} disabled={merging} className="w-full">
                  {merging ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Merging Files...
                    </>
                  ) : (
                    "Merge Files"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {conflictData.has_conflicts && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Column Mappings</h2>
                <Button onClick={addMappingGroup} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Mapping
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                {mappingGroups.map((group, groupIndex) => (
                  <Card key={groupIndex}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Mapping Group {groupIndex + 1}
                        </CardTitle>
                        {mappingGroups.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMappingGroup(groupIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor={`final-name-${groupIndex}`}>
                          Final Column Name
                        </Label>
                        <Input
                          id={`final-name-${groupIndex}`}
                          value={group.finalName}
                          onChange={(e) =>
                            handleFinalNameChange(groupIndex, e.target.value)
                          }
                          placeholder="Enter unified column name"
                          className="mt-1"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Select Columns from Each File</Label>
                        {Array.from(
                          new Map(
                            group.availableColumns.map((col) => [
                              col.file_id,
                              col.file_name,
                            ])
                          )
                        ).map(([fileId, fileName]) => {
                          const columnsForFile = group.availableColumns.filter(
                            (col) => col.file_id === fileId
                          );

                          return (
                            <div key={fileId} className="border rounded-lg p-4">
                              <p className="font-medium mb-2">{fileName}</p>
                              <Select
                                value={group.selectedColumns.get(fileId) || "none"}
                                onValueChange={(value: string) =>
                                  handleColumnSelection(groupIndex, fileId, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select column or skip" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">
                                    Skip (no column selected)
                                  </SelectItem>
                                  {columnsForFile.map((col) => (
                                    <SelectItem key={col.name} value={col.name}>
                                      {col.name} ({col.dtype})
                                      {col.samples && col.samples.length > 0 && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                          Sample: {col.samples.slice(0, 2).join(", ")}
                                        </span>
                                      )}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {group.selectedColumns.get(fileId) && (
                                <>
                                  {columnsForFile
                                    .filter(
                                      (col) =>
                                        col.name === group.selectedColumns.get(fileId)
                                    )
                                    .map(
                                      (col) =>
                                        col.samples &&
                                        col.samples.length > 0 && (
                                          <div
                                            key={col.name}
                                            className="mt-2 p-2 bg-muted rounded text-xs"
                                          >
                                            <p className="font-medium mb-1">Sample values:</p>
                                            <p className="text-muted-foreground">
                                              {col.samples.join(", ")}
                                            </p>
                                          </div>
                                        )
                                    )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMerge}
                  disabled={!canMerge() || merging}
                  className="flex-1"
                >
                  {merging ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Merging Files...
                    </>
                  ) : (
                    "Merge Files"
                  )}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
