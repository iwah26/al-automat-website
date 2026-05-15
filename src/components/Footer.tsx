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
        <span className="text-slate-600 text-sm">© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
