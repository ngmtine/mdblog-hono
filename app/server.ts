import { showRoutes } from "hono/dev";
import { createApp } from "honox/server";
import { getAllPosts } from "./lib/posts";

const app = createApp();

// Register dynamic routes for SSG
const posts = await getAllPosts("dummy-posts");
for (const post of posts) {
    app.get(`/posts/${post.slug}`, async (c) => {
        // This will be handled by the route file, but we register it for SSG
        return c.text("placeholder");
    });
}

showRoutes(app);

export default app;
