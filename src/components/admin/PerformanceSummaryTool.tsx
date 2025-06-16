
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { employeePerformanceSummary, type EmployeePerformanceSummaryInput, type EmployeePerformanceSummaryOutput } from "@/ai/flows/employee-performance-summary";
import { useData } from "@/contexts/DataContext";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

const performanceSummarySchema = z.object({
  employeeId: z.string().min(1, { message: "Please select an employee." }),
  customerInteractions: z.string().min(10, { message: "Please provide a summary of customer interactions (min 10 characters)." }).max(2000, { message: "Max 2000 characters."}),
  immigrationOutcomes: z.string().min(10, { message: "Please provide a summary of immigration outcomes (min 10 characters)." }).max(2000, { message: "Max 2000 characters."}),
});

type PerformanceSummaryFormValues = z.infer<typeof performanceSummarySchema>;

export function PerformanceSummaryTool() {
  const { employees } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<EmployeePerformanceSummaryOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PerformanceSummaryFormValues>({
    resolver: zodResolver(performanceSummarySchema),
    defaultValues: {
      employeeId: "",
      customerInteractions: "",
      immigrationOutcomes: "",
    },
  });

  async function onSubmit(data: PerformanceSummaryFormValues) {
    setIsLoading(true);
    setSummaryResult(null);
    setError(null);
    try {
      const result = await employeePerformanceSummary(data);
      setSummaryResult(result);
    } catch (e) {
      console.error("Error generating performance summary:", e);
      setError(e instanceof Error ? e.message : "An unknown error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <Sparkles className="mr-3 h-7 w-7 text-accent" /> AI Employee Performance Summary
        </CardTitle>
        <CardDescription>
          Generate an AI-powered performance summary for an employee based on their customer interactions and outcomes.
          (Note: This tool uses a GenAI flow specific to immigration scenarios as per initial setup.)
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Select Employee</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-base">
                        <SelectValue placeholder="Choose an employee..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id} className="text-base">
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerInteractions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Customer Interactions Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the employee's key customer interactions, communication quality, problem-solving skills, etc."
                      className="resize-y min-h-[120px] text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="immigrationOutcomes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Key Outcomes / Achievements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detail the employee's successes, challenges, case resolutions, or other relevant outcomes (e.g., successful immigrations, client retention)."
                      className="resize-y min-h-[120px] text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
            <Button type="submit" disabled={isLoading} className="w-full text-lg py-3">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Generate Summary
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Generating Summary</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </form>
      </Form>

      {summaryResult && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-3 font-headline text-primary">Generated Performance Summary:</h3>
          <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted/30">
            <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{summaryResult.summary}</pre>
          </ScrollArea>
        </div>
      )}
    </Card>
  );
}
