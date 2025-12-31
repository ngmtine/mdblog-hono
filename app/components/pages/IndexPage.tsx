import { PostCard } from "../PostCard";
import type { Post } from "../../lib/posts";

type Props = {
    posts: Post[];
};

export const IndexPage = ({ posts }: Props) => (
    <div class="rounded-xl border border-gray-400 bg-slate-200 p-2 dark:border-gray-700 dark:bg-gray-850">
        {posts.length === 0 ? ( //
            <p>Loading posts...</p>
        ) : (
            posts.map((post) => <PostCard key={post.slug} post={post} />)
        )}
    </div>
);
