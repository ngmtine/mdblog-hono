import { createRoute } from "honox/factory";
import { Header } from "../components/$header";
import { getAllPosts } from "../lib/posts";

export default createRoute(async (c) => {
    const posts = await getAllPosts("dummy-posts");

    return c.render(
        <div class="min-h-screen bg-white dark:bg-gray-900">
            <title>Blog</title>
            <Header />
            <div class="max-w-4xl mx-auto px-4 py-8 pt-24">
                <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
                    Blog Posts
                </h1>
                <div class="space-y-6">
                    {posts.map((post) => (
                        <article
                            key={post.slug}
                            class="border-b border-gray-200 dark:border-gray-700 pb-6"
                        >
                            <h2 class="text-2xl font-semibold mb-2">
                                <a
                                    href={`/posts/${post.slug}`}
                                    class="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {post.frontmatter.title || post.slug}
                                </a>
                            </h2>
                            {post.frontmatter.date && (
                                <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                    {new Date(
                                        post.frontmatter.date,
                                    ).toLocaleDateString()}
                                </p>
                            )}
                            {post.frontmatter.description && (
                                <p class="text-gray-700 dark:text-gray-300">
                                    {post.frontmatter.description}
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </div>,
    );
});
