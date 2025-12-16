import build from "@hono/vite-build/cloudflare-workers";
import adapter from "@hono/vite-dev-server/cloudflare";
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
            devServer: { adapter },
            client: { input: ["/app/client.ts", "/app/style.css"] },
        }),
        tailwindcss(),
        ssg({ entry: "./app/server.ts" }),
        build(),
    ],
    ssr: {
        external: ["remark", "gray-matter"],
    },
});
