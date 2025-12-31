import { createRoute } from "honox/factory";

import { addLike, getLikeCount } from "../../lib/db";

// GET: 特定の投稿のいいね数を取得
export const GET = createRoute(async (c) => {
    try {
        const postId = c.req.query("postId");

        if (!postId || Number.isNaN(Number(postId))) {
            return c.json({ error: "Invalid postId" }, 400);
        }

        const likeCount = await getLikeCount(Number(postId));

        return c.json({ likeCount });
    } catch (error) {
        console.error("Error fetching like count:", error);
        return c.json({ error: "Failed to fetch like count" }, 400);
    }
});

// POST: いいね付与＆いいね数取得
export const POST = createRoute(async (c) => {
    try {
        const forwardedFor = c.req.header("x-forwarded-for");
        const userIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
        const userAgent = c.req.header("user-agent") ?? "unknown";

        const body = await c.req.json<{ postId: number }>();
        const { postId } = body;

        if (!postId || typeof postId !== "number") {
            return c.json({ error: "Invalid postId" }, 400);
        }

        // いいね実行
        await addLike(postId, userIp, userAgent);

        // いいねカウント
        const likeCount = await getLikeCount(postId);

        return c.json({ message: "Like recorded", likeCount });
    } catch (error) {
        console.error("Error recording like:", error);
        return c.json({ error: "Failed to record like" }, 400);
    }
});
