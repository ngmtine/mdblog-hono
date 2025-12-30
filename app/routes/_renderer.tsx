import { jsxRenderer } from "hono/jsx-renderer";
import { Link, Script } from "honox/server";

import { Header } from "../components/$header";
import { Sidebar } from "../components/sidebar";
import { getAllPosts } from "../lib/posts";

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

// @ts-expect-error
export default jsxRenderer(async ({ children, title }) => {
    const posts = await getAllPosts();
    const _pageTitle = title ?? "My HonoX Blog";

    const categories = [
        ...new Set(
            posts //
                .map((post) => post.frontmatter.genre)
                .filter(Boolean) as string[],
        ),
    ];

    return (
        <html lang="ja">
            <head>
                <meta charset="utf-8" />
                <meta
                    name="viewport" //
                    content="width=device-width, initial-scale=1.0"
                />
                <link rel="icon" href="/favicon.ico" />
                <title>{title}</title>
                <script dangerouslySetInnerHTML={{ __html: themeScriptStr }} />
                <Link href="/app/style.css" rel="stylesheet" />
                <Script src="/app/client.ts" async />
            </head>
            <body class="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
                <Header />
                <div class="flex justify-center">
                    <div class="flex w-full max-w-5xl">
                        <aside class="sticky top-0 hidden h-screen w-70 min-w-70 overflow-y-hidden pt-30 pl-4 md:block">
                            <Sidebar posts={posts} categories={categories} />
                        </aside>
                        <main class="w-full overflow-x-hidden p-4 pt-30 md:p-8 md:pt-30">{children}</main>
                    </div>
                </div>
            </body>
        </html>
    );
});
