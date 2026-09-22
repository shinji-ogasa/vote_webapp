import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VoteExperience } from "../../components/vote-experience";

type VotePageProps = {
  params: Promise<{ slug: string }>;
};

const isValidSlug = (slug: string) => /^[a-z0-9-]{1,64}$/.test(slug);

export async function generateMetadata({ params }: VotePageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: isValidSlug(slug) ? "この人の顔、どう？ — FACE CHECK" : "FACE CHECK",
    description: "良いか、悪いか。あなたの一票をどうぞ。",
  };
}

export const dynamic = "force-dynamic";

export default async function VotePage({ params }: VotePageProps) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();

  return (
    <main className="vote-page">
      <header className="vote-header content-width">
        <Link className="wordmark" href="/" aria-label="FACE CHECK トップ">
          <span className="wordmark-mark">FC</span>
          <span>FACE CHECK</span>
        </Link>
        <span className="vote-header-tag">ONE PERSON / ONE VOTE</span>
      </header>
      <VoteExperience targetSlug={slug} />
      <footer className="vote-footer">
        <span>FACE CHECK / STREET EDITION</span>
        <Link href="/">自分のQRをつくる ↗</Link>
      </footer>
    </main>
  );
}
