import { createRoute } from "honox/factory";
import { Header } from "../../components/$header";
import { getPostBySlug } from "../../lib/posts";

export default createRoute(async (c) => {
    const { slug } = c.req.param() as { slug: string };

    if (!slug) {
        return c.notFound();
    }

    const post = await getPostBySlug({ directory: "dummy-posts", slug });

    if (!post) {
        return c.notFound();
    }

    return c.render(
        <div class="min-h-screen bg-white dark:bg-gray-900">
            <title>{post.frontmatter.title || slug}</title>
            <Header />
            <div class="max-w-4xl mx-auto px-4 py-8 pt-24">
                <article class="max-w-none">
                    <h1 class="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                        {post.frontmatter.title || slug}
                    </h1>
                    {post.frontmatter.date && (
                        <p class="text-gray-600 dark:text-gray-400 text-sm mb-6">
                            {new Date(
                                post.frontmatter.date,
                            ).toLocaleDateString()}
                        </p>
                    )}
                    <div
                        class="text-gray-800 dark:text-gray-200 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>
                <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <a
                        href="/"
                        class="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        ← Back to posts
                    </a>
                </div>
            </div>
        </div>,
    );
});
