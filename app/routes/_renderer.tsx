import { jsxRenderer } from "hono/jsx-renderer";
import { Link, Script } from "honox/server";
import { Header } from "../components/$header";
import { Sidebar } from "../components/sidebar";
import { getAllPosts } from "../lib/posts";

export default jsxRenderer(async ({ children, ...rest }) => {
    const posts = await getAllPosts();
    const title = rest.title ?? "My HonoX Blog";

    const categories = [
        ...new Set(
            posts.map((post) => post.frontmatter.category).filter(Boolean),
        ),
    ];

    return (
        <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <link rel="icon" href="/favicon.ico" />
                <title>{title}</title>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
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
            `,
                    }}
                />
                <Link href="/app/style.css" rel="stylesheet" />
                <Script src="/app/client.ts" async />
            </head>
            <body className="bg-white dark:bg-gray-900 min-h-screen text-black dark:text-white">
                <Header />
                <div className="flex mx-auto container">
                    <aside className="hidden lg:block top-0 sticky pt-30 border-gray-200 dark:border-gray-700 border-r w-1/4 h-screen overflow-y-hidden">
                        <Sidebar posts={posts} categories={categories} />
                    </aside>
                    <main className="flex-1 p-8 pt-30">{children}</main>
                </div>
            </body>
        </html>
    );
});
