import type { ReactNode } from "react";

interface SectionProps {
  tone?: "default" | "muted";
  bordered?: boolean;
  children: ReactNode;
}

const TONES = {
  default: "",
  muted: "bg-base-200/40",
} as const;

/** Structural wrapper: max-w-5xl outer, no prose. Use when the section's
 * primary content is grids or custom-styled blocks. Inline headings need
 * their own typography classes. */
export function Section({ tone = "default", bordered = true, children }: SectionProps) {
  const borderClass = bordered ? "border-t border-base-300" : "";
  return (
    <section className={`${borderClass} px-6 py-16 md:py-20 ${TONES[tone]}`}>
      <div className="max-w-5xl mx-auto">{children}</div>
    </section>
  );
}

/** Prose-wrapped section: max-w-5xl outer, inner max-w-3xl prose block
 * left-aligned. Markdown headings and paragraphs render with Tailwind
 * Typography defaults. The outer max-w-5xl keeps the left edge aligned
 * with grid sections. */
export function NarrowSection({ tone = "default", bordered = true, children }: SectionProps) {
  const borderClass = bordered ? "border-t border-base-300" : "";
  return (
    <section className={`${borderClass} px-6 py-16 md:py-20 ${TONES[tone]}`}>
      <div className="max-w-5xl mx-auto">
        <div className="max-w-3xl prose dark:prose-invert lg:prose-lg">{children}</div>
      </div>
    </section>
  );
}
