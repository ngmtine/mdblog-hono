import { ssgParams } from "hono/ssg";
import { createRoute } from "honox/factory";

import { PostPage } from "../../components/pages/PostPage";
import { getAllPosts, getPostBySlug } from "../../lib/posts";

export default createRoute(
    // SSG: Generate static files for each post slug
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
