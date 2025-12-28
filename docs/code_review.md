# コードレビュー

Hono/HonoXを使用したMarkdownブログの実装レビュー。

## 良い点

1. **構造がシンプル** - HonoXのファイルベースルーティングを適切に活用
2. **Tailwind CSS v4** - 最新版を使用しダークモード対応済み
3. **SSG対応** - `@hono/vite-ssg`でCloudflare Workers向けに静的生成
4. **Markdown処理** - remark/rehypeパイプラインが適切に構成されている

## 問題点・改善提案

### 1. `_renderer.tsx` での `@ts-expect-error` (行26)

```tsx
// @ts-expect-error
export default jsxRenderer(async ({ children, title }) => {
```

型定義が不完全。HonoXの`LayoutHandler`型を適切に拡張すべき。

### 2. ディレクトリ指定の不整合

| ファイル | 使用ディレクトリ |
|---------|-----------------|
| `server.ts:8` | `"dummy-posts"` (ハードコード) |
| `routes/index.tsx:6` | `"dummy-posts"` (ハードコード) |
| `routes/posts/[slug].tsx:12` | `"dummy-posts"` (ハードコード) |
| `lib/posts.ts` | `process.env.POSTS_DIRECTORY` をフォールバック使用 |

環境変数を一貫して使用するか、定数として定義すべき。

### 3. `index.tsx`でHeaderが二重レンダリング (行11)

`_renderer.tsx`で既に`<Header />`をレンダリングしているが、`index.tsx`と`posts/[slug].tsx`でも再度レンダリングしている。

### 4. セキュリティ: XSSリスク (`posts/[slug].tsx:36`)

```tsx
dangerouslySetInnerHTML={{ __html: post.content }}
```

Markdownコンテンツが信頼できるソースからのみ来る場合は問題ないが、`rehype-sanitize`の追加を検討すべき。

### 5. `server.ts`のSSGルート登録 (行9-14)

```tsx
for (const post of posts) {
    app.get(`/posts/${post.slug}`, async (c) => {
        return c.text("placeholder");  // 実際のルートファイルと重複
    });
}
```

HonoXのファイルベースルーティング(`routes/posts/[slug].tsx`)と重複している。SSGのためだけであれば、vite-ssgの設定で対応すべき。

### 6. Sidebar固定ボタンの位置 (`sidebar.tsx:47`)

```tsx
<div id="sidebarButtonArea" class="bottom-0 fixed mb-[0.2rem] ml-10">
```

`fixed`ポジションがサイドバー内にあるのは不適切。親要素の文脈から外れる。

### 7. `getAllPosts`がソートされていない (`lib/posts.ts:67-90`)

日付順でのソートが実装されていない。

### 8. package.jsonのビルドスクリプト (行6)

```json
"build": "POSTS_DIRECTORY=posts git clone https://github.com/username/blog-articles.git ..."
```

`username`がプレースホルダーのまま。

## 推奨事項

1. **定数ファイルの作成** - ディレクトリパスなどの設定を一元管理
2. **レイアウト構造の見直し** - `_renderer.tsx`でのレイアウトを信頼し、個別ページでのHeader重複を削除
3. **投稿のソート追加** - 日付降順でソート
4. **エラーハンドリングの強化** - 404ページのスタイリング改善
5. **カテゴリページのSSG対応** - `server.ts`でカテゴリルートも登録
