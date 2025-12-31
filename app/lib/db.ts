// Supabase REST API client

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const SCHEMA = "mdblog";

type SupabaseRequestOptions = {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
};

/**
 * Supabase REST APIにリクエストを送信する
 */
const supabaseRequest = async <T>(endpoint: string, options: SupabaseRequestOptions = {}): Promise<T> => {
    const { method = "GET", body, headers = {} } = options;

    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;

    const response = await fetch(url, {
        method,
        headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            "Accept-Profile": SCHEMA,
            "Content-Profile": SCHEMA,
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase API error: ${response.status} ${errorText}`);
    }

    // 201 Created または 204 No Content の場合は空のボディ
    if (response.status === 201 || response.status === 204) {
        return {} as T;
    }

    return response.json() as Promise<T>;
};

/**
 * いいね数を取得する
 */
export const getLikeCount = async (postId: number): Promise<number> => {
    const result = await supabaseRequest<{ count: number }[]>(`likes?select=count&post_id=eq.${postId}`, {
        headers: {
            Prefer: "count=exact",
        },
    });
    return result[0]?.count ?? 0;
};

/**
 * いいねを追加する
 */
export const addLike = async (postId: number, userIp: string, userAgent: string): Promise<void> => {
    await supabaseRequest("likes", {
        method: "POST",
        body: {
            post_id: postId,
            user_ip: userIp,
            user_agent: userAgent,
        },
        headers: {
            Prefer: "return=minimal",
        },
    });
};
