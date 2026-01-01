import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { BASE_URL } from "../app/lib/constants";

const POSTS_DIR = import.meta.env.VITE_POSTS_REPO_DIR || "posts_repo";
const DIST_DIR = "dist/posts";

type PostFrontmatter = {
    title?: string;
    published?: boolean;
};

const extractExcerpt = (content: string): string => {
    const lines = content.split("\n");
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("```") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
            continue;
        }
        return trimmed;
    }
    return "";
};

const main = async () => {
    const postsDir = path.join(process.cwd(), POSTS_DIR, "posts");
    const distDir = path.join(process.cwd(), DIST_DIR);

    if (!fs.existsSync(postsDir)) {
        console.error(`Posts directory not found: ${postsDir}`);
        process.exit(1);
    }

    const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

    for (const file of files) {
        const slug = file.replace(/\.md$/, "");
        const filePath = path.join(postsDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const { data, content: markdownContent } = matter(content) as { data: PostFrontmatter; content: string };

        if (!data.published) {
            continue;
        }

        const ogTitle = data.title || slug;
        const ogDescription = extractExcerpt(markdownContent);
        const ogImage = `${BASE_URL}/ogp/${encodeURIComponent(slug)}.png`;
        const ogUrl = `${BASE_URL}/posts/${encodeURIComponent(slug)}`;

        // HTMLファイルを更新
        const htmlPath = path.join(distDir, `${slug}.html`);
        if (!fs.existsSync(htmlPath)) {
            console.log(`HTML not found: ${htmlPath}`);
            continue;
        }

        let html = fs.readFileSync(htmlPath, "utf-8");

        // OGPメタタグを生成
        const ogpTags = `<meta property="og:title" content="${escapeHtml(ogTitle)}"/><meta property="og:description" content="${escapeHtml(ogDescription)}"/><meta property="og:image" content="${ogImage}"/><meta property="og:url" content="${ogUrl}"/><meta name="twitter:title" content="${escapeHtml(ogTitle)}"/><meta name="twitter:description" content="${escapeHtml(ogDescription)}"/><meta name="twitter:image" content="${ogImage}"/>`;

        // <title></title>を更新
        html = html.replace(/<title><\/title>/, `<title>${escapeHtml(ogTitle)}</title>`);

        // og:typeの前にOGPタグを挿入
        html = html.replace(/<meta property="og:type"/, `${ogpTags}<meta property="og:type"`);

        fs.writeFileSync(htmlPath, html);
        console.log(`Updated: ${htmlPath}`);
    }

    console.log("OGP injection completed!");
};

const escapeHtml = (text: string): string => {
    return text //
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

main().catch(console.error);
