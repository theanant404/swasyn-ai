"use client";

import { type SimplifyMedicalJargonOutput } from "@/ai/flows/simplify-medical-jargon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  Stethoscope,
  FileText,
  Lightbulb,
  Volume2,
  Loader2,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { textToSpeechAction, translateReportAction } from "@/app/actions";
import { useState, useTransition } from "react";
import { Button } from "../ui/button";

import { toast } from "sonner";
import { supportedLanguages } from "@/lib/languages";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportDisplayProps {
  reportData: SimplifyMedicalJargonOutput;
  setReportData: (data: SimplifyMedicalJargonOutput) => void;
  originalReportData: SimplifyMedicalJargonOutput;
}

const questionsForDoctor = [
  "What do these results mean for my overall health?",
  "What is the long-term prognosis for this condition?",
  "Are there any lifestyle changes I should make?",
  "What are the next steps in my treatment plan?",
  "Are there any alternative treatment options I should consider?",
  "How can we monitor this moving forward?",
];

export default function ReportDisplay({
  reportData,
  setReportData,
  originalReportData,
}: ReportDisplayProps) {
  const [speakingSection, setSpeakingSection] = useState<string | null>(null);
  const [isTranslating, startTranslateTransition] = useTransition();

  const handleSpeak = async (text: string, section: string) => {
    if (speakingSection === section) {
      // Stop functionality would go here if we had a player instance
      setSpeakingSection(null);
      return;
    }
    setSpeakingSection(section);
    const result = await textToSpeechAction(text);
    if (result.error || !result.audioDataUri) {
      toast.error(result.error);
    } else {
      const audio = new Audio(result.audioDataUri);
      audio.play();
      audio.onended = () => setSpeakingSection(null);
    }
  };

  const handleTranslate = (languageCode: string) => {
    if (languageCode === "en") {
      setReportData(originalReportData);
      return;
    }

    startTranslateTransition(async () => {
      const result = await translateReportAction(
        originalReportData,
        languageCode
      );
      if (result.error || !result.data) {
        toast.error(result.error || "Failed to translate the report.");
      } else {
        setReportData(result.data);
      }
    });
  };

  const { summary, keyFindings, simplifiedReport } = reportData;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isTranslating}>
              {isTranslating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                "Translate"
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handleTranslate("en")}>
              English (Original)
            </DropdownMenuItem>
            {supportedLanguages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onSelect={() => handleTranslate(lang.code)}
              >
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Plain Language Summary</CardTitle>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleSpeak(summary, "summary")}
            disabled={!!speakingSection && speakingSection !== "summary"}
          >
            {speakingSection === "summary" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-base text-foreground/80 leading-relaxed">
            {summary}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Key Findings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {keyFindings}
          </div>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="border-none">
          <Card className="shadow-sm">
            <AccordionTrigger className="p-6 hover:no-underline">
              <div className="flex flex-row items-start gap-4 w-full justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-left">
                      Full Simplified Report
                    </CardTitle>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSpeak(simplifiedReport, "full-report")}
                className="mb-4"
                disabled={
                  !!speakingSection && speakingSection !== "full-report"
                }
              >
                {speakingSection === "full-report" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <div className="prose prose-blue dark:prose-invert max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {simplifiedReport}
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Questions to Ask Your Doctor</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {questionsForDoctor.map((q, i) => (
              <li key={i} className="text-base text-foreground/80">
                {q}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
