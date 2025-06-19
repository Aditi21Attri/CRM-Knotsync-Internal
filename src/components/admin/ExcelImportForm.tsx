
"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";
import type { MappedCustomerData, ExcelRowData, User } from "@/lib/types";
import { UploadCloud, AlertTriangle, CheckCircle, Loader2, ListChecks } from "lucide-react";
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';

const customerFields: (keyof MappedCustomerData)[] = ["name", "email", "phoneNumber", "category"];

export function ExcelImportForm() {
  const { addCustomer, employees } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ExcelRowData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<keyof MappedCustomerData, string>>({} as Record<keyof MappedCustomerData, string>);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [defaultSelectedEmployeeId, setDefaultSelectedEmployeeId] = useState<string | "unassigned">("unassigned");
  const [firstRecordPreview, setFirstRecordPreview] = useState<Record<string, string> | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      const fileName = selectedFile.name.toLowerCase();

      if (!fileName.endsWith('.csv')) {
          setError("Invalid file type. Please upload a CSV file (must have a .csv extension).");
          setFile(null);
          return;
      }
      setFile(selectedFile);
      setError(null);
      setParsedData([]);
      setHeaders([]);
      setColumnMapping({} as Record<keyof MappedCustomerData, string>);
      setSuccessMessage(null);
      setDefaultSelectedEmployeeId("unassigned");
      setFirstRecordPreview(null);
    }
  };

  const handleParseFile = () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    setIsLoading(true);
    Papa.parse<ExcelRowData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          const firstError = results.errors[0];
          let userErrorMessage = "Error parsing CSV file. Please check the file format.";
          const errorRowDisplay = firstError.row !== undefined ? firstError.row + 2 : 'unknown';

          if (firstError) {
            userErrorMessage = `Error parsing CSV (around line ${errorRowDisplay}): ${firstError.message}. Please check the file format.`;
          }
          setError(userErrorMessage);
          setIsLoading(false);
          return;
        }
        if (results.data.length === 0 || !results.meta.fields) {
             setError("CSV file is empty or has no headers.");
             setIsLoading(false);
             return;
        }
        setParsedData(results.data);
        setHeaders(results.meta.fields.filter(h => h !== "") || []);
        const initialMapping = {} as Record<keyof MappedCustomerData, string>;
        customerFields.forEach(field => {
            const matchedHeader = results.meta.fields?.find(h => h.toLowerCase() === field.toLowerCase());
            if (matchedHeader) {
                initialMapping[field] = matchedHeader;
            }
        });
        setColumnMapping(initialMapping);
        setStep(2);
        setIsLoading(false);
        setError(null);
      },
      error: (err: any) => {
          setError(`Error parsing file: ${err.message}`);
          setIsLoading(false);
      }
    });
  };
  
  const handleMappingChange = (customerField: keyof MappedCustomerData, csvHeader: string) => {
    setColumnMapping(prev => ({ ...prev, [customerField]: csvHeader }));
  };

  const handleProceedToReview = () => {
    const requiredCoreFieldsMapped = ["name", "email"].every(field => !!columnMapping[field as keyof MappedCustomerData]);
    if (!requiredCoreFieldsMapped) {
        setError("Please map at least 'Name' and 'Email' customer fields before proceeding.");
        return;
    }

    if (parsedData.length > 0) {
        const firstRow = parsedData[0];
        const preview: Record<string, string> = {};

        // Process mapped structured fields using their standard CRM key
        customerFields.forEach(fieldKey => {
            const csvHeader = columnMapping[fieldKey];
            if (csvHeader && firstRow[csvHeader] !== undefined && firstRow[csvHeader] !== null) {
                preview[fieldKey] = String(firstRow[csvHeader]);
            } else if (csvHeader) { // Mapped but no value in first row
                preview[fieldKey] = "N/A in first row";
            } else { // Standard field not mapped
                preview[fieldKey] = "Not Mapped";
            }
        });

        // Process other unmapped CSV columns using their database-normalized key
        headers.forEach(header => {
            if (!Object.values(columnMapping).includes(header)) { // If header wasn't used for a structured field
                const dbKey = header.replace(/\s+/g, '_').toLowerCase();
                // Add to preview only if the key isn't already there from a standard field
                // (This check helps avoid potential rare conflicts if a normalized header matches a standard field name)
                if (!preview.hasOwnProperty(dbKey)) {
                    preview[dbKey] = String(firstRow[header] ?? "N/A in first row (for custom field)");
                }
            }
        });
        setFirstRecordPreview(preview);
    } else {
        setFirstRecordPreview(null);
    }
    setStep(3);
    setError(null);
  };

  const formatPreviewKey = (key: string) => {
    // For standard fields, use their direct name. For others, format the dbKey.
    if (customerFields.includes(key as keyof MappedCustomerData)) {
        if (key === 'name') return 'Name';
        if (key === 'email') return 'Email';
        if (key === 'phoneNumber') return 'Phone Number';
        if (key === 'category') return 'Category (Region)';
    }
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1') 
      .trim()
      .replace(/\b\w/g, l => l.toUpperCase()); 
  };

  const handleImportData = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const requiredCoreFieldsMapped = ["name", "email"].every(field => !!columnMapping[field as keyof MappedCustomerData]);
    if(!requiredCoreFieldsMapped) {
        setError("Please map at least Name and Email customer fields.");
        setIsLoading(false);
        return;
    }
    
    let importedCount = 0;
    let autoAssignedCount = 0;

    for (const row of parsedData) {
      const customerData: MappedCustomerData = {} as MappedCustomerData;
      let validRow = true;

      customerFields.forEach(field => {
        const csvHeader = columnMapping[field];
        if (csvHeader && row[csvHeader] !== undefined && row[csvHeader] !== null) {
          customerData[field] = String(row[csvHeader]);
        } else if (field === "name" || field === "email") { 
            if(csvHeader) validRow = false; 
        }
      });
      if(!customerData.name || !customerData.email) {
          validRow = false;
      }

      if(validRow) {
          headers.forEach(header => {
              if (!Object.values(columnMapping).includes(header)) { 
                  if (row[header] !== undefined && row[header] !== null) {
                    const key = header.replace(/\s+/g, '_').toLowerCase();
                    (customerData as any)[key] = String(row[header]);
                  }
              }
          });

          let finalAssignedTo: string | null = defaultSelectedEmployeeId === "unassigned" ? null : defaultSelectedEmployeeId;
          const customerRegion = customerData.category; 

          if (customerRegion) {
            const regionalEmployee = employees.find(emp => 
              emp.role === 'employee' && 
              emp.specializedRegion && 
              emp.specializedRegion.trim().toLowerCase() === customerRegion.trim().toLowerCase()
            );
            if (regionalEmployee) {
              finalAssignedTo = regionalEmployee.id;
              if (finalAssignedTo !== (defaultSelectedEmployeeId === "unassigned" ? null : defaultSelectedEmployeeId)) {
                autoAssignedCount++;
              }
            }
          }
          
          await addCustomer(customerData, finalAssignedTo, 'neutral'); 
          importedCount++;
      }
    }

    if (importedCount > 0) {
      const defaultAssignee = employees.find(emp => emp.id === defaultSelectedEmployeeId);
      let assignmentMessage = "";
      if (autoAssignedCount > 0) {
        assignmentMessage = `${autoAssignedCount} customer(s) auto-assigned by region. `;
      }
      if (defaultAssignee && (importedCount - autoAssignedCount > 0)) {
        assignmentMessage += `${importedCount - autoAssignedCount} customer(s) assigned to ${defaultAssignee.name}.`;
      } else if (defaultSelectedEmployeeId === "unassigned" && (importedCount - autoAssignedCount > 0)) {
        assignmentMessage += `${importedCount - autoAssignedCount} customer(s) remain unassigned.`;
      } else if (importedCount - autoAssignedCount === 0 && autoAssignedCount === 0 && importedCount > 0) {
         assignmentMessage = importedCount > 1 ? "All imported customers remain unassigned." : "The imported customer remains unassigned.";
      }

      const successMsg = `${importedCount} customer(s) imported successfully. ${assignmentMessage.trim()}`;
      setSuccessMessage(successMsg);
      toast({ title: "Import Successful", description: successMsg });
      setFile(null);
      setParsedData([]);
      setHeaders([]);
      setColumnMapping({} as Record<keyof MappedCustomerData, string>);
      setDefaultSelectedEmployeeId("unassigned");
      setFirstRecordPreview(null);
      setStep(1);
    } else {
      setError("No customers were imported. Check your data, mappings (ensure Name and Email are mapped and present), and file format.");
      toast({ title: "Import Failed", description: "No customers were imported. Check data, mappings, and file format.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <UploadCloud className="mr-3 h-7 w-7 text-primary" /> Import Customer Data (CSV)
        </CardTitle>
        <CardDescription>
          Upload CSV, map columns to customer fields (use 'Category' for country/region for auto-assignment), 
          and import data. All columns from your CSV will be imported. Customers may be auto-assigned if their region matches an employee's specialized region.
        </CardDescription>
      </CardHeader>

      {step === 1 && (
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="file-upload" className="text-base">Upload CSV File</Label>
            <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="mt-2 text-base file:text-primary file:font-semibold hover:file:bg-primary/10"/>
            {file && <p className="mt-2 text-sm text-muted-foreground">Selected file: {file.name}</p>}
          </div>
           {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button onClick={handleParseFile} disabled={!file || isLoading} className="w-full text-lg py-3">
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ListChecks className="mr-2 h-5 w-5" />}
            Parse File & Proceed to Mapping
          </Button>
        </CardContent>
      )}

      {step === 2 && headers.length > 0 && (
        <form onSubmit={(e) => { e.preventDefault(); handleProceedToReview(); }}>
          <CardContent className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Map CSV Columns to Customer Fields</h3>
            <p className="text-sm text-muted-foreground">
                Select the CSV column for each standard CRM field (Name and Email are required).
                Map your 'Country' or 'Region' CSV column to the 'Category' field for regional auto-assignment.
                <br />
                <strong>Important: All other columns in your CSV that are not mapped here will be automatically imported as additional customer parameters.</strong> You can review these in the next step.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customerFields.map(field => (
                    <div key={field} className="space-y-2 p-4 border rounded-md bg-background/50">
                    <Label htmlFor={`map-${field}`} className="text-base font-medium capitalize">{formatPreviewKey(field)}{field === 'category' ? ' (for Region)' : ''}{field === 'name' || field === 'email' ? ' (Required)' : ''}</Label>
                    <Select
                        onValueChange={(value) => handleMappingChange(field, value)}
                        defaultValue={columnMapping[field]}
                        required={field === "name" || field === "email"}
                    >
                        <SelectTrigger id={`map-${field}`} className="w-full text-base">
                        <SelectValue placeholder="Select CSV Column" />
                        </SelectTrigger>
                        <SelectContent>
                        {headers.map(header => (
                            <SelectItem key={header} value={header} className="text-base">{header}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    {parsedData[0] && columnMapping[field] && (
                         <p className="text-xs text-muted-foreground truncate">
                            Preview: <span className="font-mono text-foreground/80">{String(parsedData[0][columnMapping[field]!]) || "N/A"}</span>
                         </p>
                    )}
                    </div>
                ))}
            </div>
            {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => {setStep(1); setError(null); setFirstRecordPreview(null);}} disabled={isLoading}>Back to Upload</Button>
            <Button type="submit" disabled={isLoading} className="text-lg py-3">
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Review & Import
            </Button>
          </CardFooter>
        </form>
      )}
      
      {step === 3 && (
          <>
            <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Review Import</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                      You are about to import <strong>{parsedData.length}</strong> records. 
                      Customers may be auto-assigned to employees based on matching specialized regions (using the 'Category' field).
                      Below is a preview of all data parameters that will be imported for the first record based on your mappings and the CSV content.
                      Keys shown are how they will be stored in the database.
                  </p>
                   {firstRecordPreview ? (
                    <div className="space-y-2 p-4 border rounded-md bg-secondary/50 max-h-60 overflow-y-auto mb-6">
                      {Object.entries(firstRecordPreview).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm items-start">
                          <span className="font-semibold text-muted-foreground mr-2">{formatPreviewKey(key)}:</span>
                          <span className="font-mono text-foreground text-right break-all">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data to preview. Please ensure 'Name' and 'Email' fields are mapped in the previous step.</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="assign-employee" className="text-base font-medium">Default Assignee (Fallback)</Label>
                  <Select 
                      onValueChange={(value) => setDefaultSelectedEmployeeId(value)} 
                      value={defaultSelectedEmployeeId}
                  >
                      <SelectTrigger id="assign-employee" className="w-full md:w-1/2 mt-2 text-base">
                          <SelectValue placeholder="Select default employee..." />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="unassigned" className="text-base">Unassigned (or auto-assign by region)</SelectItem>
                          {employees.map((employee: User) => (
                              <SelectItem key={employee.id} value={employee.id} className="text-base">
                                  {employee.name} {employee.specializedRegion && `(${employee.specializedRegion})`}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                      Selected employee is a fallback. Customers matching an employee's specialized region (via 'Category' field) will be auto-assigned.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {successMessage && (
                  <Alert variant="default" className="mt-4 bg-green-500/10 border-green-500/50">
                    <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-400" />
                    <AlertTitle className="text-green-700 dark:text-green-400">Success</AlertTitle>
                    <AlertDescription className="text-green-600 dark:text-green-300">{successMessage}</AlertDescription>
                  </Alert>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {setStep(2); setError(null); setSuccessMessage(null); }} disabled={isLoading}>Back to Mapping</Button>
              <Button onClick={handleImportData} disabled={isLoading || !!successMessage || !firstRecordPreview} className="text-lg py-3">
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
                  Confirm & Import Data
              </Button>
            </CardFooter>
          </>
      )}

    </Card>
  );
}

