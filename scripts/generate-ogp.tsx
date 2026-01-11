import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { ImageResponse } from "hono-og";

const POSTS_DIR = process.env.VITE_POSTS_REPO_DIR || "posts_repo";
const OUTPUT_DIR = "dist/ogp";
const USERNAME = process.env.VITE_AUTHOR || "";

// フォントデータを読み込み
const fontPath = path.join(process.cwd(), "public", "notosans_subset.ttf");
const fontData = fs.readFileSync(fontPath);

// 背景画像をBase64で読み込み
const bgImagePath = path.join(process.cwd(), "public", "ogp_background.png");
const bgImageData = fs.readFileSync(bgImagePath);
const bgImageBase64 = `data:image/png;base64,${bgImageData.toString("base64")}`;

// アイコン画像をBase64で読み込み
const iconPath = path.join(process.cwd(), "public", "twitter_icon.png");
const iconData = fs.readFileSync(iconPath);
const iconBase64 = `data:image/png;base64,${iconData.toString("base64")}`;

type PostFrontmatter = {
    title?: string;
    published?: boolean;
};

const generateOgpImage = async (title: string, outputPath: string) => {
    const response = new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                color: "#e8e9ec",
                textShadow: "2px 2px 4px rgba(0,0,0,0.4)",
                backgroundImage: `url(${bgImageBase64})`,
                backgroundSize: "cover",
            }}
        >
            <h1
                style={{
                    fontSize: 80,
                    textAlign: "center",
                    maxWidth: "85%",
                }}
            >
                {title}
            </h1>

            <div
                style={{
                    position: "absolute",
                    bottom: 50,
                    left: 900,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <img src={iconBase64} alt="user" style={{ borderRadius: "50%", marginRight: 15, width: 80, height: 80 }} />

                <div style={{ display: "flex" }}>
                    <p style={{ fontSize: 30, display: "flex" }}>{USERNAME}</p>
                </div>
            </div>
        </div>,
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: "NotoSans",
                    data: fontData,
                    style: "normal",
                },
            ],
        },
    );

    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
    console.log(`Generated: ${outputPath}`);
};

const main = async () => {
    // 出力ディレクトリを作成
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // 投稿ディレクトリ
    const postsDir = path.join(process.cwd(), POSTS_DIR, "posts");

    if (!fs.existsSync(postsDir)) {
        console.error(`Posts directory not found: ${postsDir}`);
        process.exit(1);
    }

    // 全投稿を取得
    const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

    for (const file of files) {
        const slug = file.replace(/\.md$/, "");
        const filePath = path.join(postsDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const { data } = matter(content) as { data: PostFrontmatter };

        // 非公開の投稿はスキップ
        if (!data.published) {
            continue;
        }

        const title = data.title || slug;
        const outputPath = path.join(OUTPUT_DIR, `${slug}.png`);

        await generateOgpImage(title, outputPath);
    }

    console.log("OGP image generation completed!");
};

main().catch(console.error);
