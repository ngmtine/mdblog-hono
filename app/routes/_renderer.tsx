import { jsxRenderer, useRequestContext } from "hono/jsx-renderer";
import { Link, Script } from "honox/server";

import { Layout } from "../components/layout";
import { getAllPosts, getGenreList } from "../lib/posts";

type OgpProps = {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
};

export default jsxRenderer(async ({ children }) => {
    const c = useRequestContext();
    const posts = await getAllPosts();
    const genreList = getGenreList(posts);

    // コンテキストからOGP情報を取得
    const title = c.get("title");
    const ogp = c.get("ogp") as OgpProps | undefined;

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
            ogp={ogp}
        >
            {children}
        </Layout>
    );
});
