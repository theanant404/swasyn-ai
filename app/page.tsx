"use client";

import { type SimplifyMedicalJargonOutput } from "@/ai/flows/simplify-medical-jargon";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { HeartPulse, Download } from "lucide-react";
import { useState, useTransition, useRef } from "react";
import { processReportAction } from "./actions";
import UploadCard from "@/components/swasyn-ai/UploadCard";
import ReportDisplay from "@/components/swasyn-ai/ReportDisplay";
import ChatInterface from "@/components/swasyn-ai/ChatInterface";

// export interface ChatMessage {
//   role: "user" | "assistant";
//   content: string;
// }
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  // const { toast } = useToast();
  const [reportData, setReportData] =
    useState<SimplifyMedicalJargonOutput | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isProcessingReport, startProcessReportTransition] = useTransition();

  const originalReportText = useRef("");
  const originalReportData = useRef<SimplifyMedicalJargonOutput | null>(null);

  const handleProcessReport = (extractedText: string) => {
    if (!extractedText.trim()) {
      toast.error(
        "Could not extract any text from the uploaded files. Please try different files."
      );
      return;
    }
    originalReportText.current = extractedText;
    startProcessReportTransition(async () => {
      const result = await processReportAction(originalReportText.current);
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setReportData(result.data);
        originalReportData.current = result.data;
        setChatMessages([
          {
            role: "assistant",
            content:
              "Hello! I've analyzed your report. Feel free to ask me any questions about it.",
          },
        ]);
      }
    });
  };

  const handleReset = () => {
    setReportData(null);
    originalReportData.current = null;
    setChatMessages([]);
    originalReportText.current = "";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Swasyn</h1>
            </div>
            {reportData && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.info(
                      "PDF downloads will be available in a future update."
                    );
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
                <Button onClick={handleReset}>Analyze New Report</Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {!reportData ? (
          <div className="flex items-center justify-center h-full pt-16">
            <UploadCard
              onProcess={handleProcessReport}
              isProcessing={isProcessingReport}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <ReportDisplay
                reportData={reportData}
                setReportData={setReportData}
                originalReportData={originalReportData.current!}
              />
            </div>
            <div className="lg:col-span-1 lg:mt-0 mt-8">
              <ChatInterface
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
                reportText={originalReportText.current}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="py-4 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          Swasyn is an AI-powered tool and does not provide medical advice.
          Consult with a qualified healthcare professional for any medical
          concerns.
        </div>
      </footer>
    </div>
  );
}
