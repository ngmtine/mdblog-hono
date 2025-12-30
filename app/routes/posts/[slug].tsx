import { ssgParams } from "hono/ssg";
import { createRoute } from "honox/factory";
import { PostPage } from "../../components/pages/PostPage";
import { getAllPosts, getPostBySlug } from "../../lib/posts";

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

    return c.render(<PostPage post={post} slug={slug} />);
});
