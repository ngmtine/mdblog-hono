import { Hono } from "hono";
import { ssgParams } from "hono/ssg";

import { AboutPage } from "./components/pages/AboutPage";
import { GenrePage } from "./components/pages/GenrePage";
import { IndexPage } from "./components/pages/IndexPage";
import { PostPage } from "./components/pages/PostPage";
import { getAllPosts, getPostBySlug } from "./lib/posts";
import { ssgRenderer } from "./lib/ssg-renderer";

// SSG build entry point: Use plain Hono with explicit routes
// Workers runtime uses server.ts with HonoX file-based routing
const app = new Hono();

// Use SSG-specific renderer (without honox/server dependencies)
app.use(ssgRenderer);

// Index route
app.get("/", async (c) => {
    const posts = await getAllPosts();
    // @ts-expect-error
    return c.render(<IndexPage posts={posts} />);
});

// About route
app.get("/about", (c) => {
    return c.render(<AboutPage />);
});

// Dynamic routes with ssgParams for posts
app.get(
    "/posts/:slug",
    ssgParams(async () => {
        const posts = await getAllPosts();
        return posts.map((post) => ({ slug: post.slug }));
    }),
    async (c) => {
        const slug = c.req.param("slug");
        if (!slug) return c.notFound();
        const post = await getPostBySlug({ slug });
        if (!post) return c.notFound();
        return c.render(<PostPage post={post} slug={slug} />);
    },
);

// Dynamic routes with ssgParams for categories
app.get(
    "/category/:category",
    ssgParams(async () => {
        const posts = await getAllPosts();
        const categories = [...new Set(posts.map((post) => post.frontmatter.category).filter((category): category is string => Boolean(category)))];
        return categories.map((category) => ({ category: category.toLowerCase() }));
    }),
    async (c) => {
        const category = c.req.param("category");
        if (!category) return c.notFound();

        const posts = await getAllPosts();
        const filteredPosts = posts.filter((post) => post.frontmatter.category?.toLowerCase() === category.toLowerCase());

        if (filteredPosts.length === 0) {
            return c.notFound();
        }

        return c.render(<GenrePage category={category} posts={filteredPosts} />);
    },
);

export default app;
