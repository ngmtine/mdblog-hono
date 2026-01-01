## プロジェクト概要

HonoX（Hono + Vite）を使用したMarkdownベースのブログシステム。Cloudflare Workersにデプロイされる。

## 技術スタック

- **フレームワーク**: HonoX (Hono + Vite)
- **スタイリング**: Tailwind CSS v4
- **デプロイ先**: Cloudflare Workers
- **データベース**: PostgreSQL (Cloudflare Hyperdrive経由)
- **OGP画像生成**: hono-og

## ディレクトリ構造

- `app/` - アプリケーションコード
  - `routes/` - ページルーティング（ファイルベースルーティング）
  - `components/` - UIコンポーネント
  - `lib/` - ユーティリティ・定数
- `public/` - 静的ファイル
- `dist/` - ビルド出力

## 開発コマンド

```bash
npm run dev       # 開発サーバー起動
npm run build     # 本番ビルド
npm run preview   # wrangler devでプレビュー
npm run deploy    # Cloudflareへデプロイ
```

## コード品質チェック

ファイル編集後は必ず以下を実行すること：

```bash
npm run typecheck  # 型チェック
npm run biome      # リント・フォーマット
```

## 命名規則

- `$`プレフィックス付きコンポーネント（例: `$header.tsx`）: クライアントサイドで動作するコンポーネント
- ルートファイル: `[slug].tsx` 形式で動的ルーティング

## 環境変数

`.env`ファイルで管理。`VITE_`プレフィックスが必要（クライアントからアクセス可能にするため）。
