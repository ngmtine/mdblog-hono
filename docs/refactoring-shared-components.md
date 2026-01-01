# 共有コンポーネント抽出リファクタリング

## 目的

`server.tsx` と `app/routes/` 配下のルートファイルで重複していた JSX コードを共有コンポーネントとして抽出し、コードの重複を排除する。

### 背景

現在のアーキテクチャでは、以下の理由で2つのサーバーファイルが存在する：

| ファイル | 用途 | ルーティング方式 |
|----------|------|------------------|
| `server.ts` | Workers ランタイム / 開発サーバー | HonoX ファイルベース |
| `server.tsx` | SSG ビルド | 明示的ルート定義 + `ssgParams` |

SSG ビルド時に動的ルートのパラメータを列挙するため `ssgParams` が必要だが、HonoX のファイルベースルーティングと `@hono/vite-ssg` の組み合わせでは `node:async_hooks` の問題が発生するため、`server.tsx` では素の `Hono()` を使用している。

この構造により、同じページの JSX が `server.tsx` と `app/routes/*.tsx` の両方に重複して存在していた。

## 実装内容

### 1. 共有コンポーネントの作成

`app/components/pages/` ディレクトリに以下のコンポーネントを作成：

#### IndexPage.tsx
```typescript
import type { Post } from "../../lib/posts";

interface Props {
    posts: Post[];
}

export const IndexPage = ({ posts }: Props) => (
    <div>
        <title>Blog</title>
        <h1 class="text-4xl font-bold mb-8">Blog Posts</h1>
        {/* ... */}
    </div>
);
```

#### PostPage.tsx
```typescript
import type { Post } from "../../lib/posts";

interface Props {
    post: Post;
    slug: string;
}

export const PostPage = ({ post, slug }: Props) => (
    <div>
        <title>{post.frontmatter.title || slug}</title>
        {/* ... */}
    </div>
);
```

#### AboutPage.tsx
```typescript
export const AboutPage = () => (
    <div>
        <title>About</title>
        {/* ... */}
    </div>
);
```

#### GenrePage.tsx
```typescript
import type { Post } from "../../lib/posts";

interface Props {
    category: string;
    posts: Post[];
}

export const GenrePage = ({ category, posts }: Props) => (
    <div>
        <title>Genre: {category}</title>
        {/* ... */}
    </div>
);
```

### 2. server.tsx の更新

共有コンポーネントをインポートして使用：

```typescript
import { IndexPage } from "./components/pages/IndexPage";
import { PostPage } from "./components/pages/PostPage";
// ...

app.get("/", async (c) => {
    const posts = await getAllPosts();
    return c.render(<IndexPage posts={posts} />);
});
```

### 3. ルートファイルの更新

各ルートファイルも共有コンポーネントを使用するよう更新：

```typescript
// app/routes/index.tsx
import { IndexPage } from "../components/pages/IndexPage";

export default createRoute(async (c) => {
    const posts = await getAllPosts();
    return c.render(<IndexPage posts={posts} />);
});
```

### 4. SSG 専用レンダラーの作成

`honox/server` の `Link` / `Script` コンポーネントが `node:async_hooks` を必要とするため、SSG 用の独立したレンダラーを作成：

```typescript
// app/lib/ssg-renderer.tsx
import { jsxRenderer } from "hono/jsx-renderer";

export const ssgRenderer = jsxRenderer(async ({ children, title }) => {
    // honox/server に依存しないレンダラー
    return (
        <html>
            <head>
                <link href="/static/style.css" rel="stylesheet" />
                <script type="module" src="/static/client.js" async />
            </head>
            <body>{children}</body>
        </html>
    );
});
```

## 発見された問題

### Vite 6 / @hono/vite-ssg の互換性問題

SSG ビルド時に以下のエラーが発生：

```
Cannot find module 'node:fs/promises' imported from '.../app/lib/posts.ts'
Cannot find module 'node:async_hooks' imported from '.../honox/dist/server/context-storage.js'
```

**原因**: Vite 6 の新しい SSR モジュールランナーが Node.js ビルトインモジュールを正しく処理できない。

**試した対策**（いずれも効果なし）：
- `ssr.external` に Node.js モジュールを追加
- `ssr.target: "node"` の設定
- `environments.ssr.resolve.external` の設定
- `honox/server` からの `createApp` インポートを動的インポートに変更

**重要**: この問題は元のコード（変更前）でも発生しており、今回のリファクタリングが原因ではない。

## TODO

### 高優先度

- [x] **Vite / vite-ssg のバージョン調査**
  - Vite 5 へのダウングレードで解決するか確認
  - `@hono/vite-ssg` の最新バージョンを確認

- [ ] **Issue 報告**
  - HonoX または @hono/vite-ssg の GitHub に問題を報告
  - 再現手順と環境情報を含める

### 中優先度

- [ ] **代替 SSG アプローチの検討**
  - `vite build` 後に別プロセスで SSG を実行する方式
  - カスタム SSG スクリプトの作成

- [ ] **posts.ts のリファクタリング**
  - Node.js API を使わない実装への変更（ビルド時に記事を JSON として出力など）

### 低優先度

- [ ] **コンポーネントの型定義改善**
  - Props の型をより厳密に定義
  - JSX のエラー抑制（`@ts-expect-error`）を解消

## ファイル構成

```
app/
├── server.ts              # Workers ランタイム用
├── server.tsx             # SSG ビルド用
├── components/
│   └── pages/
│       ├── IndexPage.tsx
│       ├── PostPage.tsx
│       ├── AboutPage.tsx
│       └── GenrePage.tsx
├── lib/
│   ├── posts.ts
│   └── ssg-renderer.tsx   # SSG 専用レンダラー
└── routes/
    ├── index.tsx
    ├── about.tsx
    ├── posts/[slug].tsx
    └── category/[category].tsx
```

## 実施された改修

### 1. Vite 6 から 5 へのダウングレード

Vite 6 の新しい SSR モジュールランナーが Node.js ビルトインモジュールを正しく処理できない問題により、Vite を 5.4.11 にダウングレードしました。これにより SSG ビルドが正常に動作するようになりました。

### 2. SSG レンダラーのアセットパス修正

`app/lib/ssg-renderer.tsx` で CSS と JavaScript のパスをハードコードしていたため、Vite のビルド時に生成されるハッシュ付きファイル名と一致せず、CSS が読み込まれない問題が発生しました。

修正内容:
- Vite のマニフェストファイル (`dist/.vite/manifest.json`) をビルド時に読み込み、正しいアセットパスを取得するように変更
- テンプレートリテラルを使用した文字列連結の改善

### 3. 設定ファイルの修正

- `vite.config.ts` の `environments` 設定を削除（Vite 5 ではサポートされていない）
- `ssr.external` 設定を維持

これらの改修により、開発環境 (`npm run dev`) と本番環境 (`npm run build && npm run preview`) の両方で正常に動作するようになりました。

## 参考情報

- [docs/rendering.md](./rendering.md) - レンダリング方式の詳細説明
- [Vite SSR External](https://vitejs.dev/config/ssr-options#ssr-external)
- [@hono/vite-ssg](https://github.com/honojs/vite-plugins/tree/main/packages/ssg)
