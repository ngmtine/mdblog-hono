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
    const pageTitle = title ?? "My HonoX Blog";

    const categories = [
        ...new Set(
            posts
                .map((post) => post.frontmatter.category)
                .filter(Boolean) as string[],
        ),
    ];

    return (
        <html lang="ja">
            <head>
                <meta charset="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <link rel="icon" href="/favicon.ico" />
                <title>{title}</title>
                <script dangerouslySetInnerHTML={{ __html: themeScriptStr }} />
                <Link href="/app/style.css" rel="stylesheet" />
                <Script src="/app/client.ts" async />
            </head>
            <body className="bg-white dark:bg-gray-900 min-h-screen text-black dark:text-white">
                <Header />
                <div className="flex justify-center">
                    <div className="flex w-full max-w-5xl">
                        <aside className="hidden md:block top-0 sticky pt-30 pl-4 w-70 min-w-70 h-screen overflow-y-hidden">
                            <Sidebar posts={posts} categories={categories} />
                        </aside>
                        <main className="p-4 md:p-8 pt-30 md:pt-30 w-full overflow-x-hidden">
                            {children}
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
});
