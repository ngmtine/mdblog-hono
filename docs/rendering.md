# レンダリング方式の解説

このドキュメントでは、`npm run dev` と `npm run build && npm run preview` の2つのビルド方法の違いを説明します。

## 比較表

| 項目 | `npm run dev` | `npm run build && npm run preview` |
|------|---------------|-----------------------------------|
| ランタイム | Node.js (Vite dev server) | Cloudflare Workers (wrangler) |
| エントリポイント | `server.ts` | `server.tsx` (SSG) → `server.ts` (配信) |
| ルーティング | HonoXファイルベース（動的） | 明示的ルート定義 + `ssgParams` |
| レンダリング | リクエストごとに動的生成 | ビルド時に静的HTML生成 (SSG) |
| 記事ソース | `dummy-posts/` | 外部リポジトリからクローン |

## `npm run dev` の流れ

```
vite (dev server)
    ↓
server.ts (HonoX createApp)
    ↓
app/routes/* のファイルベースルーティング
    ↓
リクエストごとにMarkdown→HTML変換
```

- Vite開発サーバーがNode.jsで起動
- `server.ts` は単純に `createApp()` を呼ぶだけ
- `app/routes/` 配下のファイルが自動的にルートとして認識される
- ホットリロード対応、変更が即座に反映

## `npm run build && npm run preview` の流れ

```
build:fetch-posts (git clone)
    ↓
build:vite (vite build)
    ↓
server.tsx (isNodeEnv=true)
    ↓
ssgParams で動的ルートを列挙
    ↓
静的HTMLファイル生成 (dist/)
    ↓
wrangler dev (Workers runtime)
    ↓
server.ts (静的ファイル配信)
```

### ビルド時 (`server.tsx` の `isNodeEnv === true` 分岐)

- 明示的にルートを定義（`app.get("/")`, `app.get("/posts/:slug")` 等）
- `ssgParams` で動的ルートのパラメータを事前に列挙
- 各ルートの静的HTMLを生成

### 実行時 (`server.ts`)

- Cloudflare Workersランタイムで動作
- 生成済みの静的ファイルを配信
- Markdown処理は不要（ビルド時に完了済み）

## 重要なポイント: `server.tsx` の分岐

```typescript
// app/server.tsx

if (isNodeEnv) {
    // SSGビルド用: 明示的ルート + ssgParams
    app = new Hono();
    // ... 各ルートを手動定義
} else {
    // Workers実行時: HonoXファイルベースルーティング
    app = createApp();
}
```

この分岐により:

- **ビルド時**: `ssgParams` が動的ルート（`/posts/:slug`, `/category/:category`）のパラメータ一覧を取得し、すべてのページを静的生成
- **実行時**: ファイルベースルーティングで静的ファイルを配信

## なぜ2つのサーバーファイルが必要か

SSGで動的ルートを生成するには、ビルド時にすべてのパラメータを知る必要があります。HonoXのファイルベースルーティングは `ssgParams` を直接サポートしないため、`server.tsx` で明示的にルートを定義しています。

## ファイル構成

```
app/
├── server.ts      # Workers実行時用（HonoXファイルベースルーティング）
├── server.tsx     # SSGビルド用（明示的ルート定義）
└── routes/        # ファイルベースルーティング用
    ├── index.tsx
    ├── about.tsx
    ├── posts/[slug].tsx
    └── category/[category].tsx
```

## 注意事項

- `server.tsx` と `app/routes/` のルート定義は同期させる必要があります
- 新しいルートを追加する場合は、両方を更新してください
