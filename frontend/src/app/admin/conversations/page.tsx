"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Row = {
  _id: string;
  sessionId: string;
  userId: string | null;
  flagged: boolean;
  escalatedAt?: string;
  lastMessageAt: string;
  lastSnippet: string;
};

export default function FlaggedConversationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const load = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/admin/conversations", { headers: { authorization: `Bearer ${token}` }});
    const json = await res.json();
    setRows(json.conversations ?? []);
  }, [token]);

  useEffect(() => { load(); const id = setInterval(load, 10000); return () => clearInterval(id); }, [load]);

  async function unflag(id: string) {
    if (!token) return;
    await fetch(`/api/admin/conversations/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ flagged: false }),
    });
    load();
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Geflaggte Chats</h1>
      <div className="space-y-3">
        {rows.map(r => (
          <div key={r._id} className="rounded border p-3">
            <div className="text-sm text-muted-foreground">
              Session {r.sessionId} • {new Date(r.lastMessageAt).toLocaleString()}
            </div>
            <p className="text-[13px] mt-1 break-words">{r.lastSnippet}</p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" asChild><Link href={`/admin/conversations/${r._id}`}>Details</Link></Button>
              <Button size="sm" variant="secondary" onClick={() => unflag(r._id)}>Unflag</Button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Keine geflaggten Chats</p>}
      </div>
    </div>
  );
}
