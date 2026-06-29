import Link from "next/link";
import { content } from "@/data/content";

export function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-brand-accent/20 bg-brand-bg">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <img
          src="/logo-rect.svg"
          alt="על אוטומט"
          width={120}
          height={29}
          className="h-6 w-auto opacity-80"
        />
        <span className="text-slate-500 text-sm">{content.footer.tagline}</span>
        <div className="flex items-center gap-4">
          <Link
            href={content.footer.termsHref}
            className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
          >
            {content.footer.termsLabel}
          </Link>
          <span className="text-slate-600 text-sm">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
