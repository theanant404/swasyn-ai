"use server";

import {
  simplifyMedicalJargon,
  type SimplifyMedicalJargonOutput,
} from "@/ai/flows/simplify-medical-jargon";
// import { answerQuestionsAboutReport } from "../ai/flows/answer-questions-about-report";
// import { textToSpeech } from "../ai/flows/text-to-speech";
// import { translateText } from "../ai/flows/translate-text";
import { answerQuestionsAboutReport } from "@/ai/flows/answer-questions-about-report";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { translateText } from "@/ai/flows/translate-text";

export async function processReportAction(
  reportText: string
): Promise<{ data: SimplifyMedicalJargonOutput | null; error: string | null }> {
  try {
    const simplifiedReport = await simplifyMedicalJargon({ reportText });
    return { data: simplifiedReport, error: null };
  } catch (e: any) {
    console.error("Error simplifying report:", e);
    return { data: null, error: e.message || "Failed to process the report." };
  }
}

export async function sendMessageAction(
  reportText: string,
  question: string
): Promise<{ answer: string | null; error: string | null }> {
  try {
    const response = await answerQuestionsAboutReport({ reportText, question });
    return { answer: response.answer, error: null };
  } catch (e: any) {
    console.error("Error getting answer:", e);
    return { answer: null, error: e.message || "Failed to get an answer." };
  }
}

export async function textToSpeechAction(
  text: string
): Promise<{ audioDataUri: string | null; error: string | null }> {
  try {
    const response = await textToSpeech({ text });
    return { audioDataUri: response.audioDataUri, error: null };
  } catch (e: any) {
    console.error("Error converting text to speech:", e);
    return {
      audioDataUri: null,
      error: e.message || "Failed to convert text to speech.",
    };
  }
}

export async function translateReportAction(
  reportData: SimplifyMedicalJargonOutput,
  targetLanguage: string
): Promise<{ data: SimplifyMedicalJargonOutput | null; error: string | null }> {
  try {
    const [summary, keyFindings, simplifiedReport] = await Promise.all([
      translateText({ text: reportData.summary, targetLanguage }),
      translateText({ text: reportData.keyFindings, targetLanguage }),
      translateText({ text: reportData.simplifiedReport, targetLanguage }),
    ]);

    return {
      data: {
        summary: summary.translatedText,
        keyFindings: keyFindings.translatedText,
        simplifiedReport: simplifiedReport.translatedText,
      },
      error: null,
    };
  } catch (e: any) {
    console.error("Error translating report:", e);
    return {
      data: null,
      error: e.message || "Failed to translate the report.",
    };
  }
}
