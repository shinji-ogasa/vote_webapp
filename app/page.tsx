import Link from "next/link";
import { QrCard } from "./components/qr-card";

const steps = [
  ["01", "QRをつくる", "このページのQRを画像保存して、服やカードにプリント。"],
  ["02", "すれ違う", "気になった人がスマホで読み込むだけ。アプリ不要。"],
  ["03", "一票が集まる", "「良い / 悪い」の割合がリアルタイムに更新される。"],
];

export default function HomePage() {
  return (
    <main className="landing-page">
      <header className="site-header content-width">
        <Link className="wordmark" href="/" aria-label="FACE CHECK トップ">
          <span className="wordmark-mark">FC</span>
          <span>FACE CHECK</span>
        </Link>
        <div className="header-note">
          <span className="status-dot" />
          STREET EDITION / 001
        </div>
      </header>

      <section className="hero content-width">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            QRでひらく、通りすがりの一票
          </p>
          <h1>
            今日の顔面、
            <span className="accent-word">どう？</span>
          </h1>
          <p className="hero-description">
            服のQRコードを読み込んだ人が、あなたの顔に一票。結果は投票したあとに、その場でパーセント表示されます。
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/vote/me">
              投票ページをひらく
              <span aria-hidden="true">↗</span>
            </Link>
            <a className="text-link" href="#how-it-works">
              しくみを見る <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-details" aria-label="サービスの特徴">
            <div>
              <strong>2択</strong>
              <span>良い / 悪い</span>
            </div>
            <div>
              <strong>0 app</strong>
              <span>ブラウザだけ</span>
            </div>
            <div>
              <strong>LIVE</strong>
              <span>すぐ集計</span>
            </div>
          </div>
        </div>

        <div className="hero-art" aria-label="FACE CHECK のイメージ" role="img">
          <div className="hero-sticker sticker-top">RATE<br />MY FACE</div>
          <div className="hero-poster">
            <div className="poster-topline">
              <span>FC / 001</span>
              <span>NO FILTER</span>
            </div>
            <div className="poster-face" aria-hidden="true">
              <span className="face-eye face-eye-left" />
              <span className="face-eye face-eye-right" />
              <span className="face-brow face-brow-left" />
              <span className="face-brow face-brow-right" />
              <span className="face-nose" />
              <span className="face-mouth" />
            </div>
            <div className="poster-title">GOOD<br /><span>OR NOT?</span></div>
            <div className="poster-bottomline">
              <span>SCAN / VOTE / REPEAT</span>
              <span className="poster-arrow">↗</span>
            </div>
          </div>
          <div className="hero-sticker sticker-bottom">BE<br />HONEST.</div>
          <div className="art-scribble scribble-one">✳</div>
          <div className="art-scribble scribble-two">↘</div>
        </div>
      </section>

      <section className="how-section content-width" id="how-it-works">
        <div className="section-heading">
          <p className="eyebrow"><span className="eyebrow-line" /> 3 STEPS</p>
          <h2>服に貼ったら、<br /><em>あとは待つだけ。</em></h2>
        </div>
        <div className="step-grid">
          {steps.map(([number, title, description]) => (
            <article className="step-card" key={number}>
              <span className="step-number">{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="share-section content-width">
        <div className="share-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> READY TO WEAR</p>
          <h2>まずは自分のQRを<br /><em>つくってみる。</em></h2>
          <p>下のQRを保存して、そのまま服・ステッカー・名刺に使えます。投票URLはあとから変わりません。</p>
        </div>
        <QrCard />
      </section>

      <footer className="site-footer content-width">
        <span>FACE CHECK / MADE FOR A LITTLE COURAGE</span>
        <span>© 2026</span>
      </footer>
    </main>
  );
}
