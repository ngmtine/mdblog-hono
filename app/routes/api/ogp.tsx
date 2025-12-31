import { ImageResponse } from "@vercel/og";
import { createRoute } from "honox/factory";

const username = import.meta.env.VITE_AUTHOR || "";

export const GET = createRoute(async (c) => {
    const url = new URL(c.req.url);
    const title = url.searchParams.get("title") || "ナイスなタイトルが無いっす";

    // 各種リソースのurlを取得
    const baseUrl = `${url.protocol}//${url.host}`;
    const fontUrl = new URL("/notosans_subset.ttf", baseUrl).href;
    const bgImageUrl = new URL("/ogp_background.png", baseUrl).href;
    const iconUrl = new URL("/twitter_icon.png", baseUrl).href;

    const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());

    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                color: "#e8e9ec",
                textShadow: "2px 2px 4px rgba(0,0,0,0.4)",
                backgroundImage: `url(${bgImageUrl})`,
                backgroundSize: "cover",
            }}
        >
            {/* 記事タイトル */}
            <h1
                style={{
                    fontSize: 80,
                    textAlign: "center",
                    maxWidth: "85%",
                }}
            >
                {title}
            </h1>

            <div
                style={{
                    position: "absolute",
                    bottom: 50,
                    left: 900,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {/* アイコン */}
                <img
                    src={iconUrl} //
                    alt="user"
                    style={{ borderRadius: "50%", marginRight: 15, width: 80, height: 80 }}
                />

                {/* ユーザー名 */}
                <div style={{ display: "flex" }}>
                    <p style={{ fontSize: 30, display: "flex" }}>{username}</p>
                </div>
            </div>
        </div>,
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: "WebSubsetFont",
                    data: fontData,
                    style: "normal",
                },
            ],
        },
    );
});
