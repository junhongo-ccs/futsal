# Supabase同期セットアップ

このアプリは、`config.json` がない場合は従来通りブラウザ内の `localStorage` に保存する。`config.json` にSupabase設定を入れると、GoogleログインとPostgreSQL保存に切り替わる。

## 1. Supabaseプロジェクトを作る

Supabaseで新しいプロジェクトを作成する。

必要な値:

- Project URL
- anon public key

## 2. テーブルとRLSを作る

Supabase DashboardのSQL Editorで [supabase/schema.sql](../supabase/schema.sql) を実行する。

このSQLは次を作る。

- `futsal_records`: 確定した記録
- `futsal_drafts`: 途中保存
- Row Level Security
- ログイン中ユーザー本人の行だけを読める、書ける、消せるポリシー

## 3. Google認証を有効にする

Supabase DashboardでGoogle providerを有効にする。

設定するURL:

- Site URL: 公開するアプリのURL
- Redirect URLs: 公開URLとローカル確認URL

例:

```text
https://<username>.github.io/futsal/
http://localhost:4173/
```

Google Cloud Console側でもOAuthクライアントを作り、SupabaseのCallback URLを承認済みリダイレクトURIに入れる。

## 4. config.jsonを作る

`config.example.json` をコピーして `config.json` を作る。

```json
{
  "url": "https://YOUR_PROJECT_REF.supabase.co",
  "anonKey": "YOUR_SUPABASE_ANON_KEY"
}
```

`anonKey` はブラウザに置く公開キー。安全性はキーを隠すことではなく、RLSポリシーで本人の行だけを許可することで担保する。

## 5. 動作確認

ローカルサーバーを起動する。

```bash
python3 -m http.server 4173
```

確認すること:

- Googleログインできる
- 途中保存が復元される
- 記録すると `futsal_records` に保存される
- スマホ2台やPCで同じGoogleアカウントにログインすると同じ記録が見える
- この端末に残っていたローカル記録を「この端末の記録を取り込む」でクラウドへ移せる
