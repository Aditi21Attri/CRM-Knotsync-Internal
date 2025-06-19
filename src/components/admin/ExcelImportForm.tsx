
"use client";

import { useState, ChangeEvent, FormEvent, useId } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";
import type { MappedCustomerData, ExcelRowData, User } from "@/lib/types";
import { UploadCloud, AlertTriangle, CheckCircle, Loader2, ListChecks, PlusCircle, XCircle, ArrowRight, StepForward } from "lucide-react";
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';

const customerFields: (keyof MappedCustomerData)[] = ["name", "email", "phoneNumber", "category"];
const NONE_VALUE = "__NONE__"; 

interface CustomFieldMap {
  id: string;
  crmFieldName: string;
  csvColumnName: string;
}

export function ExcelImportForm() {
  const { addCustomer, employees } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ExcelRowData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<keyof MappedCustomerData, string>>({} as Record<keyof MappedCustomerData, string>);
  const [customFieldMappings, setCustomFieldMappings] = useState<CustomFieldMap[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [defaultSelectedEmployeeId, setDefaultSelectedEmployeeId] = useState<string | "unassigned">("unassigned");
  const [firstRecordPreview, setFirstRecordPreview] = useState<Record<string, string> | null>(null);
  const { toast } = useToast();
  const reactId = useId();

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
      setCustomFieldMappings([]);
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
            const matchedHeader = results.meta.fields?.find(h => h.toLowerCase() === field.toLowerCase() || h.toLowerCase().replace(/\s/g, '') === field.toLowerCase());
            if (matchedHeader) {
                initialMapping[field] = matchedHeader;
            } else {
                initialMapping[field] = ''; 
            }
        });
        setColumnMapping(initialMapping);
        setCustomFieldMappings([]);
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
    setColumnMapping(prev => ({ ...prev, [customerField]: csvHeader === NONE_VALUE ? '' : csvHeader }));
  };

  const addCustomFieldMap = () => {
    setCustomFieldMappings(prev => [...prev, { id: `${reactId}-${prev.length}`, crmFieldName: '', csvColumnName: '' }]);
  };

  const updateCustomFieldMap = (index: number, field: 'crmFieldName' | 'csvColumnName', value: string) => {
    const actualValue = field === 'csvColumnName' && value === NONE_VALUE ? '' : value;
    setCustomFieldMappings(prev => prev.map((map, i) => i === index ? { ...map, [field]: actualValue } : map));
  };

  const removeCustomFieldMap = (id: string) => {
    setCustomFieldMappings(prev => prev.filter(map => map.id !== id));
  };


  const handleProceedToReview = () => {
    const requiredCoreFieldsMapped = ["name", "email"].every(field => !!columnMapping[field as keyof MappedCustomerData]);
    if (!requiredCoreFieldsMapped) {
        setError("Please map at least 'Name' and 'Email' customer fields before proceeding.");
        return;
    }
    
    for (const mapping of customFieldMappings) {
        if (mapping.csvColumnName && !mapping.crmFieldName.trim()) {
            setError(`Please provide a 'CRM Field Name' for the custom mapping with CSV column '${mapping.csvColumnName}'.`);
            return;
        }
        if (mapping.crmFieldName.trim() && !mapping.csvColumnName) {
            setError(`Please select a 'CSV Column' for the custom CRM field '${mapping.crmFieldName}'.`);
            return;
        }
        const crmFieldNameLower = mapping.crmFieldName.trim().toLowerCase();
        if (customerFields.includes(crmFieldNameLower as any) || Object.keys(columnMapping).some(key => key.toLowerCase() === crmFieldNameLower)) {
            setError(`Custom CRM Field Name '${mapping.crmFieldName}' conflicts with a standard field name. Please use a unique name.`);
            return;
        }
    }
    const crmFieldNames = customFieldMappings.map(m => m.crmFieldName.trim()).filter(Boolean);
    if (new Set(crmFieldNames).size !== crmFieldNames.length) {
        setError("Custom CRM Field Names must be unique.");
        return;
    }


    if (parsedData.length > 0) {
        const firstRow = parsedData[0];
        const preview: Record<string, string> = {};

        customerFields.forEach(fieldKey => {
            const csvHeader = columnMapping[fieldKey];
            if (csvHeader && firstRow[csvHeader] !== undefined && firstRow[csvHeader] !== null) {
                preview[fieldKey] = String(firstRow[csvHeader]);
            } else if (csvHeader) { 
                preview[fieldKey] = "N/A in first row";
            } else { 
                preview[fieldKey] = "Not Mapped";
            }
        });
        
        customFieldMappings.forEach(mapping => {
            if (mapping.crmFieldName.trim() && mapping.csvColumnName && firstRow[mapping.csvColumnName] !== undefined && firstRow[mapping.csvColumnName] !== null) {
                 const dbKey = mapping.crmFieldName.trim().replace(/\s+/g, '_').toLowerCase();
                 preview[dbKey] = String(firstRow[mapping.csvColumnName]);
            } else if (mapping.crmFieldName.trim() && mapping.csvColumnName) {
                 const dbKey = mapping.crmFieldName.trim().replace(/\s+/g, '_').toLowerCase();
                 preview[dbKey] = "N/A in first row";
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
        } else if (!csvHeader && (field === "name" || field === "email")) {
            validRow = false; 
        }
      });

      if(!customerData.name || !customerData.email) {
          validRow = false;
      }

      if(validRow) {
          customFieldMappings.forEach(mapping => {
            if (mapping.crmFieldName.trim() && mapping.csvColumnName && row[mapping.csvColumnName] !== undefined && row[mapping.csvColumnName] !== null) {
                const key = mapping.crmFieldName.trim().replace(/\s+/g, '_').toLowerCase();
                (customerData as any)[key] = String(row[mapping.csvColumnName]);
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
      setCustomFieldMappings([]);
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
          Upload a CSV file, map its columns to CRM fields, and import customer data. 
          Only explicitly mapped columns (standard or custom) will be imported.
          Customers may be auto-assigned if their 'Category' (region) matches an employee's specialized region.
        </CardDescription>
      </CardHeader>

      {step === 1 && (
        <CardContent className="space-y-6 py-8">
          <div>
            <Label htmlFor="file-upload" className="text-md font-medium">1. Upload CSV File</Label>
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
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <StepForward className="mr-2 h-5 w-5" />}
            Parse File & Proceed to Mapping
          </Button>
        </CardContent>
      )}

      {step === 2 && headers.length > 0 && (
        <form onSubmit={(e) => { e.preventDefault(); handleProceedToReview(); }}>
          <CardContent className="space-y-8 py-8">
            <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">2. Map CSV Columns</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Select the CSV column for each standard CRM field (Name and Email are required).
                    Map your 'Country' or 'Region' CSV column to the 'Category' field for regional auto-assignment.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {customerFields.map(field => (
                        <div key={field} className="space-y-1 p-4 border rounded-lg bg-secondary/30 shadow-sm">
                        <Label htmlFor={`map-${field}`} className="text-sm font-medium capitalize">{formatPreviewKey(field)}{field === 'category' ? ' (for Region)' : ''}{field === 'name' || field === 'email' ? <span className="text-destructive">*</span> : ''}</Label>
                        <Select
                            onValueChange={(value) => handleMappingChange(field, value)}
                            value={columnMapping[field] || NONE_VALUE}
                            required={field === "name" || field === "email"}
                        >
                            <SelectTrigger id={`map-${field}`} className="w-full text-sm bg-background">
                            <SelectValue placeholder="Select CSV Column" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value={NONE_VALUE}>-- Not Mapped --</SelectItem>
                            {headers.map(header => (
                                <SelectItem key={header} value={header} className="text-sm">{header}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        {parsedData[0] && columnMapping[field] && (
                            <p className="text-xs text-muted-foreground truncate pt-1">
                                Preview (1st row): <span className="font-mono text-foreground/80">{String(parsedData[0][columnMapping[field]!]) || "N/A"}</span>
                            </p>
                        )}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Custom Field Mappings (Optional)</h3>
                 <p className="text-sm text-muted-foreground">
                    Map any other columns from your CSV to custom fields in the CRM. Provide a unique CRM Field Name for each.
                    Only explicitly mapped columns (standard or custom) will be imported.
                </p>
                {customFieldMappings.map((mapping, index) => (
                    <div key={mapping.id} className="flex flex-col md:flex-row items-start md:items-end gap-4 p-4 border rounded-lg bg-secondary/30 shadow-sm">
                        <div className="flex-1 w-full md:w-auto">
                            <Label htmlFor={`custom-crm-${mapping.id}`} className="text-sm font-medium">CRM Field Name <span className="text-destructive">*</span></Label>
                            <Input 
                                id={`custom-crm-${mapping.id}`}
                                value={mapping.crmFieldName}
                                onChange={(e) => updateCustomFieldMap(index, 'crmFieldName', e.target.value)}
                                placeholder="e.g., Company Size"
                                className="mt-1 text-sm bg-background"
                                required={!!mapping.csvColumnName}
                            />
                        </div>
                        <div className="flex-1 w-full md:w-auto">
                             <Label htmlFor={`custom-csv-${mapping.id}`} className="text-sm font-medium">CSV Column <span className="text-destructive">*</span></Label>
                            <Select
                                value={mapping.csvColumnName || NONE_VALUE}
                                onValueChange={(value) => updateCustomFieldMap(index, 'csvColumnName', value)}
                                required={!!mapping.crmFieldName.trim()}
                            >
                                <SelectTrigger id={`custom-csv-${mapping.id}`} className="w-full mt-1 text-sm bg-background">
                                    <SelectValue placeholder="Select CSV Column" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NONE_VALUE}>-- Not Mapped --</SelectItem>
                                    {headers.filter(h => 
                                        !Object.values(columnMapping).includes(h) && 
                                        !customFieldMappings.some((cfm, cfmIndex) => cfmIndex !== index && cfm.csvColumnName === h)
                                    ).map(header => (
                                        <SelectItem key={header} value={header} className="text-sm">{header}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomFieldMap(mapping.id)} aria-label="Remove custom mapping" className="text-destructive hover:text-destructive/80 mt-2 md:mt-0 self-center md:self-end">
                            <XCircle className="h-5 w-5" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={addCustomFieldMap} className="text-sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Custom Field Mapping
                </Button>
            </div>

            {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" onClick={() => {setStep(1); setError(null); setFirstRecordPreview(null);}} disabled={isLoading}>Back to Upload</Button>
            <Button type="submit" disabled={isLoading} className="text-lg py-3">
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
              Review & Import
            </Button>
          </CardFooter>
        </form>
      )}
      
      {step === 3 && (
          <>
            <CardContent className="space-y-6 py-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">3. Review & Confirm Import</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                      You are about to import <strong>{parsedData.length}</strong> customer record(s). 
                      Verify the data preview for the first record below.
                  </p>
                   {firstRecordPreview ? (
                    <div className="space-y-2 p-4 border rounded-lg bg-secondary/30 shadow-sm max-h-60 overflow-y-auto mb-6">
                      <h4 className="text-sm font-semibold text-foreground mb-2">Preview of First Record:</h4>
                      {Object.entries(firstRecordPreview).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-3 gap-2 text-sm items-start">
                          <span className="font-medium text-muted-foreground col-span-1 break-words">{formatPreviewKey(key)}:</span>
                          <span className="font-mono text-foreground col-span-2 break-all">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data to preview. Please ensure 'Name' and 'Email' fields are mapped and other mappings are correct in the previous step.</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="assign-employee" className="text-md font-medium">Default Assignee (Fallback)</Label>
                  <Select 
                      onValueChange={(value) => setDefaultSelectedEmployeeId(value)} 
                      value={defaultSelectedEmployeeId}
                  >
                      <SelectTrigger id="assign-employee" className="w-full md:w-1/2 mt-1 text-sm bg-background">
                          <SelectValue placeholder="Select default employee..." />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="unassigned" className="text-sm">Unassigned (or auto-assign by region)</SelectItem>
                          {employees.map((employee: User) => (
                              <SelectItem key={employee.id} value={employee.id} className="text-sm">
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
            <CardFooter className="flex justify-between border-t pt-6">
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
