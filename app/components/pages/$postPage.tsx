import { useEffect } from "hono/jsx";

import { formatDate } from "../../lib/formatDate";
import { CopyButtonInjector } from "../$copyButtonInjector";
import { LikeButton } from "../functionalIcons/$likeButton";
import { HatenaShareButton } from "../functionalIcons/hatenaShareButton";
import { TwitterShareButton } from "../functionalIcons/twitterShareButton";
import { Card } from "../ui/card";
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

    useEffect(() => {
        const imageLoaders = document.querySelectorAll(".image-loader");
        imageLoaders.forEach((el) => {
            const div = el as HTMLElement;
            const src = div.dataset.src || "";
            const alt = div.dataset.alt || "";
            const className = div.dataset.class || "";
            div.innerHTML = `
                <div class="relative ${className}">
                    <div class="spinner absolute inset-0 flex items-center justify-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                    <img src="${src}" alt="${alt}" class="opacity-0 transition-opacity" loading="lazy" />
                </div>
            `;
            const img = div.querySelector("img") as HTMLImageElement;
            const spinner = div.querySelector(".spinner") as HTMLElement;
            if (img.complete) {
                spinner.style.display = "none";
                img.style.opacity = "1";
            } else {
                img.addEventListener("load", () => {
                    spinner.style.display = "none";
                    img.style.opacity = "1";
                });
                img.addEventListener("error", () => {
                    spinner.style.display = "none";
                    div.innerHTML = '<div class="bg-gray-200 dark:bg-gray-700 flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">画像の読み込みに失敗しました</div>';
                });
            }
        });
    }, []);

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
                    <CopyButtonInjector />
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
