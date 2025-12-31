import { POSTS_DIRECTORY } from "./constants";

// Check if we're in Node.js environment (build time or dev) vs Workers runtime
const isNodeEnv = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
const isViteDev = import.meta.env?.DEV === true;
const canUseNodeModules = isNodeEnv || isViteDev;

export interface PostFrontmatter {
    title?: string;
    create_date?: string;
    update_date?: string;
    genre?: string;
    published?: boolean;
    [key: string]: unknown;
}

export type Post = {
    slug: string;
    frontmatter: PostFrontmatter;
    content: string; // 本文
    excerpt: string; // 記事一覧で表示する本文の冒頭1行
};

/**
 * Markdownファイルをパースして、本文の冒頭1行を抜粋する
 */
const extractExcerpt = (markdownContent: string): string => {
    const lines = markdownContent.split("\n");
    for (const line of lines) {
        const trimmed = line.trim();
        // 空行、見出し、コードブロック、リストをスキップ
        if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("```") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
            continue;
        }
        return trimmed;
    }
    return "";
};

/**
 * MarkdownファイルをパースしてPostオブジェクトを作成する
 */
const parseMarkdown = async (
    file: Buffer,
    slug: string, //
): Promise<Post> => {
    if (!canUseNodeModules) {
        return { slug, frontmatter: {}, content: "", excerpt: "" };
    }

    const matter = (await import("gray-matter")).default;
    const { remark } = await import("remark");
    const remarkGfm = (await import("remark-gfm")).default;
    const remarkFrontmatter = (await import("remark-frontmatter")).default;
    const remarkRehype = (await import("remark-rehype")).default;
    const rehypeStringify = (await import("rehype-stringify")).default;
    const rehypeShiki = (await import("@shikijs/rehype")).default;

    const { data, content: markdownContent } = matter(file);

    const processedFile = await remark() //
        .use(remarkGfm)
        .use(remarkFrontmatter)
        .use(remarkRehype)
        .use(rehypeShiki, {
            themes: {
                light: "github-light",
                dark: "github-dark",
            },
        })
        .use(rehypeStringify)
        .process(markdownContent);

    let content = String(processedFile);
    // 画像の相対パスをルート相対パスに変換
    content = content.replace(/src="images([^"]*)"/g, 'src="/images/$1"');

    // 本文の冒頭1行を抜粋
    const excerpt = extractExcerpt(markdownContent);

    return { slug, frontmatter: data as PostFrontmatter, content, excerpt };
};

type GetPostBySlugArgs = {
    directory?: string;
    slug: string;
};

export const getPostBySlug = async (
    args: GetPostBySlugArgs, //
): Promise<Post | undefined> => {
    if (!canUseNodeModules) {
        return undefined;
    }

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

export const getAllPosts = async (
    directory = POSTS_DIRECTORY, //
): Promise<Post[]> => {
    if (!canUseNodeModules) {
        return [];
    }

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
            const dateA = a.frontmatter.date //
                ? new Date(a.frontmatter.create_date ?? 2020).getTime()
                : 0;
            const dateB = b.frontmatter.date //
                ? new Date(b.frontmatter.create_date ?? 2020).getTime()
                : 0;
            return dateB - dateA;
        });

        return postList;
    } catch {
        return [];
    }
};
