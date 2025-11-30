# HonoXブログシステム実装方針

## 1. 概要

本プロジェクトは、HonoX を使用してブログシステムを構築することを目的としています。ページ全体は HonoX の SSR (Server Side Rendering) とアイランドアーキテクチャで描画し、記事コンテンツは Hono の SSG (Static Site Generation) を利用して静的に生成します。

## 2. 主要要件

*   記事の Markdown ファイルは、ブログシステムのリポジトリとは別に管理する。
*   ページ全体は HonoX で描画し、記事コンテンツは Hono の SSG または SSR を使用してレンダリングする（アイランドアーキテクチャ）。
*   スタイリングは Tailwind CSS v4 を使用する。
*   Markdown のパースと HTML の作成は `remark`, `rehype`, `gray-matter` を使用する。

## 3. 実装方針

### 3.1. 記事データの管理

*   記事の Markdown ファイルは、要件通り別のリポジトリで管理します。
*   ブログシステムのビルド時または実行時に、そのリポジトリから Markdown ファイルを取得する仕組みを構築します。具体的な取得方法は後ほど検討します（例: Git Submodule, API 経由での取得、ビルド時のコピーなど）。

### 3.2. 記事ページの生成 (SSG)

*   Hono の SSG ヘルパー (`toSSG`) を使用して、Markdown ファイルから個別の記事ページ（例: `/posts/my-first-post`）を静的 HTML として生成します。
*   `src/lib/posts.ts` のようなモジュールを作成し、`remark` と `rehype` を使って Markdown をパースし、HTML に変換する処理を実装します。このモジュールは、記事のリストや個別の記事データを返す関数を提供します。
*   SSG の生成処理は、`package.json` の `build` スクリプトに組み込みます。

### 3.3. ページ全体の描画 (SSR with Islands)

*   記事一覧ページや、記事ページのヘッダー、フッター、コメントセクションなどの共通部分は、HonoX の SSR 機能で描画します。
*   記事の本文（SSG で生成した HTML）は、SSR で描画されるページコンポーネント内に埋め込みます。
*   インタラクティブ性が必要なコンポーネント（例: いいねボタン、モバイルメニューなど）は、HonoX のアイランド機能を使ってクライアントサイドでハイドレーションします。

### 3.4. Markdown 処理

*   `gray-matter` を使用して Markdown ファイルからメタデータ（タイトル、日付、スラッグなど）を抽出します。
*   `remark` を使用して Markdown を抽象構文木 (AST) に変換します。
*   `rehype` を使用して AST を HTML に変換します。必要に応じて、コードハイライトなどのプラグインを導入します。

### 3.5. スタイリング

*   Tailwind CSS v4 を使用して、コンポーネントのスタイリングを行います。
*   `src/style.css` に `@import "tailwindcss";` が設定済みであり、`vite.config.ts` で Tailwind CSS プラグインが有効になっていることを確認します。

## 4. 今後のステップ

1.  `src/lib/posts.ts` の作成と Markdown 処理ロジックの実装。
2.  記事一覧ページと個別記事ページのルーティング (`src/index.tsx`) の実装。
3.  SSG 生成処理の `package.json` への追加。
4.  Tailwind CSS を使用したコンポーネントのスタイリング。
5.  必要に応じて、インタラクティブなコンポーネントのアイランド化。
