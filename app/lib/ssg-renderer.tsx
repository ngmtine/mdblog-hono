import { jsxRenderer } from "hono/jsx-renderer";

import { Layout } from "../components/layout";
import { getAllPosts, getGenreList } from "./posts";

// Check if we're in Node.js environment
const isNodeEnv =
    typeof process !== "undefined" && //
    process.versions != null &&
    process.versions.node != null;

// SSG-specific renderer without honox/server dependencies
// @ts-expect-error
export const ssgRenderer = jsxRenderer(async ({ children, title }) => {
    const posts = await getAllPosts();
    const genreList = getGenreList(posts);

    // Load Vite manifest to get correct asset paths
    let styleHref = "/static/style.css";
    let clientSrc = "/static/client.js";
    if (isNodeEnv) {
        try {
            const fs = await import("node:fs/promises");
            const manifestContent = await fs.readFile("./dist/.vite/manifest.json", "utf-8");
            const manifest = JSON.parse(manifestContent);
            if (manifest["app/style.css"]) {
                styleHref = `/${manifest["app/style.css"].file}`;
            }
            if (manifest["app/client.ts"]) {
                clientSrc = `/${manifest["app/client.ts"].file}`;
            }
        } catch (_e) {
            // Fallback to default paths if manifest not found
        }
    }

    const headElements = (
        <>
            <link
                href={styleHref} //
                rel="stylesheet"
            />
            <script
                type="module" //
                src={clientSrc}
                async
            />
        </>
    );

    return (
        <Layout
            title={title} //
            posts={posts}
            genreList={genreList}
            headElements={headElements}
        >
            {children}
        </Layout>
    );
});
