import { LikeButton } from "../../components/functionalIcons/$LikeButton";
import { formatDate } from "../../lib/formatDate";
import { HatenaShareButton } from "../functionalIcons/HatenaShareButton";
import { TwitterShareButton } from "../functionalIcons/TwitterShareButton";
import { Card } from "../ui/Card";
import type { Post } from "../../lib/posts";

/**
 * 記事タイトルを指定した長さで省略する
 */
const truncateTitle = (title: string, maxLength = 15): string =>
    title.length > maxLength //
        ? `${title.slice(0, maxLength)}...`
        : title;

type Props = {
    post: Post;
    slug: string;
    prevPost?: Post;
    nextPost?: Post;
};

export const PostPage = ({ post, slug, prevPost, nextPost }: Props) => {
    const prevPostTitle = prevPost && `← ${truncateTitle(prevPost.frontmatter.title || prevPost.slug)}`;
    const nextPostTitle = nextPost && `${truncateTitle(nextPost.frontmatter.title || nextPost.slug)} →`;
    return (
        <>
            <Card
                variant="surface"
                as="article" //
                class="max-w-none p-2"
            >
                {/* タイトル */}
                <h1 class="p-2 font-bold text-4xl">
                    {post.frontmatter.title || slug} {/* */}
                </h1>

                {/* ボーダー */}
                <div class="border-gray-400 border-b dark:border-gray-700" />

                {/* 投稿日 */}
                {post.frontmatter.create_date && (
                    <p class="m-2 mt-0 flex justify-end text-gray-600 text-sm">
                        {formatDate(post.frontmatter.create_date)} {/* */}
                    </p>
                )}

                {/* 記事本体 */}
                <Card variant="inner" class="p-2 leading-relaxed md:p-4">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </Card>

                {/* ボタン類 */}
                <div class="mt-1 mr-2 -mb-1 flex items-center justify-end gap-4">
                    <HatenaShareButton slug={slug} />
                    <TwitterShareButton slug={slug} title={post.frontmatter.title} />
                    <LikeButton postId={post.frontmatter.id} />
                </div>
            </Card>

            {/* 前の記事, 次の記事 */}
            <nav class="mt-4 flex justify-between">
                <div>{prevPost && <a href={`/posts/${prevPost.slug}`}>{prevPostTitle}</a>}</div>
                <div>{nextPost && <a href={`/posts/${nextPost.slug}`}>{nextPostTitle}</a>}</div>
            </nav>
        </>
    );
};
