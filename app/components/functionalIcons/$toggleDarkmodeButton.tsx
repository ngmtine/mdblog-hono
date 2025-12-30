import { useEffect, useState } from "hono/jsx";

export const ToggleDarkmodeButton = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // 初期ロード時にlocalStorageから設定を読み込む
        const savedTheme = localStorage.getItem("theme");
        if (
            savedTheme === "dark" || //
            (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            document.documentElement.classList.add("dark");
            setIsDarkMode(true);
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light"); // 明示的にlightを設定
            setIsDarkMode(false);
        }
    }, []);

    const toggleDarkMode = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDarkMode(true);
        }
    };

    return (
        <div class="mb-1 ml-3 inline-block">
            <button
                type="button" //
                aria-label="toggle darkmode button"
                class="cursor-pointer"
                onClick={toggleDarkMode}
            >
                <svg
                    stroke="currentColor" //
                    fill="currentColor"
                    stroke-width="0"
                    viewBox="0 0 512 512"
                    class="h-9 w-9"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z"></path>
                    <title>toggle darkmode button</title>
                </svg>
            </button>
        </div>
    );
};
