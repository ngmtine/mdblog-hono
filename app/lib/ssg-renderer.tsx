import { jsxRenderer } from "hono/jsx-renderer";

import { Header } from "../components/$header";
import { Sidebar } from "../components/sidebar";
import { getAllPosts } from "./posts";

// Check if we're in Node.js environment
const isNodeEnv =
    typeof process !== "undefined" && //
    process.versions != null &&
    process.versions.node != null;

const themeScriptStr = `
    const theme = (() => {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme');
        }
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    })();

    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
`;

// SSG-specific renderer without honox/server dependencies
// @ts-expect-error
export const ssgRenderer = jsxRenderer(async ({ children, title }) => {
    const posts = await getAllPosts();

    const categories = [
        ...new Set(
            posts //
                .map((post) => post.frontmatter.category)
                .filter(Boolean) as string[],
        ),
    ];

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

    return (
        <html lang="ja">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="icon" href="/favicon.ico" />
                <title>{title}</title>
                <script dangerouslySetInnerHTML={{ __html: themeScriptStr }} />
                <link href={styleHref} rel="stylesheet" />
                <script type="module" src={clientSrc} async />
            </head>
            <body class="bg-white dark:bg-gray-900 min-h-screen text-black dark:text-white">
                <Header />
                <div class="flex justify-center">
                    <div class="flex w-full max-w-5xl">
                        <aside class="hidden md:block top-0 sticky pt-30 pl-4 w-70 min-w-70 h-screen overflow-y-hidden">
                            <Sidebar //
                                posts={posts}
                                categories={categories}
                            />
                        </aside>
                        <main class="p-4 md:p-8 pt-30 md:pt-30 w-full overflow-x-hidden">{children}</main>
                    </div>
                </div>
            </body>
        </html>
    );
});
