import { jsxRenderer } from "hono/jsx-renderer";
import { Link, Script } from "honox/server";
import type { Child } from "hono/jsx";

import { Layout } from "../components/layouts/layout";
import { extractGenreList, getAllPosts } from "../lib/posts";

export default jsxRenderer(async ({ children }: { children?: Child }) => {
    const posts = await getAllPosts();
    const genreList = extractGenreList(posts);

    // OGP情報はビルド後のinject-ogpスクリプトで注入される
    const headElements = (
        <>
            <Link
                href="/app/style.css" //
                rel="stylesheet"
            />
            <Script
                src="/app/client.ts" //
                async
            />
        </>
    );

    return (
        <Layout
            posts={posts} //
            genreList={genreList}
            headElements={headElements}
        >
            {children}
        </Layout>
    );
});
