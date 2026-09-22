"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type VoteChoice = "good" | "bad";

type VoteResults = {
  good: number;
  bad: number;
  total: number;
  goodPercent: number;
  badPercent: number;
  hasVoted: boolean;
  surveySubmitted: boolean;
  alreadyVoted?: boolean;
};

type VoteExperienceProps = {
  targetSlug: string;
  view: "vote" | "results";
  debugResults?: boolean;
};

const DEBUG_RESULTS: VoteResults = {
  good: 146,
  bad: 68,
  total: 214,
  goodPercent: 68,
  badPercent: 32,
  hasVoted: true,
  surveySubmitted: false,
};

const AGE_RANGES = [
  ["under_20", "10代以下"],
  ["20s", "20代"],
  ["30s", "30代"],
  ["40s", "40代"],
  ["50s", "50代"],
  ["60_plus", "60代以上"],
  ["prefer_not_to_say", "回答しない"],
] as const;

const GENDERS = [
  ["woman", "女性"],
  ["man", "男性"],
  ["non_binary", "ノンバイナリー"],
  ["other", "その他"],
  ["prefer_not_to_say", "回答しない"],
] as const;

export function VoteExperience({ targetSlug, view, debugResults = false }: VoteExperienceProps) {
  const router = useRouter();
  const [results, setResults] = useState<VoteResults | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [surveyAgeRange, setSurveyAgeRange] = useState("");
  const [surveyGender, setSurveyGender] = useState("");
  const [surveyComment, setSurveyComment] = useState("");
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);
  const [surveyMessage, setSurveyMessage] = useState("");
  const [notice, setNotice] = useState("");
  const votePath = `/vote/${encodeURIComponent(targetSlug)}`;
  const resultsPath = `${votePath}/results`;

  const loadResults = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch(`/api/votes?target=${encodeURIComponent(targetSlug)}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as VoteResults & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "結果を読み込めませんでした。");
      setResults(data);
      setHasVoted(Boolean(data.hasVoted));
      setSurveySubmitted(Boolean(data.surveySubmitted));
      setNotice(data.hasVoted && view === "results" ? "この端末からは投票済みです。" : "");
      setStatus("ready");
      if (data.hasVoted && view === "vote") {
        router.replace(resultsPath);
      } else if (!data.hasVoted && view === "results") {
        router.replace(votePath);
      }
    } catch {
      setStatus("error");
      setNotice("投票サーバーに接続できません。環境変数とSupabaseの設定を確認してください。");
    }
  }, [resultsPath, router, targetSlug, view, votePath]);

  useEffect(() => {
    if (debugResults) return;
    const timer = window.setTimeout(() => {
      void loadResults();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [debugResults, loadResults]);

  async function submitVote(choice: VoteChoice) {
    if (view !== "vote" || debugResults || status !== "ready" || isVoting || hasVoted) return;
    setIsVoting(true);
    setNotice("");
    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: targetSlug, choice }),
      });
      const data = (await response.json()) as VoteResults & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "投票を送信できませんでした。");
      router.push(resultsPath);
    } catch {
      setNotice("投票を送信できませんでした。もう一度試してください。");
    } finally {
      setIsVoting(false);
    }
  }

  async function submitSurvey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (debugResults || isSubmittingSurvey || surveySubmitted) return;
    setIsSubmittingSurvey(true);
    setSurveyMessage("");
    try {
      const response = await fetch("/api/votes/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: targetSlug,
          ageRange: surveyAgeRange,
          gender: surveyGender,
          comment: surveyComment,
        }),
      });
      const data = (await response.json()) as { surveySubmitted?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error ?? "アンケートを送信できませんでした。");
      setSurveySubmitted(true);
      setSurveyMessage("回答ありがとう！アンケートを送信しました。");
    } catch {
      setSurveyMessage("送信できませんでした。通信を確認してもう一度試してください。");
    } finally {
      setIsSubmittingSurvey(false);
    }
  }

  const displayStatus = debugResults ? "ready" : status;
  const displayResults = debugResults ? DEBUG_RESULTS : results;
  const displayHasVoted = debugResults || hasVoted;
  const displaySurveySubmitted = !debugResults && surveySubmitted;
  const displayNotice = debugResults
    ? "デバッグ用のサンプル表示です。投票・アンケートは送信されません。"
    : notice;
  const isResultsView = view === "results";
  const isVoteDisabled = debugResults || status !== "ready" || isVoting || hasVoted;

  return (
    <section className="vote-shell content-width">
      <div className="vote-intro">
        <p className="eyebrow"><span className="eyebrow-line" /> QUICK OPINION / 001</p>
        {isResultsView ? <h1>みんなの<em>結果</em></h1> : <h1>この人の顔、<em>どう思う？</em></h1>}
        <p className="vote-subtitle">
          {isResultsView ? "投票ありがとう。みんなの判定はこちら。" : "直感でひとつ。理由はいりません。"}
        </p>
      </div>

      <div className="vote-board">
        <div className="board-topline">
          <span>FACE CHECK</span>
          <span className="live-label">{isResultsView ? "RESULT / ALL VOTES" : "YOUR VOTE"}</span>
        </div>

        {!isResultsView && <div className="choice-grid" aria-label="投票する">
          <button
            className="choice-button choice-good"
            type="button"
            disabled={isVoteDisabled}
            onClick={() => void submitVote("good")}
          >
            <span className="choice-symbol" aria-hidden="true">✦</span>
            <span className="choice-copy">
              <strong>良い！</strong>
              <small>GOOD VIBES</small>
            </span>
            <span className="choice-arrow" aria-hidden="true">↗</span>
          </button>
          <button
            className="choice-button choice-bad"
            type="button"
            disabled={isVoteDisabled}
            onClick={() => void submitVote("bad")}
          >
            <span className="choice-symbol" aria-hidden="true">✕</span>
            <span className="choice-copy">
              <strong>悪いかも</strong>
              <small>NOT TODAY</small>
            </span>
            <span className="choice-arrow" aria-hidden="true">↗</span>
          </button>
        </div>}

        {!isResultsView && (isVoting || notice) && (
          <p className="notice" role="status">
            {isVoting ? "投票を送信しています…" : notice}
          </p>
        )}

        {displayStatus === "loading" && (isResultsView || !results) && (
          <div className="result-panel result-loading" role="status">
            {isResultsView ? "結果を読み込んでいます…" : "投票ページを準備中…"}
          </div>
        )}

        {displayStatus === "ready" && isResultsView && !displayHasVoted && (
          <div className="result-panel result-loading" role="status">投票ページへ戻ります…</div>
        )}

        {displayStatus === "error" && (
          <div className="result-panel result-error" role="alert">
            <strong>まだ投票を受け付けられません。</strong>
            <span>{displayNotice}</span>
            <button className="small-button small-button-dark" type="button" onClick={() => void loadResults()}>もう一度読み込む</button>
          </div>
        )}

        {displayStatus === "ready" && isResultsView && displayResults && displayHasVoted && (
          <div className="result-panel" aria-live="polite">
            <div className="result-heading">
              <div>
                <span className="result-kicker">CURRENT SCORE</span>
                <h2>{displayResults.total === 0 ? "最初の一票をどうぞ" : "みんなの判定"}</h2>
              </div>
              <strong className="vote-count">{displayResults.total}<small>票</small></strong>
            </div>
            <div className="score-row">
              <div className="score-label"><span className="score-dot score-dot-good" />良い <strong>{displayResults.goodPercent}%</strong></div>
              <div className="score-track"><span className="score-fill score-fill-good" style={{ width: `${displayResults.goodPercent}%` }} /></div>
            </div>
            <div className="score-row">
              <div className="score-label"><span className="score-dot score-dot-bad" />悪いかも <strong>{displayResults.badPercent}%</strong></div>
              <div className="score-track"><span className="score-fill score-fill-bad" style={{ width: `${displayResults.badPercent}%` }} /></div>
            </div>
            <p className="notice" role="status">{displayNotice}</p>
          </div>
        )}

        {displayStatus === "ready" && isResultsView && displayHasVoted && (
          <section className="survey-panel" aria-labelledby="survey-title">
            {displaySurveySubmitted ? (
              <div className="survey-thanks" role="status">
                <span className="survey-step">OPTIONAL SURVEY / DONE</span>
                <h2 id="survey-title">回答ありがとう！</h2>
                <p>{surveyMessage || "アンケートは送信済みです。"}</p>
              </div>
            ) : (
              <>
                <div className="survey-heading">
                  <span className="survey-step">OPTIONAL SURVEY / 02</span>
                  <h2 id="survey-title">もう少しだけ、教えて。</h2>
                  <p>年齢と性別は選択式。コメントは自由です。</p>
                </div>
                <form className="survey-form" onSubmit={(event) => void submitSurvey(event)}>
                  <div className="survey-select-grid">
                    <label className="survey-field">
                      <span>年齢</span>
                      <select required value={surveyAgeRange} onChange={(event) => setSurveyAgeRange(event.target.value)}>
                        <option value="" disabled>選んでね</option>
                        {AGE_RANGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <label className="survey-field">
                      <span>性別</span>
                      <select required value={surveyGender} onChange={(event) => setSurveyGender(event.target.value)}>
                        <option value="" disabled>選んでね</option>
                        {GENDERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="survey-field">
                    <span className="comment-label">コメント <small>任意 / {Array.from(surveyComment).length} / 280</small></span>
                    <textarea
                      maxLength={280}
                      rows={3}
                      value={surveyComment}
                      onChange={(event) => setSurveyComment(event.target.value)}
                      placeholder="ひとことどうぞ…"
                    />
                  </label>
                  <p className="survey-privacy">回答は匿名で保存され、公開されるのは投票の割合だけです。</p>
                  <div className="survey-submit-row">
                    <button className="small-button small-button-dark" type="submit" disabled={debugResults || isSubmittingSurvey}>
                      {isSubmittingSurvey ? "送信中…" : debugResults ? "デバッグ表示中" : "アンケートを送信"}
                      {!isSubmittingSurvey && !debugResults && <span aria-hidden="true"> ↗</span>}
                    </button>
                    <span className="survey-message" role="status">{surveyMessage}</span>
                  </div>
                </form>
              </>
            )}
          </section>
        )}

        {!isResultsView && <p className="privacy-note"><span aria-hidden="true">◎</span> 投票は匿名です。同じ端末からの投票は一回まで。</p>}
      </div>
    </section>
  );
}
