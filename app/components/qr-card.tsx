"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";

export function QrCard() {
  const [voteUrl, setVoteUrl] = useState("https://your-domain.example/vote/me");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVoteUrl(`${window.location.origin}/vote/me`);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(voteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function downloadQr() {
    if (!qrRef.current) return;
    const svg = new XMLSerializer().serializeToString(qrRef.current);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "face-check-qr.svg";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="qr-card">
      <div className="qr-frame">
        <QRCodeSVG ref={qrRef} value={voteUrl} size={176} level="M" bgColor="#fffdf9" fgColor="#171619" includeMargin />
      </div>
      <div className="qr-info">
        <span className="qr-label">YOUR VOTE LINK</span>
        <code>{voteUrl.replace(/^https?:\/\//, "")}</code>
        <p>保存したQRを服やステッカーに。読み込むと投票ページが開きます。</p>
        <div className="qr-actions">
          <button className="small-button small-button-dark" type="button" onClick={downloadQr}>QRを保存</button>
          <button className="small-button" type="button" onClick={copyUrl}>{copied ? "コピーした！" : "URLをコピー"}</button>
        </div>
      </div>
    </div>
  );
}
