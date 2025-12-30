import { ssgParams } from "hono/ssg";
import { createRoute } from "honox/factory";

import { GenrePage } from "../../components/pages/GenrePage";
import { getAllPosts } from "../../lib/posts";

// SSG: Generate static files for each category
export const ssg = ssgParams(async () => {
    const posts = await getAllPosts();
    const categories = [...new Set(posts.map((post) => post.frontmatter.category).filter((category): category is string => Boolean(category)))];
    return categories.map((category) => ({ category: category.toLowerCase() }));
});

export default createRoute(async (c) => {
    const category = c.req.param("category");
    if (!category) return c.notFound();

    const posts = await getAllPosts();
    const filteredPosts = posts.filter((post) => post.frontmatter.category?.toLowerCase() === category.toLowerCase());

    if (filteredPosts.length === 0) {
        return c.notFound();
    }

    return c.render(<GenrePage category={category} posts={filteredPosts} />);
});
