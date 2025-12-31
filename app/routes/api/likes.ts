import { createRoute } from "honox/factory";

import { executeQuery } from "../../lib/db";

// GET: 特定の投稿のいいね数を取得
export const GET = createRoute(async (c) => {
    try {
        const postId = c.req.query("postId");

        if (!postId || Number.isNaN(Number(postId))) {
            return c.json({ error: "Invalid postId" }, 400);
        }

        const query = `
select
    count(*) as "like_count"
from
    mdblog.likes
where
    post_id = $1
;`;
        const params = [Number(postId)];
        const result = await executeQuery<{ like_count: number }>(query, params);
        const likeCount = result[0]?.like_count ?? 0;

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
        const addLikeQuery = `
insert into
    mdblog.likes (post_id, user_ip, user_agent)
values
    ($1, $2, $3)
;`;
        const addLikeParams = [postId, userIp, userAgent];
        await executeQuery(addLikeQuery, addLikeParams);

        // いいねカウント
        const countLikeQuery = `
select
    count(*) as "like_count"
from
    mdblog.likes
where
    post_id = $1
;`;
        const countLikeParams = [postId];
        const result = await executeQuery<{ like_count: number }>(countLikeQuery, countLikeParams);
        const likeCount = result[0]?.like_count;

        return c.json({ message: "Like recorded", likeCount });
    } catch (error) {
        console.error("Error recording like:", error);
        return c.json({ error: "Failed to record like" }, 400);
    }
});
