# Supabase REST API セットアップ手順

このドキュメントでは、いいね機能のためのSupabase REST API設定手順を説明します。

## 概要

Cloudflare Workers環境では、Node.js用の`postgres`パッケージが使用できないため、Supabase REST API（PostgREST）を使用してデータベースにアクセスします。

## 前提条件

- Supabaseプロジェクトが作成済みであること
- `mdblog.likes`テーブルが存在すること

## 1. 環境変数の設定

`.env`ファイルに以下を追加します：

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

これらの値は、Supabaseダッシュボード → **Settings** → **API** から取得できます。

## 2. スキーマの公開設定

カスタムスキーマ（`mdblog`）を使用している場合、REST APIで公開する必要があります。

1. Supabaseダッシュボードにログイン
2. **Settings** → **API**
3. **Data API Settings** セクション
4. **Exposed schemas** に `mdblog` を追加
5. 保存

## 3. 権限の設定

Supabaseダッシュボードの **SQL Editor** で以下のSQLを実行します：

```sql
-- スキーマへのアクセス権限を付与
GRANT USAGE ON SCHEMA mdblog TO anon;
GRANT USAGE ON SCHEMA mdblog TO authenticated;

-- likesテーブルへの権限を付与
GRANT SELECT, INSERT ON mdblog.likes TO anon;
GRANT SELECT, INSERT ON mdblog.likes TO authenticated;

-- シーケンス（自動採番）への権限を付与
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA mdblog TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA mdblog TO authenticated;
```

## 4. 動作確認

```bash
npm run build:vite && npm run preview
```

ブラウザでいいねボタンのあるページにアクセスし、以下を確認：

- いいね数が表示される
- ボタンを押すといいね数が増える

## トラブルシューティング

### エラー: `The schema must be one of the following: public, storage, graphql_public`

→ スキーマの公開設定（手順2）が完了していません。

### エラー: `permission denied for schema mdblog`

→ スキーマへのUSAGE権限（手順3）が付与されていません。

### エラー: `permission denied for sequence likes_id_seq`

→ シーケンスへの権限（手順3）が付与されていません。

### エラー: `Unexpected end of JSON input`

→ `db.ts`で201ステータスの空レスポンス処理が不足しています。

## 参考: テーブル構造

```sql
CREATE TABLE mdblog.likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 参考: publicスキーマを使用する場合

`mdblog`スキーマの代わりに`public`スキーマを使用する場合は、`app/lib/db.ts`の`SCHEMA`定数を変更します：

```typescript
const SCHEMA = "public";
```

この場合、スキーマ公開設定（手順2）は不要です。
