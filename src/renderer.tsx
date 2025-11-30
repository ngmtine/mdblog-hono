import type { PropsWithChildren } from "hono/jsx";

type Props = PropsWithChildren & {
    title?: string;
};

export const renderer = ({ children, title }: Props) => {
    return (
        <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <link rel="stylesheet" href="/src/style.css" />
                <script type="module" src="/src/client.tsx"></script>
                <title>{title ? `${title} - My Blog` : "My Blog"}</title>
            </head>
            <body class="font-sans antialiased text-gray-800 bg-gray-100 min-h-screen flex flex-col">
                <header class="bg-blue-600 text-white p-4 shadow-md">
                    <div class="container mx-auto">
                        <a href="/" class="text-2xl font-bold">
                            My Blog
                        </a>
                    </div>
                </header>
                <main class="container mx-auto p-4 flex-grow">{children}</main>
                <footer class="bg-gray-800 text-white p-4 text-center mt-8">
                    <div class="container mx-auto">
                        &copy; {new Date().getFullYear()} My Blog. All rights
                        reserved.
                    </div>
                </footer>
            </body>
        </html>
    );
};
