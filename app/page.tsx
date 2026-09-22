import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-page home-page">
      <header className="home-header content-width">
        <Link className="home-wordmark" href="/" aria-label="CHECK トップページ">
          <span className="home-wordmark-mark" aria-hidden="true">✓</span>
          <span>CHECK</span>
        </Link>
      </header>

      <section className="home-hero content-width" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <p className="home-eyebrow">
            <span className="home-eyebrow-mark" aria-hidden="true" />
            QRでひらく、通りすがりの一票
          </p>
          <h1 className="home-title" id="home-title">
            今日の顔面、<span className="accent-word">どう？</span>
          </h1>
          <p className="home-description">
            服のQRコードを読み込んだ人が、あなたの顔に一票。結果は投票したあとに、その場でパーセント表示されます。
          </p>
          <Link className="home-cta" href="/vote/me">
            <span>投票ページをひらく</span>
            <span className="home-cta-icon" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
