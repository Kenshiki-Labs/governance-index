import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="border-b border-base-300">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="font-display font-semibold tracking-tight text-xl leading-none opacity-90 hover:opacity-100 transition-opacity"
        >
          Kenshiki Labs
        </Link>
        <nav className="flex items-center gap-2 sm:gap-6 text-sm">
          <Link
            to="/specs"
            className="link link-hover opacity-80 hover:opacity-100"
            activeProps={{ className: "link link-hover opacity-100" }}
          >
            Specifications
          </Link>
          <a
            href="https://github.com/Kenshiki-Labs/governance-index"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-hover opacity-80 hover:opacity-100"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
