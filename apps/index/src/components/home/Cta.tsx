import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface CtaProps {
  heading: ReactNode;
  primaryHref: "/specs" | "/reports/sample" | "/";
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function Cta({
  heading,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: CtaProps) {
  return (
    <div className="max-w-3xl mx-auto text-center not-prose">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">{heading}</h2>
      <div className="flex flex-wrap gap-3 justify-center mt-8">
        <Link to={primaryHref} className="btn btn-primary">
          {primaryLabel}
        </Link>
        {secondaryHref ? (
          <a
            href={secondaryHref}
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            {secondaryLabel}
          </a>
        ) : null}
      </div>
    </div>
  );
}
