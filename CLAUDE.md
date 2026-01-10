## プロジェクト概要

HonoX（Hono + Vite）を使用したMarkdownベースのブログシステム
Cloudflare Workersにデプロイされる
Reactには依存しない

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
npm run knip       # 不要コード検出
```

## 命名規則

- `$`プレフィックス付きコンポーネント（例: `$header.tsx`）: クライアントサイドで動作するコンポーネント
- ルートファイル: `[slug].tsx` 形式で動的ルーティング

## 環境変数

`.env`ファイルで管理。`VITE_`プレフィックスが必要（クライアントからアクセス可能にするため）。

## typescriptコーディング規約

- 関数定義はアロー関数を使用する
- 複数の引数を扱う場合、分割代入を使用する
- 型定義はtypeを使用する
- 非同期処理はasync/awaitを使用する
- 基本的にはnamed exportを使用する ただしフレームワークがdefault exportの使用を前提とする場合は、それに従う
- 条件式のネストが深くなる場合は、早期リターンを使用することでネストを浅くする
- 基本的にnullは使用せずundefinedに統一する ただし、以下の場合はnullの使用を認める
    - apiがnullを使用している場合
    - nullチェックを行う場合
    - jsxのreturnにはnullを使用する

## 開発規約

- viteの開発サーバーを勝手に起動や停止をしない
