"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center bg-white text-center px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Die Seite, die du suchst, konnte nicht gefunden werden.
      </p>
      <Button asChild>
        <Link href="/">Zur Startseite</Link>
      </Button>
    </main>
  );
}
