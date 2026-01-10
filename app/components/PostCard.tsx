import { formatDate } from "../lib/formatDate";
import { Card } from "./ui/Card";
import type { Post } from "../lib/posts";

type Props = {
    post: Post;
};

/**
 * 記事概要コンポーネント
 */
export const PostCard = ({ post }: Props) => (
    <Card
        as="article" //
        variant="inner"
        class="my-4 p-2 leading-relaxed"
    >
        {/* タイトル */}
        <a
            href={`/posts/${post.slug}`} //
            class="p-2 font-bold text-black! text-xl dark:text-white!"
        >
            {post.frontmatter.title || post.slug}
        </a>

        {/* ボーダー */}
        <div class="border-gray-400 border-b dark:border-gray-700" />

        {/* 投稿日 */}
        {post.frontmatter.create_date && (
            <span class="flex justify-end text-gray-600 text-sm dark:text-gray-400">
                {formatDate(post.frontmatter.create_date)} {/* */}
            </span>
        )}

        {/* 記事概要 */}
        {post.excerpt && (
            <p class="m-2 text-gray-700 dark:text-gray-300">
                {post.excerpt} {/* */}
            </p>
        )}

        {/* 続き */}
        <div class="flex justify-end">
            <a
                href={`/posts/${post.slug}`} //
                class="text-black! dark:text-white!"
            >
                ... 続きを読む
            </a>
        </div>
    </Card>
);
