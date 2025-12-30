import type { Post } from "../../lib/posts";

type Props = {
    post: Post;
    slug: string;
};

export const PostPage = ({ post, slug }: Props) => (
    <div>
        <article class="max-w-none rounded-xl bg-gray-850 p-2 text-white">
            <h1 class="p-2 font-bold text-4xl">{post.frontmatter.title || slug}</h1>
            {post.frontmatter.create_date && (
                <p class="m-2 mt-0 flex justify-end text-gray-600 text-sm dark:text-gray-400">
                    {new Date(post.frontmatter.create_date).toLocaleDateString()} {/* */}
                </p>
            )}
            <div
                class="rounded-xl bg-gray-800 p-4 leading-relaxed" //
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
        </article>
        <div class="mt-8 border-gray-200 border-t pt-8 dark:border-gray-700">
            <a href="/" class="text-blue-600 hover:underline dark:text-blue-400">
                ← Back to posts
            </a>
        </div>
    </div>
);
