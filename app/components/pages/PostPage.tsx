import type { Post } from "../../lib/posts";

type Props = {
    post: Post;
    slug: string;
};

export const PostPage = ({ post, slug }: Props) => (
    <div>
        <title>{post.frontmatter.title || slug}</title>
        <article class="max-w-none">
            <h1 class="text-4xl font-bold mb-4">{post.frontmatter.title || slug}</h1>
            {post.frontmatter.date && <p class="text-gray-600 dark:text-gray-400 text-sm mb-6">{new Date(post.frontmatter.date).toLocaleDateString()}</p>}
            <div
                class="leading-relaxed" //
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
        </article>
        <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <a href="/" class="text-blue-600 dark:text-blue-400 hover:underline">
                ← Back to posts
            </a>
        </div>
    </div>
);
