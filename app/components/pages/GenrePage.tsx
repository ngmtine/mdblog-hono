import { PostCard } from "../PostCard";
import type { Post } from "../../lib/posts";

type Props = {
    genre: string;
    posts: Post[];
};

export const GenrePage = ({ genre, posts }: Props) => (
    <div class="rounded-xl border border-gray-400 bg-slate-200 p-2 dark:border-gray-700 dark:bg-gray-850">
        <h1 class="p-2 font-bold text-4xl">{genre}</h1>
        <div>
            {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
            ))}
        </div>
    </div>
);
