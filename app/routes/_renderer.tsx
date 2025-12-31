import { jsxRenderer } from "hono/jsx-renderer";
import { Link, Script } from "honox/server";

import { getGenreList, Layout } from "../components/layout";
import { getAllPosts } from "../lib/posts";

// @ts-expect-error
export default jsxRenderer(async ({ children, title }) => {
    const posts = await getAllPosts();
    const genreList = getGenreList(posts);

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
            title={title} //
            posts={posts}
            genreList={genreList}
            headElements={headElements}
        >
            {children}
        </Layout>
    );
});
