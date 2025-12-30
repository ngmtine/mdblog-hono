import type { Post } from "../../lib/posts";

type Props = {
    post: Post;
    slug: string;
};

export const PostPage = ({ post, slug }: Props) => (
    <div>
        <article class="max-w-none rounded-xl bg-slate-200 p-2 dark:bg-gray-850">
            <h1 class="p-2 font-bold text-4xl">{post.frontmatter.title || slug}</h1>
            {post.frontmatter.create_date && (
                <p class="m-2 mt-0 flex justify-end text-gray-600 text-sm">
                    {new Date(post.frontmatter.create_date).toLocaleDateString()} {/* */}
                </p>
            )}
            <div
                class="rounded-xl bg-slate-300 p-4 leading-relaxed dark:bg-gray-800" //
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
        </article>
        <div class="mt-4">
            <a href="/" class="text-blue-600 dark:text-blue-400">
                ← Back to posts
            </a>
        </div>
    </div>
);
