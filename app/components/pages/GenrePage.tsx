import type { Post } from "../../lib/posts";

type Props = {
    genre: string;
    posts: Post[];
};

export const GenrePage = ({ genre, posts }: Props) => (
    <div>
        <title>{genre}</title>
        <h1 class="mb-8 font-bold text-4xl">Genre: {genre}</h1>
        <ul class="space-y-4">
            {posts.map((post) => (
                <li key={post.slug}>
                    <a href={`/posts/${post.slug}`} class="text-2xl text-blue-600 hover:underline">
                        {post.frontmatter.title ?? post.slug}
                    </a>
                    <p class="text-gray-600">{post.frontmatter.date}</p>
                </li>
            ))}
        </ul>
    </div>
);
