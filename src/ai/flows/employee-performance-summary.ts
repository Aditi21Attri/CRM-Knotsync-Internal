'use server';

/**
 * @fileOverview A Genkit flow for summarizing employee performance.
 *
 * - employeePerformanceSummary - A function that generates a summary of an employee's performance.
 * - EmployeePerformanceSummaryInput - The input type for the employeePerformanceSummary function.
 * - EmployeePerformanceSummaryOutput - The return type for the employeePerformanceSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmployeePerformanceSummaryInputSchema = z.object({
  employeeId: z.string().describe('The ID of the employee to summarize performance for.'),
  customerInteractions: z.string().describe('A summary of customer interactions handled by the employee.'),
  immigrationOutcomes: z.string().describe('A summary of immigration outcomes achieved by the employee.'),
});

export type EmployeePerformanceSummaryInput = z.infer<typeof EmployeePerformanceSummaryInputSchema>;

const EmployeePerformanceSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the employee performance, including key metrics and areas for improvement.'),
});

export type EmployeePerformanceSummaryOutput = z.infer<typeof EmployeePerformanceSummaryOutputSchema>;

export async function employeePerformanceSummary(input: EmployeePerformanceSummaryInput): Promise<EmployeePerformanceSummaryOutput> {
  return employeePerformanceSummaryFlow(input);
}

const employeePerformanceSummaryPrompt = ai.definePrompt({
  name: 'employeePerformanceSummaryPrompt',
  input: {schema: EmployeePerformanceSummaryInputSchema},
  output: {schema: EmployeePerformanceSummaryOutputSchema},
  prompt: `You are an AI assistant helping HR to summarize employee performance.

  Given the following information about an employee, create a performance summary, highlighting key metrics and areas for improvement.

  Employee ID: {{{employeeId}}}
  Customer Interactions: {{{customerInteractions}}}
  Immigration Outcomes: {{{immigrationOutcomes}}}
  `,
});

const employeePerformanceSummaryFlow = ai.defineFlow(
  {
    name: 'employeePerformanceSummaryFlow',
    inputSchema: EmployeePerformanceSummaryInputSchema,
    outputSchema: EmployeePerformanceSummaryOutputSchema,
  },
  async input => {
    const {output} = await employeePerformanceSummaryPrompt(input);
    return output!;
  }
);
