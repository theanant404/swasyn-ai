"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Loader2, MessageCircle, Send, Sparkles } from "lucide-react";
import React, {
  useState,
  useTransition,
  useRef,
  useEffect,
  type FormEvent,
} from "react";
import { sendMessageAction } from "@/app/actions";
// import type { ChatMessage } from "@/app/page";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  reportText: string;
}

export default function ChatInterface({
  chatMessages,
  setChatMessages,
  reportText,
}: ChatInterfaceProps) {
  const [isReplying, startReplyingTransition] = useTransition();
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatMessages]);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isReplying) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setChatMessages((prev) => [...prev, userMessage]);
    setInput("");

    startReplyingTransition(async () => {
      const result = await sendMessageAction(reportText, input);
      if (result.error || !result.answer) {
        toast.error(result.error || "The AI could not provide an answer.");
        setChatMessages((prev) => prev.slice(0, prev.length - 1)); // remove user message on error
      } else {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: result.answer,
        };
        setChatMessages((prev) => [...prev, assistantMessage]);
      }
    });
  };

  return (
    <Card className="shadow-lg h-full flex flex-col max-h-[80vh] lg:max-h-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <MessageCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <CardTitle>Ask Swasyn</CardTitle>
          <CardDescription>Ask questions about your report</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl p-3 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isReplying && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-xl p-3 text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground italic">
                    Swasyn is typing...
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <form
          onSubmit={handleSendMessage}
          className="flex w-full items-center gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., What is hyperglycemia?"
            className="min-h-0 resize-none"
            rows={1}
            disabled={isReplying}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as any);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isReplying || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
