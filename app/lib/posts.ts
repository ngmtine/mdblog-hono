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
    content: string;
};

export const parseMarkdown = async (
    file: Buffer,
    slug: string, //
): Promise<Post> => {
    if (!canUseNodeModules) {
        return { slug, frontmatter: {}, content: "" };
    }

    const matter = (await import("gray-matter")).default;
    const { remark } = await import("remark");
    const remarkGfm = (await import("remark-gfm")).default;
    const remarkFrontmatter = (await import("remark-frontmatter")).default;
    const remarkRehype = (await import("remark-rehype")).default;
    const rehypeStringify = (await import("rehype-stringify")).default;

    const { data, content: markdownContent } = matter(file);

    const processedFile = await remark() //
        .use(remarkGfm)
        .use(remarkFrontmatter)
        .use(remarkRehype)
        .use(rehypeStringify)
        .process(markdownContent);

    let content = String(processedFile);
    // 画像の相対パスをルート相対パスに変換
    content = content.replace(/src="images([^"]*)"/g, 'src="/images/$1"');

    return { slug, frontmatter: data as PostFrontmatter, content };
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
        // File not found or other error - return undefined silently
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
        const files = await fs.readdir(directory);
        const posts = await Promise.all(
            files
                .filter((file) => file.endsWith(".md"))
                .map(async (file) => {
                    const slug = file.replace(/\.md$/, "");
                    const filePath = path.join(directory, file);
                    const fileContent = await fs.readFile(filePath);
                    return parseMarkdown(fileContent, slug);
                }),
        );
        // Sort by date descending (newest first)
        return posts.sort((a, b) => {
            const dateA = a.frontmatter.date //
                ? new Date(a.frontmatter.date).getTime()
                : 0;
            const dateB = b.frontmatter.date //
                ? new Date(b.frontmatter.date).getTime()
                : 0;
            return dateB - dateA;
        });
    } catch {
        // Directory not found or other error - return empty array silently
        return [];
    }
};
