import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} MindFirst</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground">Datenschutz</Link>
          <Link href="/imprint" className="hover:text-foreground">Impressum</Link>
        </div>
      </div>
    </footer>
  );
}