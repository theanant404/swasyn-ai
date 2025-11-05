"use client";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "../ui/scroll-area";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FileUp, Loader2, File as FileIcon, X } from "lucide-react";
import { useState, useRef } from "react";
import * as pdfjs from "pdfjs-dist";
import Tesseract from "tesseract.js";

// Set worker source for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface UploadCardProps {
  onProcess: (extractedText: string) => void;
  isProcessing: boolean;
}

export default function UploadCard({
  onProcess,
  isProcessing,
}: UploadCardProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(
      (file) =>
        file.type.startsWith("image/") || file.type === "application/pdf"
    );
    if (validFiles.length !== newFiles.length) {
      toast.error(
        "Some files were not added because they are not images or PDFs."
      );
    }
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // This is necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const extractTextFromPdf = async (file: File) => {
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onload = async (event) => {
        if (!event.target?.result) return reject("Could not read PDF file");
        try {
          const pdf = await pdfjs.getDocument(
            event.target.result as ArrayBuffer
          ).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text +=
              content.items
                .map((item) => ("str" in item ? item.str : ""))
                .join(" ") + "\n";
          }
          resolve(text);
        } catch (error) {
          console.error("Error extracting text from PDF:", error);
          reject("Failed to extract text from PDF.");
        }
      };
      reader.onerror = () => reject("Failed to read file.");
      reader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromImage = async (file: File) => {
    try {
      const result = await Tesseract.recognize(file);
      return result.data.text;
    } catch (error) {
      console.error("Error extracting text from image:", error);
      throw new Error("Failed to extract text from image.");
    }
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one file to analyze.");
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(0);

    let allText = "";
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        let text = "";
        if (file.type.startsWith("image/")) {
          text = await extractTextFromImage(file);
        } else if (file.type === "application/pdf") {
          text = await extractTextFromPdf(file);
        }
        allText += text + "\n\n";
      } catch (error: any) {
        toast.error(
          `Error processing ${file.name}: ${
            error.message || "An unknown error occurred."
          }`
        );
      }
      setExtractionProgress(((i + 1) / files.length) * 100);
    }
    setIsExtracting(false);
    onProcess(allText);
  };

  return (
    <Card className="w-full max-w-lg text-center shadow-lg animate-fade-in">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
          <FileUp className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="mt-4 text-2xl">
          Upload Your Medical Report
        </CardTitle>
        <CardDescription className="pt-2">
          Upload one or more images or PDFs of your medical report. We&#39;ll
          use AI to simplify the complex terms into language you can understand.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "p-6 border-2 border-dashed border-border rounded-lg cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/10"
              : "hover:border-primary/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-sm text-muted-foreground">
            {isDragging
              ? "Drop files here"
              : "Drag & drop files here, or click to select"}
          </p>
        </div>
        {files.length > 0 && (
          <ScrollArea className="mt-4 h-32 w-full pr-4">
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <div className="flex items-center gap-2 text-sm truncate">
                    <FileIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        {(isExtracting || isProcessing) && (
          <div className="mt-4 space-y-2">
            <Progress value={isExtracting ? extractionProgress : 100} />
            <p className="text-sm text-muted-foreground">
              {isExtracting
                ? `Extracting text... (${Math.round(extractionProgress)}%)`
                : "Analyzing Report..."}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={handleAnalyze}
          disabled={files.length === 0 || isProcessing || isExtracting}
        >
          {isProcessing || isExtracting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {isExtracting ? "Extracting..." : "Analyzing..."}
            </>
          ) : (
            `Analyze ${files.length} File${files.length === 1 ? "" : "s"}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
