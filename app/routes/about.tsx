import { createRoute } from "honox/factory";

import { AboutPage } from "../components/pages/AboutPage";

export default createRoute((c) => {
    return c.render(<AboutPage />);
});
