'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering user questions about a medical report.
 *
 * The flow takes a medical report and a user question as input, and returns an AI-powered answer based on the report's content.
 *
 * @exported answerQuestionsAboutReport - The main function to call to get an answer to a question about a report.
 * @exported AnswerQuestionsAboutReportInput - The input type for the answerQuestionsAboutReport function.
 * @exported AnswerQuestionsAboutReportOutput - The output type for the answerQuestionsAboutReport function.
 */

import {ai} from '../genkit';
import {z} from 'genkit';

const AnswerQuestionsAboutReportInputSchema = z.object({
  reportText: z
    .string()
    .describe('The extracted text content of the medical report.'),
  question: z.string().describe('The user question about the medical report.'),
});
export type AnswerQuestionsAboutReportInput = z.infer<
  typeof AnswerQuestionsAboutReportInputSchema
>;

const AnswerQuestionsAboutReportOutputSchema = z.object({
  answer: z.string().describe('The AI-powered answer to the user question.'),
});
export type AnswerQuestionsAboutReportOutput = z.infer<
  typeof AnswerQuestionsAboutReportOutputSchema
>;

export async function answerQuestionsAboutReport(
  input: AnswerQuestionsAboutReportInput
): Promise<AnswerQuestionsAboutReportOutput> {
  return answerQuestionsAboutReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsAboutReportPrompt',
  input: {schema: AnswerQuestionsAboutReportInputSchema},
  output: {schema: AnswerQuestionsAboutReportOutputSchema},
  prompt: `You are a medical AI assistant.  Use the following medical report to answer the user's question.

Medical Report:
{{reportText}}

Question:
{{question}}

Answer:
`,
});

const answerQuestionsAboutReportFlow = ai.defineFlow(
  {
    name: 'answerQuestionsAboutReportFlow',
    inputSchema: AnswerQuestionsAboutReportInputSchema,
    outputSchema: AnswerQuestionsAboutReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
