// PostgreSQL connection via Hyperdrive
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

/**
 * クエリを実行する
 * @param hyperdrive Hyperdriveバインディング
 */
const executeQuery = async <T>(hyperdrive: HyperdriveBinding, query: string, params: (string | number)[] = []): Promise<T[]> => {
    // 個別パラメータを使用（connectionStringは特殊文字で問題が起きるため）
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

/**
 * いいね数を取得する
 */
export const getLikeCount = async (hyperdrive: HyperdriveBinding, postId: number): Promise<number> => {
    const query = `
        SELECT COUNT(*) as like_count
        FROM mdblog.likes
        WHERE post_id = $1
    `;
    const result = await executeQuery<{ like_count: string }>(hyperdrive, query, [postId]);
    return Number(result[0]?.like_count ?? 0);
};

/**
 * いいねを追加する
 */
export const addLike = async (hyperdrive: HyperdriveBinding, postId: number, userIp: string, userAgent: string): Promise<void> => {
    const query = `
        INSERT INTO mdblog.likes (post_id, user_ip, user_agent)
        VALUES ($1, $2, $3)
    `;
    await executeQuery(hyperdrive, query, [postId, userIp, userAgent]);
};
