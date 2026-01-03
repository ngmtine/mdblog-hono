# Code Review: mdblog-hono

## 概要

HonoX（Hono + Vite）を使用したMarkdownベースのブログシステムのコードレビュー結果。

**評価**: 全体的に高品質なコードベースであり、モダンな技術スタックを適切に活用している。

**レビュー日時**: 2026-01-04

---

## 1. アーキテクチャ

### 良い点

- **SSGとWorkers Runtimeの分離**: `server.ts`でファイルベースルーティングを使用し、SSG時とランタイムで異なるコンテキストを適切に処理している
- **環境検出ロジック**: `canUseNodeModules`による環境判別（`app/lib/posts.ts:4-6`）は、Cloudflare Workersでのファイルシステム非対応を正しく考慮している
- **コンポーネント命名規則**: `$`プレフィックスでクライアントサイドコンポーネントを識別できる点は、チーム開発において有用
- **OGP生成パイプライン**: ビルド時にOGP画像を生成し、HTMLに注入するアプローチ（`scripts/generate-ogp.ts`, `scripts/inject-ogp.ts`）は合理的

### 改善提案

#### 1.1 DB接続のコネクションプール

**現状** (`app/lib/db.ts:67-85`):
```typescript
const client = config.type === "hyperdrive"
    ? new Client({ ... })
    : new Client({ connectionString: config.connectionString });

try {
    await client.connect();
    const result = await client.query(query, params);
    return result.rows as T[];
} finally {
    await client.end();
}
```

**問題**: 毎回新規接続・切断を行っている。Hyperdriveがコネクションプーリングを担うため本番では問題ないが、開発環境（connection string直接使用時）ではオーバーヘッドが発生する。

**推奨**: 開発環境用にシングルトンクライアントまたはプールを検討。

#### 1.2 関数の重複定義

**現状**: `extractExcerpt`関数が2箇所で重複定義されている
- `app/lib/posts.ts:28-39`
- `scripts/inject-ogp.ts:16-26`

**推奨**: 共通ユーティリティとして1箇所に集約するか、スクリプトでposts.tsからインポートする。

---

## 2. セキュリティ

### 良い点

- **パラメータ化クエリ**: SQLインジェクション対策として`$1, $2, $3`形式のプレースホルダーを使用（`app/routes/api/likes.ts`）
- **XSS対策**: Markdownコンテンツは`dangerouslySetInnerHTML`で出力されるが、remark/rehypeパイプラインでサニタイズされている
- **HTMLエスケープ**: OGP注入スクリプトで`escapeHtml`関数を使用してメタタグの値をエスケープ（`scripts/inject-ogp.ts:79-86`）

### 改善提案

#### 2.1 Rate Limiting

**現状** (`app/routes/api/likes.ts`):
いいねAPIにレート制限がない。悪意あるユーザーが大量のいいねを付与可能。

**推奨**:
```typescript
// 例: 同一IP・同一postIdからの連続いいねを制限
const query = `
SELECT COUNT(*) as recent_likes
FROM mdblog.likes
WHERE post_id = $1 AND user_ip = $2 AND created_at > NOW() - INTERVAL '1 minute'
`;
```

#### 2.2 IPアドレス取得

**現状** (`app/routes/api/likes.ts:57-58`):
```typescript
const forwardedFor = c.req.header("x-forwarded-for");
const userIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
```

**問題**: Cloudflare Workers環境では`CF-Connecting-IP`ヘッダーを使用する方が信頼性が高い。

**推奨**:
```typescript
const userIp = c.req.header("cf-connecting-ip")
    || c.req.header("x-real-ip")
    || c.req.header("x-forwarded-for")?.split(",")[0].trim()
    || "unknown";
```

#### 2.3 Content Security Policy

**現状**: CSPヘッダーが設定されていない。

**推奨**: `_renderer.tsx`またはミドルウェアでCSPを追加。

---

## 3. パフォーマンス

### 良い点

- **SSG活用**: 静的ページはビルド時に生成され、Cloudflare CDNから配信
- **キャッシュバスト**: いいねAPIでは複数のキャッシュ無効化ヘッダーを設定（`app/routes/api/likes.ts:29-36`）
- **楽観的更新**: いいねボタンはUI先行更新によるUX向上（`app/components/functionalIcons/$LikeButton.tsx:60-61`）
- **Shiki Dual Theme**: シンタックスハイライトでライト/ダークテーマの両対応（`app/style.css:111-118`）

### 改善提案

#### 3.1 画像の遅延読み込み

**現状** (`app/lib/posts.ts:79`):
```typescript
content = content.replace(/src="images([^"]*)"/g, 'src="/images/$1"');
```

画像タグに`loading="lazy"`が付与されていない。

**推奨**: 変換時に属性を追加、または`<img>`タグをRehypeプラグインで処理。

```typescript
content = content.replace(
    /(<img[^>]*src="[^"]*")/g,
    '$1 loading="lazy"'
);
```

