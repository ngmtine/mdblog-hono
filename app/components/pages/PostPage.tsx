import { LikeButton } from "../../components/functionalIcons/$LikeButton";
import { HatenaShareButton } from "../HatenaShareButton";
import { TwitterShareButton } from "../TwitterShareButton";
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
        <div>
            <article class="max-w-none rounded-xl border border-gray-400 bg-slate-200 p-2 dark:border-gray-700 dark:bg-gray-850">
                <h1 class="p-2 font-bold text-4xl">{post.frontmatter.title || slug}</h1>
                {post.frontmatter.create_date && (
                    <p class="m-2 mt-0 flex justify-end text-gray-600 text-sm">
                        {new Date(post.frontmatter.create_date).toLocaleDateString()} {/* */}
                    </p>
                )}
                <div
                    class="rounded-xl border border-gray-400 bg-slate-300 p-4 leading-relaxed dark:border-gray-700 dark:bg-gray-800" //
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
                <div class="mt-4 mr-2 mb-1 flex items-center justify-end gap-4">
                    <HatenaShareButton slug={slug} />
                    <TwitterShareButton slug={slug} title={post.frontmatter.title} />
                    {post.frontmatter.id && <LikeButton postId={post.frontmatter.id} />}
                </div>
            </article>
            <nav class="mt-4 flex justify-between">
                <div>{prevPost && <a href={`/posts/${prevPost.slug}`}>{prevPostTitle}</a>}</div>
                <div>{nextPost && <a href={`/posts/${nextPost.slug}`}>{nextPostTitle}</a>}</div>
            </nav>
        </div>
    );
};
