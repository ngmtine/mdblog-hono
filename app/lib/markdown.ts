import type { Post } from "./posts";

// Check if we're in Node.js environment (build time or dev) vs Workers runtime
const isNodeEnv = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
const isViteDev = import.meta.env?.DEV === true;
export const canUseNodeModules = isNodeEnv || isViteDev;

export type PostFrontmatter = {
    id?: number; // DB上のpost_id（likes機能で使用）
    title?: string;
    create_date?: string;
    update_date?: string;
    genre?: string;
    published?: boolean;
    [key: string]: unknown;
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
export const parseMarkdown = async (
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
    const remarkBreaks = (await import("remark-breaks")).default;
    const remarkRehype = (await import("remark-rehype")).default;
    const rehypeStringify = (await import("rehype-stringify")).default;
    const rehypeShiki = (await import("@shikijs/rehype")).default;
    const rehypeExternalLinks = (await import("rehype-external-links")).default;

    const { data, content: markdownContent } = matter(file);

    const processedFile = await remark()
        .use(remarkGfm)
        .use(remarkFrontmatter)
        .use(remarkBreaks)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeShiki, {
            themes: {
                light: "github-light",
                dark: "github-dark",
            },
        })
        .use(rehypeExternalLinks, {
            target: "_blank",
            rel: ["noopener", "noreferrer"],
        })
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(markdownContent);

    let content = String(processedFile);
    // 画像の相対パスをルート相対パスに変換
    content = content.replace(/src="images([^"]*)"/g, 'src="/images/$1"');

    // 本文の冒頭1行を抜粋
    const excerpt = extractExcerpt(markdownContent);

    return {
        slug, //
        frontmatter: data as PostFrontmatter,
        content,
        excerpt,
    };
};
