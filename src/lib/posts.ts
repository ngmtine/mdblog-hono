import fs from "node:fs/promises";
import path from "node:path";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import { read } from "to-vfile";
import { matter } from "vfile-matter";

export type Post = {
    slug: string;
    frontmatter: {
        title: string;
        date: string;
        [key: string]: any;
    };
    content: string;
};

export const parseMarkdown = async (
    filePath: string, //
): Promise<Post> => {
    const file = await read(filePath);

    // Extract frontmatter
    matter(file, { strip: true });
    const frontmatter = file.data.matter as {
        title: string;
        date: string;
        [key: string]: any;
    };

    // Convert Markdown to HTML
    const processedFile = await remark()
        .use(remarkGfm)
        .use(remarkFrontmatter)
        .use(remarkRehype)
        .use(rehypeStringify)
        .process(file);

    const content = String(processedFile);
    const slug = filePath.split("/").pop()?.replace(/\.md$/, "") || "";

    return {
        slug,
        frontmatter,
        content,
    };
};

export const getPosts = async (
    postsDirectory: string, //
): Promise<Post[]> => {
    const files = await fs.readdir(postsDirectory);
    const markdownFiles = files.filter((file) => file.endsWith(".md"));

    const posts = await Promise.all(
        markdownFiles.map(async (file) => {
            const filePath = path.join(postsDirectory, file);
            return parseMarkdown(filePath);
        }),
    );

    // Sort posts by date in descending order
    posts.sort(
        (a, b) =>
            new Date(b.frontmatter.date).getTime() -
            new Date(a.frontmatter.date).getTime(),
    );

    return posts;
};

export const getPostBySlug = async (
    postsDirectory: string,
    slug: string,
): Promise<Post | undefined> => {
    const filePath = path.join(postsDirectory, `${slug}.md`);
    try {
        await fs.access(filePath); // Check if file exists
        return parseMarkdown(filePath);
    } catch (error) {
        console.error(error);
        return undefined;
    }
};
