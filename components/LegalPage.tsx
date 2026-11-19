import Link from "next/link";
import { Logo } from "./Logo";
import { PublicFooter } from "./PublicFooter";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <main id="main-content" className="flex-1">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <Logo size={30} />
              <span className="font-serif font-bold">StaffBase</span>
            </Link>
          </div>
        </header>
        <article className="legal mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-bold text-text">{title}</h1>
          <p className="mt-1 text-xs uppercase tracking-wide text-text-2">Редакция от {updated}</p>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-text">{children}</div>
        </article>
      </main>
      <PublicFooter />
    </>
  );
}
