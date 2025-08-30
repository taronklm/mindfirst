"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, Send, Bot, User2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      role: "assistant",
      content: "Hi! Ich bin MindFirst. Wie geht's dir heute?",
      createdAt: Date.now(),
    },
  ]);
  const [token, setHasToken] = useState<boolean>(false)

  useEffect(() => {
    const token = localStorage.getItem("token");
    setHasToken(!!token);
  }, []);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!viewportRef.current) return;
    viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
  }, [messages, isSending, isEscalated]);

  useEffect(() => {
    const stored = localStorage.getItem("chatHistory");
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);


  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: "demo" }),
      });

      if (!res.ok) {
        let errMsg = `Request failed with ${res.status}`;
        try {
          const err = await res.json();
          if (err?.error) errMsg = err.error;
        } catch {}
        throw new Error(errMsg);
      }

      const data: { reply?: string; escalation?: boolean } = await res.json();

      if (data.escalation === true) {
        setIsEscalated(true);
      }

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: typeof data?.reply === "string" ? data.reply : "",
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Ups, da ging gerade etwas schief. Versuch es bitte noch einmal.",
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
      console.error(e);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }, [input, isSending]);

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  if (!token) {
    return(
      <main className="min-h-screen bg-white text-foreground">
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <p>Bitte melde dich an, um den Chat zu nutzen.</p>
      </section>
    </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-foreground">
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <Card className="border-muted/50">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#4a9f76] text-white">
                <Bot className="h-5 w-5 bg-[#4a9f76]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold leading-tight">MindFirst</h2>
                <p className="text-sm text-muted-foreground">
                  Empathische Begleitung. Keine medizinische Beratung.
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString()}
            </div>
          </CardHeader>

          <Separator />

          {isEscalated && (
            <>
              <div className="mx-4 mt-3 mb-2 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900 sm:mx-6">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  Ich nehme starke Belastungszeichen wahr. Wenn es sich akut anfühlt:{" "}
                  <strong>112</strong> (Notfall) oder TelefonSeelsorge{" "}
                  <strong>0800 111 0 111 / 0800 111 0 222</strong> (24/7).
                </div>
              </div>
              <Separator />
            </>
          )}

          <CardContent className="p-0">
            <div
              ref={viewportRef}
              className="h-[55vh] overflow-y-auto px-4 py-4 sm:px-6"
              aria-live="polite"
            >
              <ul className="space-y-4">
                {messages.map((m) => (
                  <li key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <MessageBubble role={m.role} content={m.content} />
                  </li>
                ))}
                {isSending && (
                  <li className="flex justify-start">
                    <TypingBubble />
                  </li>
                )}
              </ul>
            </div>
          </CardContent>

          <Separator />
          <CardFooter className="gap-3">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Schreib mir, was dich beschäftigt… (Enter zum Senden, Shift+Enter für Zeilenumbruch)"
              className="min-h-[48px] resize-none"
            />
            <Button
              onClick={() => void sendMessage()}
              disabled={!canSend}
              className="shrink-0"
              aria-label="Nachricht senden"
            >
              {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Senden
            </Button>
          </CardFooter>
        </Card>
                
        <p className="mt-4 text-center text-xs text-muted-foreground">
          In akuten Krisen: Wende dich an regionale Notrufnummern oder Beratungsstellen. Die App ersetzt keine Therapie.
        </p>
      </section>
    </main>
  );
}

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div
      className={
        "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed sm:max-w-[75%] " +
        (isUser
          ? "rounded-br-sm bg-neutral-100 text-foreground"
          : "rounded-bl-sm bg-neutral-100 text-foreground")
      }
    >
      <div className={"flex items-start gap-2 " + (isUser ? "flex-row-reverse" : "flex-row")}>
        <div className="mt-0.5 hidden sm:block">
          {isUser ? <UserAvatar /> : <BotAvatar />}
        </div>
        <p className="whitespace-pre-wrap self-center">{typeof content === "string" ? content : ""}</p>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="max-w-[70%] rounded-2xl rounded-bl-sm bg-neutral-100 px-3 py-2 text-sm text-foreground">
      <div className="flex items-center gap-2">
        <BotAvatar />
        <span className="inline-flex items-center gap-1">
          <span className="animate-pulse">●</span>
          <span className="animate-pulse [animation-delay:150ms]">●</span>
          <span className="animate-pulse [animation-delay:300ms]">●</span>
        </span>
      </div>
    </div>
  );
}

function BotAvatar() {
  return (
    <div className="grid h-7 w-7 place-items-center rounded-md bg-[#4a9f76] text-white">
      <Bot className="h-4 w-4 bg-[#4a9f76]" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="grid h-7 w-7 place-items-center rounded-md bg-[#94d4a2] text-neutral-700">
      <User2 color="white" className="h-4 w-4 bg-[#94d4a2]" />
    </div>
  );
}
