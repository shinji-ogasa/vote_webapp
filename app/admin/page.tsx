import type { Metadata } from "next";
import Link from "next/link";
import { AdminComments } from "../components/admin-comments";

export const metadata: Metadata = {
  title: "管理者ページ — FACE CHECK",
  description: "FACE CHECK のアンケートコメント管理ページです。",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <main className="admin-page">
      <header className="vote-header content-width">
        <Link className="wordmark" href="/" aria-label="FACE CHECK トップ">
          <span className="wordmark-mark">FC</span>
          <span>FACE CHECK</span>
        </Link>
        <span className="vote-header-tag">PRIVATE / OWNER</span>
      </header>
      <AdminComments />
      <footer className="vote-footer">
        <span>FACE CHECK / PRIVATE ADMIN</span>
      </footer>
    </main>
  );
}
