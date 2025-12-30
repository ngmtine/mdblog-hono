import type { Post } from "../../lib/posts";

type Props = {
    posts: Post[];
};

export const IndexPage = ({ posts }: Props) => (
    <div>
        <title>Blog</title>
        <h1 class="mb-8 font-bold text-4xl">Blog Posts</h1>
        <div class="space-y-6">
            {posts.length === 0 ? (
                <p class="text-gray-600 dark:text-gray-400">Loading posts...</p>
            ) : (
                posts.map((post) => (
                    <article key={post.slug} class="border-gray-200 border-b pb-6 dark:border-gray-700">
                        <h2 class="mb-2 font-semibold text-2xl">
                            <a href={`/posts/${post.slug}`} class="text-blue-600 hover:underline dark:text-blue-400">
                                {post.frontmatter.title || post.slug}
                            </a>
                        </h2>
                        {post.frontmatter.date && (
                            <p class="mb-2 text-gray-600 text-sm dark:text-gray-400">
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
    </div>
);
