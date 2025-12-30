import { createRoute } from "honox/factory";
import { getAllPosts } from "../../lib/posts";

export default createRoute(async (c) => {
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
});
