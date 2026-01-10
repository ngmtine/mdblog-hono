import type { Child } from "hono/jsx";

export const cardStyles = {
    surface: "rounded-xl border border-gray-400 bg-slate-300 dark:border-gray-700 dark:bg-gray-800",
    inner: "rounded-xl border border-gray-400 bg-slate-200 dark:border-gray-700 dark:bg-gray-850",
} as const;

type Props = {
    as?: "div" | "article" | "nav" | "aside" | "section";
    variant?: keyof typeof cardStyles;
    class?: string;
    children: Child;
};

export const Card = (
    {
        as: Tag = "div", //
        variant = "surface",
        class: className,
        children,
    }: Props, //
) => (
    <Tag class={`${cardStyles[variant]} ${className ?? ""}`}>
        {children} {/* */}
    </Tag>
);
