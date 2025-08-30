"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

type AlertItem = {
  _id: string;
  userEmail?: string;
  sessionId: string;
  lastUserMessage: string;
  status: "new" | "acknowledged" | "closed";
  createdAt: string;
};

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await fetch("/api/admin/alerts", { headers: { authorization: `Bearer ${token}` }});
    const json = await res.json();
    setAlerts(json.alerts ?? []);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); const id = setInterval(load, 10000); return () => clearInterval(id); }, [load]);

  async function setStatus(id: string, status: AlertItem["status"]) {
    if (!token) return;
    await fetch("/api/admin/alerts", {
      method: "PATCH",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Alerts</h1>
      {loading && <p className="text-sm text-muted-foreground">Lade…</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {alerts.map(a => (
          <Card key={a._id}>
            <CardHeader>
              <div className="text-sm text-muted-foreground">
                {a.userEmail ?? "Gast"} • {new Date(a.createdAt).toLocaleString()}
              </div>
              <div className="text-[13px] break-words">{a.lastUserMessage}</div>
            </CardHeader>
            <CardContent className="flex gap-2">
              {a.status !== "acknowledged" && <Button size="sm" onClick={() => setStatus(a._id,"acknowledged")}>Bestätigen</Button>}
              {a.status !== "closed" && <Button size="sm" variant="secondary" onClick={() => setStatus(a._id,"closed")}>Schließen</Button>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
