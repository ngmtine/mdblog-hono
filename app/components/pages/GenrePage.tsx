import type { Post } from "../../lib/posts";

type Props = {
    genre: string;
    posts: Post[];
};

export const GenrePage = ({ genre, posts }: Props) => (
    <div class="rounded-xl bg-slate-200 p-2 dark:bg-gray-850">
        <h1 class="p-2 font-bold text-4xl">{genre}</h1>
        <ul class="rounded-xl bg-slate-300 p-4 leading-relaxed dark:bg-gray-800">
            {posts.map((post) => (
                <li key={post.slug}>
                    <a
                        href={`/posts/${post.slug}`} //
                        class="block hover:text-blue-400"
                    >
                        {post.frontmatter.title ?? post.slug}
                    </a>
                    <p class="text-gray-600">{post.frontmatter.date}</p>
                </li>
            ))}
        </ul>
    </div>
);
