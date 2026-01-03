import { PostCard } from "../PostCard";
import { Card } from "../ui/Card";
import type { Post } from "../../lib/posts";

type Props = {
    posts: Post[];
};

export const IndexPage = (
    { posts }: Props, //
) => (
    <Card class="p-2">
        {posts.length === 0 ? ( //
            <p>Loading posts...</p>
        ) : (
            posts.map((post) => (
                <PostCard //
                    key={post.slug}
                    post={post}
                />
            ))
        )}
    </Card>
);
