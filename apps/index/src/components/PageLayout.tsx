import type { ReactNode } from "react";

import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
