/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { saveChatTurn } from "@/lib/chatStore";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

const API_BASE = process.env.MF_API_BASE ?? "http://127.0.0.1:8000";

function extractAssistantText(data: any): string {
  return String(
    data?.reply ?? data?.answer ?? data?.content ?? data?.text ?? "[no content]"
  );
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const sessionId: string =
      rawBody?.sessionId ??
      rawBody?.session_id ??
      "unknown-session";

    const lastUser: string =
      (typeof rawBody?.message === "string" ? rawBody.message : undefined) ??
      (Array.isArray(rawBody?.messages)
        ? [...rawBody.messages].reverse().find((m: any) => m.role === "user")?.content
        : undefined) ??
      "";

    const backendBody =
      typeof rawBody?.message === "string" && rawBody?.session_id
        ? rawBody
        : { message: lastUser, session_id: sessionId };

    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendBody),
    });

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Backend Error", raw: text },
        { status: 502 }
      );
    }

    const isEscalation = data?.escalation === true || data?.escalation === "true";

    const assistantText = extractAssistantText(data);

    let userId: string | null = null;
    const auth = req.headers.get("authorization") || "";
    const [scheme, token] = auth.split(" ");
    if (scheme === "Bearer" && token) {
      try {
        const payload = verifyToken(token);
        userId = payload.sub;
      } catch {
        userId = null;
      }
    }

    if (sessionId && lastUser) {
      await saveChatTurn({
        sessionId,
        userId,
        userMessage: lastUser,
        assistantMessage: assistantText,
        escalation: isEscalation,
        reason: isEscalation ? "auto-detected" : undefined,
      });
    }

    if (isEscalation) {
      const origin = req.nextUrl.origin;
      const alertRes = await fetch(`${origin}/api/alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: auth,
        },
        body: JSON.stringify({
          sessionId,
          lastUserMessage: lastUser || "[empty]",
        }),
      });

      if (!alertRes.ok) {
        const errTxt = await alertRes.text().catch(() => "");
        console.error("Alert POST failed:", alertRes.status, errTxt);
      }
    }

    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("Proxy-Error", e);
    return NextResponse.json(
      { error: "Proxy-Error", detail: String(e) },
      { status: 500 }
    );
  }
}
