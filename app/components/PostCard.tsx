import type { Post } from "../lib/posts";

type Props = {
    post: Post;
};

export const PostCard = ({ post }: Props) => (
    <article class="my-4 rounded-xl border border-gray-400 bg-slate-300 p-2 leading-relaxed dark:border-gray-700 dark:bg-gray-800">
        <a
            href={`/posts/${post.slug}`} //
            class="p-2 font-bold text-black! text-xl dark:text-white!"
        >
            {post.frontmatter.title || post.slug}
        </a>
        <div class="border-gray-400 border-b dark:border-gray-700" />
        {post.frontmatter.create_date && (
            <span class="flex justify-end text-gray-600 text-sm dark:text-gray-400">
                {new Date(post.frontmatter.create_date).toLocaleDateString()} {/* */}
            </span>
        )}
        {post.excerpt && (
            <p class="m-2 text-gray-700 dark:text-gray-300">
                {post.excerpt} {/* */}
            </p>
        )}
        <div class="flex justify-end">
            <a
                href={`/posts/${post.slug}`} //
                class="text-black! dark:text-white!"
            >
                ... 続きを読む
            </a>
        </div>
    </article>
);
