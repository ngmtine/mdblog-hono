import type { Post } from "../../lib/posts";

type Props = {
    post: Post;
    slug: string;
};

export const PostPage = ({ post, slug }: Props) => (
    <div>
        <article class="space-y-6 bg-gray-850 p-2 rounded-xl text-white max-w-none">
            <h1 class="text-4xl font-bold p-2">{post.frontmatter.title || slug}</h1>
            {post.frontmatter.create_date && (
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-6">
                    {new Date(post.frontmatter.create_date).toLocaleDateString()} {/* */}
                </p>
            )}
            <div
                class="leading-relaxed bg-gray-800 p-4 rounded-xl" //
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
