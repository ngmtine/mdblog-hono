import { ssgParams } from "hono/ssg";
import { createRoute } from "honox/factory";

import { PostPage } from "../../components/pages/PostPage";
import { getAllPosts, getPostBySlug } from "../../lib/posts";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

// SSG: Generate static files for each post slug
export const ssg = ssgParams(async () => {
    const posts = await getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
});

export default createRoute(async (c) => {
    const slug = c.req.param("slug");
    if (!slug) return c.notFound();
    const post = await getPostBySlug({ slug });
    if (!post) return c.notFound();

    // 前後の記事を取得（create_date順）
    const allPosts = await getAllPosts();
    const currentIndex = allPosts.findIndex((p) => p.slug === slug);
    const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : undefined;
    const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : undefined;

    // OGP情報を構築
    const ogTitle = post.frontmatter.title || slug;
    const ogDescription = post.excerpt || "";
    const ogImage = `${BASE_URL}/api/ogp?title=${ogTitle}`;
    const ogUrl = `${BASE_URL}/posts/${slug}`;

    // OGP情報をコンテキストに設定
    c.set("title", ogTitle);
    c.set("ogp", {
        ogTitle,
        ogDescription,
        ogImage,
        ogUrl,
    });

    return c.render(
        <PostPage
            post={post} //
            slug={slug}
            prevPost={prevPost}
            nextPost={nextPost}
        />,
    );
});
