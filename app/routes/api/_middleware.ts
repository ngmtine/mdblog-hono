import { createMiddleware } from "hono/factory";
import { disableSSG } from "hono/ssg";

// API共通エラーハンドリングミドルウェア
const errorHandlingMiddleware = createMiddleware(async (c, next) => {
    try {
        await next();
    } catch (error) {
        console.error("API Error:", error);

        const message = error instanceof Error ? error.message : "Internal server error";
        const status = message === "Database not configured" ? 500 : 400;

        return c.json({ error: message }, status);
    }
});

export default [disableSSG(), errorHandlingMiddleware];
