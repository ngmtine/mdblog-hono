import { createRoute } from "honox/factory";
import { getAllPosts } from "../lib/posts";

export default createRoute(async (c) => {
    // getAllPosts returns empty array in Workers runtime
    const posts = await getAllPosts();

    return c.render(
        <div>
            <title>Blog</title>
            <h1 class="text-4xl font-bold mb-8">Blog Posts</h1>
            <div class="space-y-6">
                {posts.length === 0 ? (
                    <p class="text-gray-600 dark:text-gray-400">Loading posts...</p>
                ) : (
                    posts.map((post) => (
                        <article
                            key={post.slug} //
                            class="border-b border-gray-200 dark:border-gray-700 pb-6"
                        >
                            <h2 class="text-2xl font-semibold mb-2">
                                <a
                                    href={`/posts/${post.slug}`} //
                                    class="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {post.frontmatter.title || post.slug}
                                </a>
                            </h2>
                            {post.frontmatter.date && (
                                <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                    {new Date(post.frontmatter.date).toLocaleDateString()} {/* */}
                                </p>
                            )}
                            {post.frontmatter.description && (
                                <p class="text-gray-700 dark:text-gray-300">
                                    {post.frontmatter.description} {/* */}
                                </p>
                            )}
                        </article>
                    ))
                )}
            </div>
        </div>,
    );
});
