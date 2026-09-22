import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VoteExperience } from "../../../components/vote-experience";

type ResultsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const isValidSlug = (slug: string) => /^[a-z0-9-]{1,64}$/.test(slug);

export async function generateMetadata({ params }: ResultsPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: isValidSlug(slug) ? "みんなの結果 — FACE CHECK" : "FACE CHECK",
    description: "投票結果とアンケートをご覧いただけます。",
  };
}

export const dynamic = "force-dynamic";

export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  if (!isValidSlug(slug)) notFound();
  const debugResults = query.debug === "results";

  return (
    <main className="vote-page">
      <header className="vote-header content-width">
        <Link className="wordmark" href="/" aria-label="FACE CHECK トップ">
          <span className="wordmark-mark">FC</span>
          <span>FACE CHECK</span>
        </Link>
        <span className="vote-header-tag">RESULTS / COMMUNITY</span>
      </header>
      <VoteExperience targetSlug={slug} view="results" debugResults={debugResults} />
      <footer className="vote-footer">
        <span>FACE CHECK / STREET EDITION</span>
      </footer>
    </main>
  );
}
