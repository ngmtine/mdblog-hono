# Cloudflare Hyperdrive セットアップ手順

このドキュメントでは、Cloudflare Hyperdriveを使用してCloudflare WorkersからPostgreSQLに接続する方法を説明します。

## 概要

Cloudflare Workersは外部ドメインへの接続がポート80/443に制限されているため、PostgreSQLの標準ポート5432への直接接続ができません。Hyperdriveはこの制限を回避し、Cloudflare Workersからデータベースへの高速な接続を実現するサービスです。

## 前提条件

- Cloudflareアカウント
- Wrangler CLIがインストール済み（`npm install -g wrangler`）
- PostgreSQLデータベース（Supabase等）

## 1. Hyperdriveの作成

```bash
npx wrangler hyperdrive create <hyperdrive-name> \
  --connection-string="postgres://user:password@host:5432/database"
```

### Supabaseの場合

Supabaseダッシュボードで接続文字列を取得します：
1. **Settings** → **Database**
2. **Connection string** → **URI** をコピー

```bash
npx wrangler hyperdrive create mdblog-hyperdrive \
  --connection-string="postgres://postgres.[project-ref]:[password]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

成功すると以下のような出力が表示されます：
```
✅ Created new Hyperdrive PostgreSQL config: aa2c6750b8ff49f1b478866c189d20d7
```

## 2. wrangler.jsoncの設定

作成したHyperdrive IDを`wrangler.jsonc`に追加します：

```jsonc
{
    "hyperdrive": [
        {
            "binding": "HYPERDRIVE",
            "id": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        }
    ]
}
```

## 3. コードの実装

### db.ts

```typescript
import { Client } from "pg";

// Hyperdrive binding type
export type HyperdriveBinding = {
    connectionString: string;
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
};

const executeQuery = async <T>(
    hyperdrive: HyperdriveBinding,
    query: string,
    params: (string | number)[] = []
): Promise<T[]> => {
    // 個別パラメータを使用（connectionStringは特殊文字で問題が起きる場合があるため）
    const client = new Client({
        host: hyperdrive.host,
        port: hyperdrive.port,
        user: hyperdrive.user,
        password: hyperdrive.password,
        database: hyperdrive.database,
    });

    try {
        await client.connect();
        const result = await client.query(query, params);
        return result.rows as T[];
    } finally {
        await client.end();
    }
};

export const getLikeCount = async (
    hyperdrive: HyperdriveBinding,
    postId: number
): Promise<number> => {
    const query = `
        SELECT COUNT(*) as like_count
        FROM mdblog.likes
        WHERE post_id = $1
    `;
    const result = await executeQuery<{ like_count: string }>(
        hyperdrive,
        query,
        [postId]
    );
    return Number(result[0]?.like_count ?? 0);
};
```

### ルートハンドラでの使用

```typescript
import { createRoute } from "honox/factory";
import { type HyperdriveBinding, getLikeCount } from "../../lib/db";

type AppEnv = {
    HYPERDRIVE: HyperdriveBinding;
};

export const GET = createRoute(async (c) => {
    const env = c.env as AppEnv;
    const likeCount = await getLikeCount(env.HYPERDRIVE, 1);
    return c.json({ likeCount });
});
```

## 4. ローカル開発

ローカル開発時は、環境変数でローカル接続文字列を設定する必要があります。

### 方法1: package.jsonで設定（推奨）

```json
{
    "scripts": {
        "preview": "dotenv -- sh -c 'CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE=\"$VITE_DB_CONNECTION_STRING\" wrangler dev'"
    }
}
```

`.env`ファイルに`VITE_DB_CONNECTION_STRING`を設定しておけば、自動的にローカル接続文字列として使用されます。

### 方法2: 環境変数を直接設定

```bash
export CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="postgres://user:password@host:5432/database"
npm run preview
```

## 5. vite.config.tsの設定

`pg`パッケージをSSR外部モジュールとして設定します：

```typescript
export default defineConfig({
    ssr: {
        external: ["pg"],
    },
});
```

## トラブルシューティング

### エラー: `Cannot read properties of undefined (reading 'searchParams')`

パスワードに特殊文字（`|`, `(`, `)`, `$`, `#`, `!`など）が含まれている場合、`connectionString`のパースでエラーが発生します。

