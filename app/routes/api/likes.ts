import { createRoute } from "honox/factory";

import { executeQuery } from "../../lib/db";
import type { AppEnv, HyperdriveBinding } from "../../lib/db";

// いいね数を取得
const getLikeCount = async (hyperdrive: HyperdriveBinding | undefined, postId: number): Promise<number> => {
    const query = `
SELECT COUNT(*) as like_count
FROM mdblog.likes
WHERE post_id = $1
    `;
    const result = await executeQuery<{ like_count: string }>({ hyperdrive, query, params: [postId] });
    return Number(result[0]?.like_count ?? 0);
};

// いいねを追加
const addLike = async (hyperdrive: HyperdriveBinding | undefined, postId: number, userIp: string, userAgent: string): Promise<void> => {
    const query = `
INSERT INTO mdblog.likes (post_id, user_ip, user_agent)
VALUES ($1, $2, $3)
    `;
    await executeQuery({ hyperdrive, query, params: [postId, userIp, userAgent] });
};

// GET: 特定の投稿のいいね数を取得
export const GET = createRoute(async (c) => {
    const postId = c.req.query("postId");

    if (!postId || Number.isNaN(Number(postId))) {
        throw new Error("Invalid postId");
    }

    const env = c.env as AppEnv;
    const likeCount = await getLikeCount(env.HYPERDRIVE, Number(postId));

    return c.json({ likeCount });
});

// POST: いいね付与＆いいね数取得
export const POST = createRoute(async (c) => {
    const forwardedFor = c.req.header("x-forwarded-for");
    const userIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
    const userAgent = c.req.header("user-agent") ?? "unknown";

    const body = await c.req.json<{ postId: number }>();
    const { postId } = body;

    if (!postId || typeof postId !== "number") {
        throw new Error("Invalid postId");
    }

    const env = c.env as AppEnv;

    await addLike(env.HYPERDRIVE, postId, userIp, userAgent);
    const likeCount = await getLikeCount(env.HYPERDRIVE, postId);

    return c.json({ message: "Like recorded", likeCount });
});
