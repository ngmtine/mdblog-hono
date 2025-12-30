import { Hono } from "hono";
import { ssgParams } from "hono/ssg";
import { createApp } from "honox/server";
import { getAllPosts, getPostBySlug } from "./lib/posts";

// Check if we're in Node.js environment (build time for SSG)
const isNodeEnv = typeof process !== "undefined" && process.versions != null && process.versions.node != null;

let app: Hono;

if (isNodeEnv) {
    // For SSG build: Use plain Hono with explicit routes and ssgParams
    app = new Hono();

    // Import and use the renderer
    const { default: renderer } = await import("./routes/_renderer");
    app.use(renderer);

    // Index route
    app.get("/", async (c) => {
        const posts = await getAllPosts();
        return c.render(
            // @ts-expect-error
            <div>
                <title>Blog</title>
                <h1 class="text-4xl font-bold mb-8">Blog Posts</h1>
                <div class="space-y-6">
                    {posts.length === 0 ? (
                        <p class="text-gray-600 dark:text-gray-400">Loading posts...</p>
                    ) : (
                        posts.map((post) => (
                            <article key={post.slug} class="border-b border-gray-200 dark:border-gray-700 pb-6">
                                <h2 class="text-2xl font-semibold mb-2">
                                    <a href={`/posts/${post.slug}`} class="text-blue-600 dark:text-blue-400 hover:underline">
                                        {post.frontmatter.title || post.slug}
                                    </a>
                                </h2>
                                {post.frontmatter.date && <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">{new Date(post.frontmatter.date).toLocaleDateString()}</p>}
                                {post.frontmatter.description && <p class="text-gray-700 dark:text-gray-300">{post.frontmatter.description}</p>}
                            </article>
                        ))
                    )}
                </div>
            </div>,
        );
    });

    // About route
    app.get("/about", (c) => {
        return c.render(
            <div>
                <title>About</title>
                <h1 class="text-4xl font-bold mb-4">About</h1>
                <p class="text-gray-600 dark:text-gray-400">This is a blog built with HonoX.</p>
            </div>,
        );
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

            return c.render(
                <div>
                    <title>{post.frontmatter.title || slug}</title>
                    <article class="max-w-none">
                        <h1 class="text-4xl font-bold mb-4">{post.frontmatter.title || slug}</h1>
                        {post.frontmatter.date && <p class="text-gray-600 dark:text-gray-400 text-sm mb-6">{new Date(post.frontmatter.date).toLocaleDateString()}</p>}
                        <div class="leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
                    </article>
                    <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <a href="/" class="text-blue-600 dark:text-blue-400 hover:underline">
                            ← Back to posts
                        </a>
                    </div>
                </div>,
            );
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

            return c.render(
                <div>
                    <title>Category: {category}</title>
                    <h1 class="text-4xl font-bold mb-8">Category: {category}</h1>
                    <ul class="space-y-4">
                        {filteredPosts.map((post) => (
                            <li key={post.slug}>
                                <a href={`/posts/${post.slug}`} class="text-2xl text-blue-600 hover:underline">
                                    {post.frontmatter.title ?? post.slug}
                                </a>
                                <p class="text-gray-600">{post.frontmatter.date}</p>
                            </li>
                        ))}
                    </ul>
                </div>,
            );
        },
    );
} else {
    // For Workers runtime: Use HonoX file-based routing
    app = createApp();
}

export default app;
