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

## 参考リンク

- [Cloudflare Hyperdrive ドキュメント](https://developers.cloudflare.com/hyperdrive/)
- [Hyperdrive Configuration](https://developers.cloudflare.com/hyperdrive/configuration/)