#### 3.2 全記事取得の最適化

**現状** (`app/routes/posts/[slug].tsx:20`):
```typescript
const allPosts = await getAllPosts();
```

個別記事ページで前後記事取得のために全記事を再取得している。

**推奨**: `getAllPosts`の結果をキャッシュまたはビルド時に前後記事情報を事前計算。

---

## 4. コード品質

### 良い点

- **TypeScript活用**: 適切な型定義（`Post`, `PostFrontmatter`, `AppEnv`等）
- **関数分割**: 単一責任の原則に従った関数設計
- **エラーハンドリング**: try-catch-finallyの適切な使用（`app/lib/db.ts:78-84`）
- **Biome設定**: リント・フォーマットが適切に設定されている（`biome.json`）
- **型安全なHono拡張**: `global.d.ts`でContextRendererとContextVariableMapを拡張

### 改善提案

#### 4.1 型の厳密化

**現状** (`app/lib/posts.ts:8-16`):
```typescript
export type PostFrontmatter = {
    id?: number;
    title?: string;
    // ...
    [key: string]: unknown;
};
```

**問題**: インデックスシグネチャにより型安全性が低下。

**推奨**: 拡張フィールドが必要な場合は別途`metadata: Record<string, unknown>`を用意。

```typescript
export type PostFrontmatter = {
    id?: number;
    title?: string;
    create_date?: string;
    update_date?: string;
    genre?: string;
    published?: boolean;
};
```

#### 4.2 エラー型の明確化

**現状** (`app/routes/api/_middleware.ts:12`):
```typescript
const status = message === "Database not configured" ? 500 : 400;
```

エラーメッセージの文字列比較でエラー種別を判定している。

**推奨**: カスタムエラークラスを定義し、instanceofで判定。

```typescript
export class DatabaseNotConfiguredError extends Error {
    constructor() {
        super("Database not configured");
        this.name = "DatabaseNotConfiguredError";
    }
}
```

#### 4.3 未使用コンポーネントの整理

**現状**: `$themeSwitcher.tsx`がThemeSwitcherコンポーネントを定義しているが、サイドバーでは`$toggleDarkmodeButton.tsx`のToggleDarkmodeButtonを使用している。

**推奨**: 使用しないコンポーネントは削除するか、統合を検討。

---

## 5. 保守性

### 良い点

- **明確なディレクトリ構造**: routes/components/libの責務が明確
- **環境変数の集約**: `constants.ts`で環境変数を一元管理
- **ビルドスクリプトの分割**: 各ステップが独立したnpmスクリプト（`package.json`）
- **Cardコンポーネント抽象化**: 統一されたカードUIをvariant指定で切り替え（`app/components/ui/Card.tsx`）

### 改善提案

#### 5.1 マジックナンバーの定数化

**現状**:
- `posts.slice(0, 10)` - サイドバーの表示件数（`app/components/layout.tsx:70`）
- `truncateTitle(title, maxLength = 15)` - タイトル省略文字数（`app/components/pages/PostPage.tsx:10`）

**推奨**: `constants.ts`に定義。

```typescript
export const SIDEBAR_RECENT_POSTS_COUNT = 10;
export const TITLE_TRUNCATE_LENGTH = 15;
```

#### 5.2 環境変数アクセスの統一

**現状** (`app/lib/constants.ts:2`):
```typescript
export const POSTS_DIRECTORY = `${(import.meta.env || process.env).VITE_POSTS_REPO_DIR}/posts`;
```

`import.meta.env || process.env`パターンが複数箇所で使用されている。

**推奨**: 環境変数アクセス用のヘルパー関数を用意。

```typescript
const getEnv = () => import.meta.env || process.env;
export const env = getEnv();
```

---

## 6. アクセシビリティ

### 良い点

- **aria属性**: ハンバーガーメニューに`aria-label`, `aria-expanded`を適切に設定（`app/components/$header.tsx:78-79`）
- **セマンティックHTML**: `<article>`, `<nav>`, `<aside>`を適切に使用
- **SVGアイコン**: `aria-hidden="true"`で装飾的アイコンを明示（`app/components/functionalIcons/$LikeButton.tsx:14`）
- **SVGタイトル**: アイコンに`<title>`要素を設定（`app/components/$header.tsx:90`）

### 改善提案

#### 6.1 スキップリンク

**現状**: メインコンテンツへのスキップリンクがない。

**推奨**: キーボードナビゲーション向けにスキップリンクを追加。

```html
<a href="#main-content" class="sr-only focus:not-sr-only">
    メインコンテンツへスキップ
</a>
```

#### 6.2 フォーカス管理

**現状**: モバイルメニュー開閉時のフォーカストラップがない（`app/components/$header.tsx`）。

**推奨**: メニュー開閉時にフォーカスを適切に移動・閉じ込める。

#### 6.3 画像のalt属性

