import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/PageLayout";
import HomeContent from "../content/home/index.mdx";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <PageLayout>
      <HomeContent />
    </PageLayout>
  );
}
