import { jsxRenderer } from "hono/jsx-renderer";
import { Link, Script } from "honox/server";
import { Header } from "../components/header";
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
                <Link href="/app/style.css" rel="stylesheet" />
                <Script src="/app/client.ts" async />
            </head>
            <body className="flex flex-col min-h-screen">
                <Header />
                <div className="flex flex-1">
                    <Sidebar posts={posts} categories={categories} />
                    <main className="flex-1 p-8">{children}</main>
                </div>
            </body>
        </html>
    );
});
