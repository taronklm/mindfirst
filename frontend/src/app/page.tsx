"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-neutral-100">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center px-4 py-24 text-center sm:py-28">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          <span className="text-[#94d4a2]">Mind</span><span className="text-[#4a9f76]">First</span>
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl">
          Gespräche, die gut tun. Unterstützung, wenn du sie brauchst.
        </p>
        <div className="mt-10">
          <Button size="lg" asChild>
            <Link href="/chat">Los gehts!</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <Hero />
  );
}
