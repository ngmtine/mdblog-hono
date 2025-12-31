import { Hono } from "hono";
import { ssgParams } from "hono/ssg";

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

        // 前後の記事を取得（create_date順）
        const allPosts = await getAllPosts();
        const currentIndex = allPosts.findIndex((p) => p.slug === slug);
        const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : undefined;
        const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : undefined;

        return c.render(
            <PostPage
                post={post} //
                slug={slug}
                prevPost={prevPost}
                nextPost={nextPost}
            />,
        );
    },
);

// Dynamic routes with ssgParams for genreList
app.get(
    "/genre/:genre",

    ssgParams(async () => {
        const posts = await getAllPosts();
        const genreList = [
            ...new Set(
                posts
                    .map((post) => post.frontmatter.genre) //
                    .filter((genre): genre is string => Boolean(genre)),
            ),
        ];
        return genreList.map((genre) => ({ genre: genre.toLowerCase() }));
    }),

    async (c) => {
        const genre = c.req.param("genre");
        if (!genre) return c.notFound();

        const posts = await getAllPosts();
        const filteredPosts = posts.filter(
            (post) => post.frontmatter.genre?.toLowerCase() === genre.toLowerCase(), //
        );

        if (filteredPosts.length === 0) return c.notFound();
        return c.render(<GenrePage genre={genre} posts={filteredPosts} />);
    },
);

export default app;