**現状**: Markdownから生成された画像にalt属性がない場合がある。

**推奨**: Rehypeプラグインで空のalt属性を検出・警告。

---

## 7. テスト

### 現状

テストコードが見当たらない。

### 推奨

#### 7.1 ユニットテスト

- `extractExcerpt()`: 様々なMarkdown入力に対する抜粋結果
- `parseMarkdown()`: フロントマター解析、HTMLコンテンツ生成
- `extractGenreList()`: 重複除去、空値処理
- `escapeHtml()`: 特殊文字のエスケープ

#### 7.2 統合テスト

- APIエンドポイント（`/api/likes`）のリクエスト/レスポンス
- SSGで生成されるHTMLの構造検証

---

## 8. 軽微な問題

| ファイル | 行 | 問題 | 推奨対応 |
|----------|-----|------|----------|
| `$LikeButton.tsx` | 92 | `text-md`はTailwindの標準クラスではない | `text-base`に変更 |
| `sidebarWrapper.tsx` | 20 | `max-w-85`はカスタム値（定義なし） | `@theme`で定義または`max-w-[85vw]`を使用 |
| `posts.ts` | 79 | 正規表現が`images/`のみ対応 | `./images/`や`../images/`も考慮 |
| `PostPage.tsx` | 10 | `truncateTitle`関数がコンポーネントファイル内に定義 | `lib/utils.ts`等に分離 |
| `layout.tsx` | 7-23 | `themeScriptStr`がコンポーネントファイル内に定義 | `lib/theme.ts`等に分離 |

---

## 9. ビルド・デプロイ

### 良い点

- **ビルドパイプライン**: 段階的なビルドプロセス（fetch-posts → build:vite → generate-ogp → inject-ogp → copy-images → generate-wrangler-config）
- **環境設定の分離**: `wrangler.template.toml`をベースに環境変数を注入してwrangler.tomlを生成
- **CI/CD意識**: `npm run deploy`がCIを使用するよう案内

### 改善提案

#### 9.1 シークレット管理

**現状** (`wrangler.toml:3`):
```toml
account_id = "ACCOUNT_ID_PLACEHOLDER"
```

**推奨**: account_idはプレースホルダーのまま残っているが、実際のデプロイ時に正しく置換されるか確認が必要。

---

## 10. 総評

### 強み

1. **モダンな技術スタック**: HonoX + Cloudflare Workers + PostgreSQL（Hyperdrive）
2. **SSGによる高速配信**: ビルド時に静的HTML生成、CDN配信
3. **適切な責務分離**: コンポーネント、ルート、ユーティリティが整理されている
4. **ダークモード対応**: システム設定連携 + ユーザー選択保存（FOUC防止のインラインスクリプト含む）
5. **楽観的UI更新**: いいね機能のUXが優れている
6. **OGP画像生成**: ビルド時に自動生成する仕組み

### 改善優先度

| 優先度 | 項目 | 理由 |
|--------|------|------|
| 高 | Rate Limiting | スパム攻撃への耐性がない |
| 高 | IPアドレス取得方法 | Cloudflare環境での正確性 |
| 中 | テスト追加 | リグレッション防止 |
| 中 | アクセシビリティ改善 | より多くのユーザーへの対応 |
| 中 | 重複コードの削除 | extractExcerpt関数の統合 |
| 低 | コード品質改善 | 長期的な保守性向上 |
| 低 | 軽微な問題の修正 | Tailwindクラス名等 |

---

## 11. ファイル構成一覧

```
app/
├── client.ts              # クライアントエントリーポイント
├── global.d.ts            # 型定義拡張
├── server.ts              # サーバーエントリーポイント
├── style.css              # グローバルスタイル
├── components/
│   ├── $header.tsx        # ヘッダー（クライアント）
│   ├── $themeSwitcher.tsx # テーマ切替（未使用?）
│   ├── layout.tsx         # レイアウト
│   ├── PostCard.tsx       # 記事カード
│   ├── sidebar.tsx        # サイドバー
│   ├── sidebarWrapper.tsx # サイドバーラッパー
│   ├── functionalIcons/   # 機能アイコン群
│   ├── pages/             # ページコンポーネント群
│   └── ui/                # UIコンポーネント群
├── lib/
│   ├── constants.ts       # 定数
│   ├── db.ts              # DB接続
│   └── posts.ts           # 投稿関連ユーティリティ
└── routes/
    ├── _404.tsx           # 404ページ
    ├── _error.tsx         # エラーページ
    ├── _renderer.tsx      # レンダラー
    ├── index.tsx          # トップページ
    ├── api/               # APIルート
    ├── genre/             # ジャンルページ
    └── posts/             # 記事ページ
```

---

## 12. 参考リンク

- [Hono Documentation](https://hono.dev/)
- [HonoX Documentation](https://github.com/honojs/honox)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Hyperdrive](https://developers.cloudflare.com/hyperdrive/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Shiki](https://shiki.style/)
