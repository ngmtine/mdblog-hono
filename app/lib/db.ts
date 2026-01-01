// PostgreSQL connection via Hyperdrive or connection string
import { Client } from "pg";

// Hyperdrive binding type（内部使用）
type HyperdriveBinding = {
    connectionString: string;
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
};

// c.envを拡張する型
export type AppEnv = {
    HYPERDRIVE?: HyperdriveBinding;
};

/**
 * Honoのc.envからAppEnv型を取得する
 * 型アサーションをdb.ts側に集約し、呼び出し側での明示的なアサーションを不要にする
 */
export const getAppEnv = (contextEnv: unknown): AppEnv => {
    return contextEnv as AppEnv;
};

// DB接続設定の型（内部使用）
type DbConfig =
    | { type: "hyperdrive"; hyperdrive: HyperdriveBinding } //
    | { type: "connectionString"; connectionString: string };

/**
 * DB接続設定を取得する（内部使用）
 * 本番環境: Hyperdriveを使用
 * 開発環境: connection stringを使用
 */
const getDbConfig = (env: AppEnv): DbConfig | null => {
    if (env.HYPERDRIVE?.host) {
        return { type: "hyperdrive", hyperdrive: env.HYPERDRIVE };
    }
    const connectionString = import.meta.env.VITE_DB_CONNECTION_STRING;
    if (connectionString) {
        return { type: "connectionString", connectionString };
    }
    return null;
};

type ExecuteQueryParams = {
    env: AppEnv;
    query: string;
    params?: (string | number)[];
};

/**
 * クエリを実行する
 * @throws Error DB接続設定が見つからない場合
 */
export const executeQuery = async <T>(
    { env, query, params = [] }: ExecuteQueryParams, //
): Promise<T[]> => {
    const config = getDbConfig(env);

    if (!config) {
        throw new Error("Database not configured");
    }

    const client =
        config.type === "hyperdrive"
            ? new Client({
                  host: config.hyperdrive.host,
                  port: config.hyperdrive.port,
                  user: config.hyperdrive.user,
                  password: config.hyperdrive.password,
                  database: config.hyperdrive.database,
              })
            : new Client({ connectionString: config.connectionString });

    try {
        await client.connect();
        const result = await client.query(query, params);
        return result.rows as T[];
    } finally {
        await client.end();
    }
};
