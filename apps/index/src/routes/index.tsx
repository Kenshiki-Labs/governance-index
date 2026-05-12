import { createFileRoute } from "@tanstack/react-router";

import { PageLayout } from "../components/PageLayout";
import { SEOHead } from "../components/SEOHead";
import HomeContent, { frontmatter as homeFrontmatter } from "../content/home/index.mdx";
import { deriveAeoPageModel } from "../lib/aeo/derive";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const aeo = deriveAeoPageModel({
    family: "home",
    path: "/",
    frontmatter: homeFrontmatter,
  });
  return (
    <>
      <SEOHead model={aeo} />
      <PageLayout>
        <HomeContent />
      </PageLayout>
    </>
  );
}
