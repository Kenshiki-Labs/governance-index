export function SiteFooter() {
  return (
    <footer className="border-t border-base-300 px-6 py-8 text-sm opacity-70">
      <div className="max-w-5xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="font-display font-semibold tracking-tight text-base leading-none">
            Kenshiki Labs
          </div>
          <div>© 2026 Kenshiki Labs, Inc. · Apache 2.0</div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a
            href="https://github.com/Kenshiki-Labs/governance-index"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-hover"
          >
            GitHub
          </a>
          <a
            href="https://github.com/Kenshiki-Labs/governance-index/tree/main/docs/specs"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-hover"
          >
            Specifications
          </a>
          <a
            href="https://github.com/Kenshiki-Labs/governance-index/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-hover"
          >
            License
          </a>
          <a
            href="https://kenshikilabs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-hover"
          >
            kenshikilabs.com
          </a>
        </div>
      </div>
    </footer>
  );
}
