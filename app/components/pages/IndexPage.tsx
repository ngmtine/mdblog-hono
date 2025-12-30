import type { Post } from "../../lib/posts";

type Props = {
    posts: Post[];
};

export const IndexPage = ({ posts }: Props) => (
    <div class="rounded-xl bg-slate-200 p-2 dark:bg-gray-850">
        {posts.length === 0 ? (
            <p>Loading posts...</p>
        ) : (
            posts.map((post) => (
                <article
                    key={post.slug} //
                    class="my-4 rounded-xl bg-slate-300 p-2 leading-relaxed dark:bg-gray-800"
                >
                    <a
                        href={`/posts/${post.slug}`} //
                        class="p-2 font-bold text-xl"
                    >
                        {post.frontmatter.title || post.slug}
                    </a>
                    {post.frontmatter.create_date && (
                        <p class="m-2 mt-0 flex justify-end text-gray-600 text-sm">
                            {new Date(post.frontmatter.create_date).toLocaleDateString()} {/* */}
                        </p>
                    )}
                </article>
            ))
        )}
    </div>
);
