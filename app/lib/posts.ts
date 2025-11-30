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
        [key: string]: any;
    };
    content: string;
};

export type PostMeta = {
    slug: string;
    frontmatter: {
        [key: string]: any;
    };
};

export const parseMarkdown = async (
    file: Buffer, //
): Promise<Post> => {
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

export const getAllPosts = async (
    directory = "dummy-posts",
): Promise<PostMeta[]> => {
    try {
        const files = await fs.readdir(directory);
        const posts = await Promise.all(
            files
                .filter((file) => file.endsWith(".md"))
                .map(async (file) => {
                    const filePath = path.join(directory, file);
                    const content = await fs.readFile(filePath, "utf-8");
                    const { data } = matter(content);
                    return {
                        slug: file.replace(/\.md$/, ""),
                        frontmatter: data,
                    };
                }),
        );
        return posts;
    } catch (error) {
        console.error("Error reading posts:", error);
        return [];
    }
};
