import { createRoute } from "honox/factory";
import { getAllPosts } from "../../lib/posts";

export default createRoute(async (c) => {
    const { name } = c.req.param() as { name: string };
    const posts = await getAllPosts();
    const filteredPosts = posts.filter(
        (post) =>
            post.frontmatter.category?.toLowerCase() === name.toLowerCase(),
    );

    const pageTitle = `Category: ${name}`;

    return c.render(
        <div>
            <h1 className="text-4xl font-bold mb-8">{pageTitle}</h1>
            <ul className="space-y-4">
                {filteredPosts.map((post) => (
                    <li key={post.slug}>
                        <a
                            href={`/posts/${post.slug}`}
                            className="text-2xl text-blue-600 hover:underline"
                        >
                            {post.frontmatter.title ?? post.slug}
                        </a>
                        <p className="text-gray-600">{post.frontmatter.date}</p>
                    </li>
                ))}
            </ul>
        </div>,
    );
});