**解決策**: `connectionString`の代わりに、Hyperdriveオブジェクトの個別プロパティ（`host`, `port`, `user`, `password`, `database`）を使用してください。

```typescript
// NG: connectionStringを使用
const client = new Client({ connectionString: hyperdrive.connectionString });

// OK: 個別パラメータを使用
const client = new Client({
    host: hyperdrive.host,
    port: hyperdrive.port,
    user: hyperdrive.user,
    password: hyperdrive.password,
    database: hyperdrive.database,
});
```

### エラー: `Please setup Postgres locally and set the value of...`

ローカル開発時にHyperdriveローカル接続文字列が設定されていません。

**解決策**: 「4. ローカル開発」の手順に従って環境変数を設定してください。

### Cloudflare Workersのポート制限について

Cloudflare Workersは外部ドメインへの接続がポート80/443のみに制限されています。PostgreSQLの標準ポート5432への直接接続はできないため、Hyperdriveを使用する必要があります。

### DBへの書き込みが画面に即座に反映されない

**症状**: `INSERT`などの書き込み操作は即座にDBに反映されるが、その直後の`SELECT`で古い値が返される。画面への反映に数分かかる。

**原因**: Hyperdriveはデフォルトでクエリ結果をキャッシュします。これにより、書き込み直後の読み取りでも古いキャッシュ結果が返されることがあります。

**解決策**: Hyperdriveのキャッシュを無効化します。

#### 方法1: Cloudflareダッシュボードから設定（推奨）

1. Cloudflare Dashboard → **Workers & Pages** → **Hyperdrive**
2. 該当のHyperdriveを選択
3. **Settings** → **Caching** を **Disabled** に設定

#### 方法2: wrangler CLIで設定

```bash
wrangler hyperdrive update <hyperdrive-id> --caching-disabled
```

例:
```bash
wrangler hyperdrive update aa2c6750b8ff49f1b478866c189d20d7 --caching-disabled
```

#### 方法3: wrangler.tomlで設定

```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "aa2c6750b8ff49f1b478866c189d20d7"
caching = { disabled = true }
```

**注意**: wrangler.tomlの設定だけでは既存のHyperdrive設定は更新されない場合があります。確実に反映させるには、ダッシュボードまたはCLIから設定してください。

**補足**: キャッシュを無効化するとパフォーマンスへの影響がありますが、「いいね」カウンターのようなリアルタイム性が必要な機能には必要な設定です。

### クライアント側での楽観的更新

Hyperdriveのキャッシュ問題を回避するもう一つの方法として、クライアント側で楽観的更新を実装する方法があります。

```typescript
const handleLike = async () => {
    const previousCount = getCurrentCount();

    // 楽観的更新: APIレスポンスを待たずにUIを更新
    updateDisplay(previousCount + 1);

    try {
        const response = await fetch("/api/likes", {
            method: "POST",
            body: JSON.stringify({ postId }),
        });

        // POSTが成功すればOK（レスポンスのlikeCountは使わない）
        // Hyperdriveのキャッシュにより古い値が返る可能性があるため
        if (!response.ok) throw new Error("response error");
    } catch (error) {
        // エラー時のみロールバック
        updateDisplay(previousCount);
    }
};
```

この方法では、サーバーからのレスポンス値を使わず、クライアント側で+1した値を信頼します。ただし、ページリロード時には依然としてキャッシュの影響を受けるため、根本的な解決にはHyperdriveのキャッシュ無効化が必要です。

## 参考リンク

- [Cloudflare Hyperdrive ドキュメント](https://developers.cloudflare.com/hyperdrive/)
- [Hyperdrive Configuration](https://developers.cloudflare.com/hyperdrive/configuration/)
