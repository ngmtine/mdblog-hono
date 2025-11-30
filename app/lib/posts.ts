import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";

export type Post = {
    frontmatter: {
        [key: string]: unknown;
    };
    content: string;
};

export const parseMarkdown = async (file: Buffer): Promise<Post> => {
    const { data, content: markdownContent } = matter(file);

    // Convert Markdown to HTML
    const processedFile = await remark()
        .use(remarkGfm)
        .use(remarkFrontmatter)
        .use(remarkRehype)
        .use(rehypeStringify)
        .process(markdownContent);

    const content = String(processedFile);

    return { frontmatter: data, content };
};

type GetPostBySlugArgs = {
    directory: string;
    slug: string;
};

export const getPostBySlug = async (
    args: GetPostBySlugArgs,
): Promise<Post | undefined> => {
    const { directory = "dummy-posts", slug } = args;

    try {
        const filePath = path.join(directory, `${slug}.md`);
        const file = await fs.readFile(filePath);
        return parseMarkdown(file);
    } catch (error) {
        console.error(error);
        return undefined;
    }
};
