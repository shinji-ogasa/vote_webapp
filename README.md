# FACE CHECK

服やステッカーのQRコードから開いて、「良い / 悪い」に投票してもらう小さなNext.jsアプリです。投票結果はSupabaseに保存し、投票後に割合を表示します。

## ローカル起動

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` に Supabase の URL とサーバー専用の `service_role` キーを設定してください。`SUPABASE_SERVICE_ROLE_KEY` はブラウザに公開してはいけません。

## Supabaseのセットアップ

1. Supabaseでプロジェクトを作成します。
2. SQL Editorで `supabase/migrations` 内のSQLをファイル名の順に実行します（投票テーブル作成 → アンケート項目追加）。
3. Project URLを `SUPABASE_URL`、service role keyを `SUPABASE_SERVICE_ROLE_KEY` に設定します。
4. `http://localhost:3000/` のQRを保存し、服やカードに印刷します。投票ページは `/vote/me`、投票後の結果とアンケートは `/vote/me/results` です。画面確認用の結果デバッグページは `/vote/me/results?debug=results` です。

投票テーブルにはRLSを有効にし、匿名クライアントからの直接アクセスを閉じています。Next.jsのAPI Routeだけが集計と保存を行います。同じ端末にはHttpOnly Cookieを発行し、同じ対象への二重投票を防ぎます。投票後は別ページに移動し、結果とアンケートを表示します。アンケートは年齢層・性別の選択式と任意コメント（280文字まで）で、回答は票にひも付けて匿名で保存します。画面に公開するのは投票割合だけです。

## Vercelへのデプロイ

Vercelプロジェクトにこのリポジトリを接続し、Production / Preview の環境変数に同じ3つの値を登録してデプロイします。デプロイ後、表示されたドメインでトップページのQRを作り直してください。

このMVPの重複投票防止はブラウザCookie単位です。公開イベントでの厳密な不正投票対策（IPレート制限、Turnstile、管理画面など）は別途追加できます。
