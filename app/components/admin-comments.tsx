"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type AdminComment = {
  id: string;
  created_at: string;
  choice: "good" | "bad";
  age_range: string | null;
  gender: string | null;
  comment: string | null;
};

type VoteStats = {
  total: number;
  good: number;
  bad: number;
  goodPercent: number;
  badPercent: number;
};

type CommentsResponse = {
  comments?: AdminComment[];
  voteStats?: VoteStats;
  error?: string;
};

type AdminStatus = "checking" | "login" | "ready" | "unconfigured" | "error";

const AGE_LABELS: Record<string, string> = {
  under_20: "10代以下",
  "20s": "20代",
  "30s": "30代",
  "40s": "40代",
  "50s": "50代",
  "60_plus": "60代以上",
  prefer_not_to_say: "回答しない",
};

const GENDER_LABELS: Record<string, string> = {
  woman: "女性",
  man: "男性",
  non_binary: "ノンバイナリー",
  other: "その他",
  prefer_not_to_say: "回答しない",
};

function label(value: string | null, labels: Record<string, string>) {
  return value ? labels[value] ?? value : "未回答";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}

export function AdminComments() {
  const [status, setStatus] = useState<AdminStatus>("checking");
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [voteStats, setVoteStats] = useState<VoteStats | null>(null);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  const loadComments = useCallback(async () => {
    setStatus("checking");
    setMessage("");
    try {
      const response = await fetch("/api/admin/comments", { cache: "no-store" });
      const data = (await response.json()) as CommentsResponse;
      if (response.status === 401) {
        setStatus("login");
        return;
      }
      if (data.error === "ADMIN_AUTH_NOT_CONFIGURED") {
        setStatus("unconfigured");
        return;
      }
      if (!response.ok) throw new Error(data.error ?? "コメントを読み込めませんでした。");
      setComments(data.comments ?? []);
      setVoteStats(data.voteStats ?? null);
      setStatus("ready");
    } catch {
      setMessage("コメントを読み込めませんでした。時間をおいて再読み込みしてください。");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsWorking(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };
      if (data.error === "ADMIN_AUTH_NOT_CONFIGURED") {
        setStatus("unconfigured");
        return;
      }
      if (response.status === 401) {
        setMessage("パスワードが違います。もう一度確認してください。");
        setStatus("login");
        return;
      }
      if (!response.ok) throw new Error(data.error ?? "ログインできませんでした。");
      setPassword("");
      await loadComments();
    } catch {
      setMessage("ログインできませんでした。通信を確認してもう一度お試しください。");
      setStatus("login");
    } finally {
      setIsWorking(false);
    }
  }

  async function logout() {
    setIsWorking(true);
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error("LOGOUT_FAILED");
      setComments([]);
      setVoteStats(null);
      setMessage("");
      setPassword("");
      setStatus("login");
    } catch {
      setMessage("ログアウトできませんでした。通信を確認してもう一度お試しください。");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <section className="admin-shell content-width">
      <div className="admin-intro">
        <p className="eyebrow"><span className="eyebrow-line" /> OWNER DASHBOARD</p>
        <h1>届いた<em>コメント</em></h1>
        <p>投票後アンケートで書かれたコメントを確認できます。</p>
      </div>

      <div className="admin-card">
        {status === "checking" && (
          <div className="admin-state" role="status">管理者ページを確認しています…</div>
        )}

        {status === "unconfigured" && (
          <div className="admin-state" role="alert">
            <strong>管理者パスワードが未設定です。</strong>
            <p>Vercel の Production 環境変数 <code>FACE_CHECK_ADMIN_PASSWORD</code> に32文字以上のパスワードを設定してください。</p>
          </div>
        )}

        {status === "login" && (
          <form className="admin-login" onSubmit={(event) => void login(event)}>
            <span className="survey-step">PRIVATE ACCESS</span>
            <h2>管理者ログイン</h2>
            <p>パスワードはブラウザには保存されません。</p>
            <label className="survey-field">
              <span>管理者パスワード</span>
              <input
                autoComplete="current-password"
                required
                minLength={32}
                maxLength={512}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {message && <p className="admin-message" role="alert">{message}</p>}
            <button className="small-button small-button-dark" type="submit" disabled={isWorking}>
              {isWorking ? "確認中…" : "ログイン"}
            </button>
          </form>
        )}

        {status === "error" && (
          <div className="admin-state" role="alert">
            <strong>{message}</strong>
            <button className="small-button small-button-dark" type="button" onClick={() => void loadComments()}>
              再読み込み
            </button>
          </div>
        )}

        {status === "ready" && (
          <>
            <div className="admin-toolbar">
              <p><strong>{comments.length}</strong> 件 <span>新しいコメントを最大250件表示</span></p>
              <div>
                <button className="small-button" type="button" onClick={() => void loadComments()} disabled={isWorking}>
                  再読み込み
                </button>
                <button className="small-button small-button-dark" type="button" onClick={() => void logout()} disabled={isWorking}>
                  ログアウト
                </button>
              </div>
            </div>
            {message && <p className="admin-message" role="alert">{message}</p>}
            {voteStats && (
              <section className="admin-vote-summary" aria-labelledby="admin-vote-summary-title">
                <div className="admin-vote-summary-heading">
                  <div>
                    <span className="admin-vote-summary-kicker">OVERALL VOTES</span>
                    <h2 id="admin-vote-summary-title">投票結果</h2>
                  </div>
                  <p className="admin-vote-total"><strong>{voteStats.total}</strong><span>票</span></p>
                </div>
                <div
                  className="admin-vote-bar"
                  role="img"
                  aria-label={`良い ${voteStats.goodPercent}%、${voteStats.good}票。悪い ${voteStats.badPercent}%、${voteStats.bad}票。`}
                >
                  <span className="admin-vote-bar-good" style={{ width: `${voteStats.goodPercent}%` }} />
                  <span className="admin-vote-bar-bad" style={{ width: `${voteStats.badPercent}%` }} />
                </div>
                <div className="admin-vote-stats">
                  <div className="admin-vote-stat">
                    <span className="admin-vote-dot admin-vote-dot-good" aria-hidden="true" />
                    <span className="admin-vote-stat-label">良い</span>
                    <strong>{voteStats.goodPercent}%</strong>
                    <small>{voteStats.good}票</small>
                  </div>
                  <div className="admin-vote-stat">
                    <span className="admin-vote-dot admin-vote-dot-bad" aria-hidden="true" />
                    <span className="admin-vote-stat-label">悪い</span>
                    <strong>{voteStats.badPercent}%</strong>
                    <small>{voteStats.bad}票</small>
                  </div>
                </div>
              </section>
            )}
            {comments.length === 0 ? (
              <div className="admin-empty">まだコメントはありません。</div>
            ) : (
              <div className="admin-comment-list">
                {comments.map((item) => (
                  <article className="admin-comment" key={item.id}>
                    <div className="admin-comment-meta">
                      <span>{item.choice === "good" ? "良い！" : "悪いかも"}</span>
                      <span>{label(item.age_range, AGE_LABELS)}</span>
                      <span>{label(item.gender, GENDER_LABELS)}</span>
                      <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
                    </div>
                    <p>{item.comment}</p>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
