import { useEffect, useState } from "hono/jsx";

type Theme = "light" | "dark" | "system";

export const ThemeSwitcher = () => {
    const [theme, setTheme] = useState<Theme>("system");

    // On component mount, read the theme from localStorage and update the state
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    const applyTheme = (selectedTheme: Theme) => {
        if (
            selectedTheme === "dark" ||
            (selectedTheme === "system" &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    const handleThemeChange = (e: Event) => {
        if (!(e.target instanceof HTMLSelectElement)) {
            return;
        }
        const newTheme = e.target.value as Theme;
        setTheme(newTheme); // Update state for the select dropdown

        // Apply theme and save preference
        if (newTheme === "system") {
            localStorage.removeItem("theme");
            applyTheme("system"); // Immediately apply system theme
        } else {
            localStorage.setItem("theme", newTheme);
            applyTheme(newTheme); // Immediately apply selected theme
        }
    };

    return (
        <div className="p-4">
            <label htmlFor="theme-switcher" className="mr-2">
                Theme:
            </label>
            <select
                id="theme-switcher"
                value={theme}
                onChange={handleThemeChange}
                className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded p-1"
            >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
            </select>
        </div>
    );
};
