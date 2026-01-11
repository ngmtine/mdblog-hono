import type { Child } from "hono/jsx";

import { Header } from "./$header";
import { SidebarWrapper } from "./sidebarWrapper";
import type { Post } from "../../lib/posts";

export const themeScriptStr = `
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

type OgpProps = {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
};

type LayoutProps = {
    title?: string;
    posts: Post[];
    genreList: string[];
    headElements: Child;
    children: Child;
    ogp?: OgpProps;
};

export const Layout = ({ title, posts, genreList, headElements, children, ogp }: LayoutProps) => {
    return (
        <html lang="ja">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="icon" href="/favicon.ico" />
                <title>{title}</title>

                {/* OGP Meta Tags */}
                {ogp?.ogTitle && <meta property="og:title" content={ogp.ogTitle} />}
                {ogp?.ogDescription && <meta property="og:description" content={ogp.ogDescription} />}
                {ogp?.ogImage && <meta property="og:image" content={ogp.ogImage} />}
                {ogp?.ogUrl && <meta property="og:url" content={ogp.ogUrl} />}
                <meta property="og:type" content="article" />

                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                {ogp?.ogTitle && <meta name="twitter:title" content={ogp.ogTitle} />}
                {ogp?.ogDescription && <meta name="twitter:description" content={ogp.ogDescription} />}
                {ogp?.ogImage && <meta name="twitter:image" content={ogp.ogImage} />}

                <script dangerouslySetInnerHTML={{ __html: themeScriptStr }} />
                {headElements}
            </head>
            <body class="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
                <Header />
                <div class="mx-auto flex w-full max-w-5xl">
                    <SidebarWrapper
                        posts={posts.slice(0, 10)} // 最新10件のみ
                        genreList={genreList}
                    />
                    <main class="w-full overflow-x-hidden px-2 pt-18 pb-4 md:p-8 md:pt-20">{children}</main>
                </div>
            </body>
        </html>
    );
};
