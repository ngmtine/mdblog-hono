import build from "@hono/vite-build/cloudflare-workers";
import ssg from "@hono/vite-ssg";
import tailwindcss from "@tailwindcss/vite";
import honox from "honox/vite";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        target: "es2022",
    },
    plugins: [
        honox({
            devServer: {}, // Node.js mode for dev (no Cloudflare adapter)
            client: { input: ["/app/client.ts", "/app/style.css"] },
        }),
        tailwindcss(),
        ssg({ entry: "./app/server.tsx" }),
        build(),
    ],
    ssr: {
        external: ["remark", "gray-matter", "hono-og", "@vercel/og"],
    },
});
