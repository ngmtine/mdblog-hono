import type {} from "hono";

declare module "hono" {
    interface Env {
        Variables: Record<string, never>;
        Bindings: Record<string, never>;
    }
}

interface ImportMetaEnv {
    readonly VITE_POSTS_REPO_DIR: string;
    readonly VITE_BASE_URL: string;
    readonly VITE_DB_CONNECTION_STRING: string;
    readonly VITE_AUTHOR: string;
}

// biome-ignore lint/correctness/noUnusedVariables: Vite環境変数の型拡張
interface ImportMeta {
    readonly env: ImportMetaEnv;
}
