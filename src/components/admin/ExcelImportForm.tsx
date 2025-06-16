
"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";
import type { MappedCustomerData, ExcelRowData } from "@/lib/types";
import { UploadCloud, AlertTriangle, CheckCircle, Loader2, ListChecks } from "lucide-react";
import Papa from 'papaparse'; // Using papaparse for CSV handling
import { useToast } from '@/hooks/use-toast';

// Define expected customer fields for mapping
const customerFields: (keyof MappedCustomerData)[] = ["name", "email", "phoneNumber", "category"];

export function ExcelImportForm() {
  const { addCustomer } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ExcelRowData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<keyof MappedCustomerData, string>>({} as Record<keyof MappedCustomerData, string>);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Map, 3: Review/Import
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== 'text/csv') {
          setError("Invalid file type. Please upload a CSV file.");
          setFile(null);
          return;
      }
      setFile(selectedFile);
      setError(null);
      setParsedData([]);
      setHeaders([]);
      setColumnMapping({} as Record<keyof MappedCustomerData, string>);
      setSuccessMessage(null);
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
          setError("Error parsing CSV file. Please check the file format.");
          console.error("CSV Parsing errors:", results.errors);
          setIsLoading(false);
          return;
        }
        if (results.data.length === 0 || !results.meta.fields) {
             setError("CSV file is empty or has no headers.");
             setIsLoading(false);
             return;
        }
        setParsedData(results.data);
        setHeaders(results.meta.fields);
        // Auto-map if headers match customerFields (case-insensitive)
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

  const handleImportData = (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validate mapping: ensure all required fields are mapped
    const requiredFieldsMapped = customerFields.every(field => !!columnMapping[field]);
    if(!requiredFieldsMapped) {
        setError("Please map all required customer fields (Name, Email, Phone Number, Category).");
        setIsLoading(false);
        return;
    }
    
    let importedCount = 0;
    parsedData.forEach(row => {
      const customerData: MappedCustomerData = {} as MappedCustomerData;
      let validRow = true;
      customerFields.forEach(field => {
        const csvHeader = columnMapping[field];
        if (csvHeader && row[csvHeader] !== undefined && row[csvHeader] !== null) {
          customerData[field] = String(row[csvHeader]);
        } else if (field === "name" || field === "email") { // Example: Name and email are essential
            validRow = false; // Skip row if essential data is missing
        }
      });

      if(validRow) {
          // Add any other columns as additional properties
          headers.forEach(header => {
              if (!Object.values(columnMapping).includes(header) && row[header] !== undefined && row[header] !== null) {
                  customerData[header.replace(/\s+/g, '_').toLowerCase()] = String(row[header]); // Sanitize header for key
              }
          });
          addCustomer(customerData);
          importedCount++;
      }
    });

    if (importedCount > 0) {
      setSuccessMessage(`${importedCount} customers imported successfully!`);
      toast({ title: "Import Successful", description: `${importedCount} customers imported.` });
      // Reset form state for next import
      setFile(null);
      setParsedData([]);
      setHeaders([]);
      setColumnMapping({} as Record<keyof MappedCustomerData, string>);
      setStep(1);
    } else {
      setError("No customers were imported. Check your data and mappings.");
      toast({ title: "Import Failed", description: "No customers were imported. Check data and mappings.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <UploadCloud className="mr-3 h-7 w-7 text-primary" /> Import Customer Data (CSV)
        </CardTitle>
        <CardDescription>Upload a CSV file, map columns, and import customer data into the CRM.</CardDescription>
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
        <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
          <CardContent className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Map CSV Columns to Customer Fields</h3>
            <p className="text-sm text-muted-foreground">
                Select the CSV column that corresponds to each customer field. 
                A preview of the first data row is shown below each mapping.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customerFields.map(field => (
                    <div key={field} className="space-y-2 p-4 border rounded-md bg-background/50">
                    <Label htmlFor={`map-${field}`} className="text-base font-medium capitalize">{field.replace(/([A-Z])/g, ' $1')}</Label>
                    <Select
                        onValueChange={(value) => handleMappingChange(field, value)}
                        defaultValue={columnMapping[field]}
                        required={field === "name" || field === "email"} // Example for required
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
            <Button variant="outline" onClick={() => {setStep(1); setError(null);}} disabled={isLoading}>Back to Upload</Button>
            <Button type="submit" disabled={isLoading} className="text-lg py-3">
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Review & Import
            </Button>
          </CardFooter>
        </form>
      )}
      
      {step === 3 && (
          <CardContent>
              <h3 className="text-xl font-semibold text-foreground mb-4">Review Import</h3>
              <p className="text-sm text-muted-foreground mb-2">
                  You are about to import <strong>{parsedData.length}</strong> records. 
                  The first record will be imported as follows (other records will follow the same mapping):
              </p>
              <div className="space-y-2 p-4 border rounded-md bg-secondary/50 max-h-60 overflow-y-auto">
                {parsedData.length > 0 && customerFields.map(field => {
                    const mappedHeader = columnMapping[field];
                    const value = mappedHeader ? String(parsedData[0][mappedHeader]) : "Not Mapped";
                    return (
                        <div key={field} className="flex justify-between text-sm">
                            <span className="font-medium capitalize text-muted-foreground">{field.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="font-mono text-foreground truncate max-w-[60%]">{value}</span>
                        </div>
                    );
                })}
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
            <Button variant="outline" onClick={() => {setStep(2); setError(null); setSuccessMessage(null);}} disabled={isLoading}>Back to Mapping</Button>
            <Button onClick={handleImportData} disabled={isLoading || !!successMessage} className="text-lg py-3">
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
                Confirm & Import Data
            </Button>
          </CardFooter>
      )}

    </Card>
  );
}

// Add PapaParse to your project: npm install papaparse
// And its types: npm install @types/papaparse --save-dev
// This is a client component, ensure it's used where client-side interactions are appropriate.
