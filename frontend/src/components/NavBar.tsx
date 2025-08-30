"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const LOGO_SRC = "/mindfirst-icon.png";

export function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <Link href="/" className="flex items-center">
      <Image src={LOGO_SRC} alt="MindFirst" width={48} height={48} priority />
      {withText && (
        <span className="text-lg font-semibold tracking-tight">MindFirst</span>
      )}
    </Link>
  );
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Chat", href: "/chat" },
  { label: "About", href: "/about" },
  { label: "Resources", href: "/ressources" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
      {NAV_LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              className={
                "rounded-md px-2 py-1 text-sm transition-colors hover:text-foreground " +
                (active ? "text-foreground" : "text-muted-foreground")
              }
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
  }

export default function NavBar() {
  const [hasToken, setHasToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setHasToken(!!token);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setHasToken(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden md:block">
            <NavLinks />
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {!hasToken ? (
            <>
              <Button variant="outline" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          ) : (
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
