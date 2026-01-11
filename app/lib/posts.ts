import { POSTS_DIRECTORY } from "./constants";
import { canUseNodeModules, parseMarkdown } from "./markdown";
import type { PostFrontmatter } from "./markdown";

export type Post = {
    slug: string;
    frontmatter: PostFrontmatter;
    content: string; // 本文
    excerpt: string; // 記事一覧で表示する本文の冒頭1行
};

type GetPostBySlugArgs = {
    directory?: string;
    slug: string;
};

/**
 * 指定されたスラッグの記事を取得
 */
export const getPostBySlug = async (
    args: GetPostBySlugArgs, //
): Promise<Post | undefined> => {
    if (!canUseNodeModules) return undefined;

    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    const { directory = POSTS_DIRECTORY, slug } = args;

    try {
        const filePath = path.join(directory, `${slug}.md`);
        const file = await fs.readFile(filePath);
        return parseMarkdown(file, slug);
    } catch {
        return undefined;
    }
};

/**
 * 全記事を取得
 */
export const getAllPosts = async (
    directory = POSTS_DIRECTORY, //
): Promise<Post[]> => {
    if (!canUseNodeModules) return [];

    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    try {
        // ディレクトリ内のファイル一覧を取得
        const fileList = await fs.readdir(directory);

        // パースしてPostオブジェクトの配列を作成
        let postList = await Promise.all(
            fileList
                .filter((file) => file.endsWith(".md"))
                .map(async (file) => {
                    const slug = file.replace(/\.md$/, "");
                    const filePath = path.join(directory, file);
                    const fileContent = await fs.readFile(filePath);
                    return parseMarkdown(fileContent, slug);
                }),
        );

        // 公開済みの投稿のみフィルタリング
        postList = postList.filter((post) => post.frontmatter.published);

        // 作成日の降順でソート
        postList = postList.sort((a, b) => {
            const dateA = a.frontmatter.create_date //
                ? new Date(a.frontmatter.create_date).getTime()
                : 0;
            const dateB = b.frontmatter.create_date //
                ? new Date(b.frontmatter.create_date).getTime()
                : 0;
            return dateB - dateA;
        });

        return postList;
    } catch {
        return [];
    }
};

/**
 * 全記事からジャンル一覧を取得
 */
export const extractGenreList = (posts: Post[]): string[] => {
    return [
        ...new Set(
            posts
                .map((post) => post.frontmatter.genre) //
                .filter(Boolean) as string[],
        ),
    ];
};
