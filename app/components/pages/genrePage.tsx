import { PostCard } from "../postCard";
import { Card } from "../ui/card";
import type { Post } from "../../lib/posts";

type Props = {
    genre: string;
    posts: Post[];
};

export const GenrePage = ({ genre, posts }: Props) => (
    <Card class="p-2">
        <h1 class="p-2 font-bold text-4xl">{genre}</h1>
        <div>
            {posts.map((post) => (
                <PostCard
                    key={post.slug} //
                    post={post}
                />
            ))}
        </div>
    </Card>
);
