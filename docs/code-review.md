# Code Review: mdblog-hono

## 概要

HonoX（Hono + Vite）を使用したMarkdownベースのブログシステムのコードレビュー結果。

**評価**: 全体的に高品質なコードベースであり、モダンな技術スタックを適切に活用している。

---

## 1. アーキテクチャ

### 良い点

- **SSGとWorkers Runtimeの分離**: `server.ts`（ファイルベースルーティング）と`server.tsx`（SSG用明示的ルーティング）を分離しており、ビルド時とランタイムで異なるコンテキストを適切に処理している
- **環境検出ロジック**: `canUseNodeModules`による環境判別は、Cloudflare Workersでのファイルシステム非対応を正しく考慮している
- **コンポーネント命名規則**: `$`プレフィックスでクライアントサイドコンポーネントを識別できる点は、チーム開発において有用

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

---

## 2. セキュリティ

### 良い点

- **パラメータ化クエリ**: SQLインジェクション対策として`$1, $2, $3`形式のプレースホルダーを使用
- **XSS対策**: Markdownコンテンツは`dangerouslySetInnerHTML`で出力されるが、remark/rehypeパイプラインでサニタイズされている

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

**現状** (`app/routes/api/likes.ts:54-55`):
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
- **キャッシュバスト**: いいねAPIではCDNキャッシュを明示的に無効化
- **楽観的更新**: いいねボタンはUI先行更新によるUX向上

### 改善提案

#### 3.1 画像の遅延読み込み

**現状** (`app/lib/posts.ts:79`):
```typescript
content = content.replace(/src="images([^"]*)"/g, 'src="/images/$1"');
```

画像タグに`loading="lazy"`が付与されていない。

**推奨**: 変換時に属性を追加、または`<img>`タグをRehypeプラグインで処理。

#### 3.2 フォントのプリロード

**現状**: OGP生成用フォントが`public/`にあるが、ブログ本体で使用するフォントのプリロードがない。

**推奨**: Web Fontsを使用する場合は`<link rel="preload">`を追加。

---

## 4. コード品質

### 良い点

- **TypeScript活用**: 適切な型定義（`Post`, `PostFrontmatter`, `AppEnv`等）
- **関数分割**: 単一責任の原則に従った関数設計
- **エラーハンドリング**: try-catch-finallyの適切な使用

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

#### 4.2 エラー型の明確化

**現状** (`app/routes/api/_middleware.ts`):
エラーメッセージの文字列比較でエラー種別を判定している可能性がある。

**推奨**: カスタムエラークラスを定義し、instanceofで判定。

```typescript
export class DatabaseNotConfiguredError extends Error {
    constructor() {
        super("Database not configured");
        this.name = "DatabaseNotConfiguredError";
    }
}
```

#### 4.3 コンポーネントの分離

**現状** (`app/components/layout.tsx:7-23`):
`themeScriptStr`がコンポーネントファイル内に定義されている。

**推奨**: `app/lib/theme.ts`等に分離し、テスト可能にする。

---

## 5. 保守性

### 良い点

- **明確なディレクトリ構造**: routes/components/libの責務が明確
- **環境変数の集約**: `constants.ts`で環境変数を一元管理
- **ビルドスクリプトの分割**: 各ステップが独立したnpmスクリプト

### 改善提案

#### 5.1 マジックナンバーの定数化

**現状**:
- `posts.slice(0, 10)` - サイドバーの表示件数
- `truncateTitle(title, maxLength = 15)` - タイトル省略文字数

**推奨**: `constants.ts`に定義。

```typescript
export const SIDEBAR_RECENT_POSTS_COUNT = 10;
export const TITLE_TRUNCATE_LENGTH = 15;
```

#### 5.2 コメントの言語統一

**現状**: 日本語コメントと英語コメントが混在。

**推奨**: どちらかに統一（推奨: 日本語プロジェクトであれば日本語）。

---

## 6. アクセシビリティ

### 良い点

- **aria属性**: ハンバーガーメニューに`aria-label`, `aria-expanded`を適切に設定
- **セマンティックHTML**: `<article>`, `<nav>`, `<aside>`を適切に使用
- **SVGアイコン**: `aria-hidden="true"`で装飾的アイコンを明示

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

**現状**: モバイルメニュー開閉時のフォーカストラップがない。

**推奨**: メニュー開閉時にフォーカスを適切に移動・閉じ込める。

---

## 7. テスト

### 現状

テストコードが見当たらない。

### 推奨

#### 7.1 ユニットテスト

- `extractExcerpt()`: 様々なMarkdown入力に対する抜粋結果
- `parseMarkdown()`: フロントマター解析、HTMLコンテンツ生成
- `getGenreList()`: 重複除去、空値処理

#### 7.2 統合テスト

- APIエンドポイント（`/api/likes`）のリクエスト/レスポンス
- SSGで生成されるHTMLの構造検証

---

## 8. 軽微な問題

| ファイル | 行 | 問題 | 推奨対応 |
|----------|-----|------|----------|
| `$LikeButton.tsx` | 88 | `text-md`はTailwindの標準クラスではない | `text-base`に変更 |
| `layout.tsx` | 75 | `max-w-85`はカスタム値 | `@theme`で定義またはarbitrary value `max-w-[85vw]` |
| `posts.ts` | 79 | 正規表現が`images/`のみ対応 | `./images/`や`../images/`も考慮 |

---

## 9. 総評

### 強み

1. **モダンな技術スタック**: HonoX + Cloudflare Workers + PostgreSQL（Hyperdrive）
2. **SSGによる高速配信**: ビルド時に静的HTML生成、CDN配信
3. **適切な責務分離**: コンポーネント、ルート、ユーティリティが整理されている
4. **ダークモード対応**: システム設定連携 + ユーザー選択保存
5. **楽観的UI更新**: いいね機能のUXが優れている

### 改善優先度

| 優先度 | 項目 | 理由 |
|--------|------|------|
| 高 | Rate Limiting | スパム攻撃への耐性がない |
| 高 | IPアドレス取得方法 | Cloudflare環境での正確性 |
| 中 | テスト追加 | リグレッション防止 |
| 中 | アクセシビリティ改善 | より多くのユーザーへの対応 |
| 低 | コード品質改善 | 長期的な保守性向上 |

---

## 10. 参考リンク

- [Hono Documentation](https://hono.dev/)
- [HonoX Documentation](https://github.com/honojs/honox)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Hyperdrive](https://developers.cloudflare.com/hyperdrive/)
