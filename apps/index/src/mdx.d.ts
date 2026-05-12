/// <reference types="mdx" />

declare module "*.mdx" {
  import type { ComponentType } from "react";

  const MDXComponent: ComponentType;
  export default MDXComponent;
}

declare module "@specs/*.mdx" {
  import type { ComponentType } from "react";

  const MDXComponent: ComponentType;
  export default MDXComponent;
}
