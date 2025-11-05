"use server";

/**
 * @fileOverview This file contains a Genkit flow that simplifies medical jargon in a medical report.
 *
 * - simplifyMedicalJargon - A function that simplifies medical jargon in a medical report.
 * - SimplifyMedicalJargonInput - The input type for the simplifyMedicalJargon function.
 * - SimplifyMedicalJargonOutput - The return type for the simplifyMedicalJargon function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const SimplifyMedicalJargonInputSchema = z.object({
  reportText: z
    .string()
    .describe("The extracted text content of the medical report."),
});
export type SimplifyMedicalJargonInput = z.infer<
  typeof SimplifyMedicalJargonInputSchema
>;

const SimplifyMedicalJargonOutputSchema = z.object({
  simplifiedReport: z
    .string()
    .describe(
      "The medical report simplified into plain, easy-to-understand language."
    ),
  summary: z
    .string()
    .describe("A short summary of the simplified medical report."),
  keyFindings: z
    .string()
    .describe("Key findings extracted from the medical report."),
});
export type SimplifyMedicalJargonOutput = z.infer<
  typeof SimplifyMedicalJargonOutputSchema
>;

export async function simplifyMedicalJargon(
  input: SimplifyMedicalJargonInput
): Promise<SimplifyMedicalJargonOutput> {
  return simplifyMedicalJargonFlow(input);
}

const simplifyMedicalJargonPrompt = ai.definePrompt({
  name: "simplifyMedicalJargonPrompt",
  input: { schema: SimplifyMedicalJargonInputSchema },
  output: { schema: SimplifyMedicalJargonOutputSchema },
  prompt: `You are an AI expert in simplifying complex medical jargon in medical reports into plain, easy-to-understand language.

  Your goal is to help users understand their health information by providing a simplified version of their medical report. Also extract Key findings and summery from report.

  Please simplify the following medical report:

  Report Text: {{{reportText}}}

  Follow best practices for no-harm generation and prioritize patient understanding.

  Ensure the output is well-structured, including a summary, key findings, and potential questions to ask the doctor.

  Output the simplified report, summary, and key findings in a JSON format.
  `,
});

const simplifyMedicalJargonFlow = ai.defineFlow(
  {
    name: "simplifyMedicalJargonFlow",
    inputSchema: SimplifyMedicalJargonInputSchema,
    outputSchema: SimplifyMedicalJargonOutputSchema,
  },
  async (input) => {
    const { output } = await simplifyMedicalJargonPrompt(input);
    return output!;
  }
);
