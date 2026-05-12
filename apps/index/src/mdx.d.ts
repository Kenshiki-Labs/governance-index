/// <reference types="mdx" />

declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { AeoFrontmatter } from "@/lib/aeo/types";

  const MDXComponent: ComponentType;
  export const frontmatter: AeoFrontmatter | undefined;
  export default MDXComponent;
}

declare module "@specs/*.mdx" {
  import type { ComponentType } from "react";
  import type { AeoFrontmatter } from "@/lib/aeo/types";

  const MDXComponent: ComponentType;
  export const frontmatter: AeoFrontmatter | undefined;
  export default MDXComponent;
}
