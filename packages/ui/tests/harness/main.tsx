import "../../tokens/tokens.css";
import { createRoot } from "react-dom/client";
import { stories, type StoryName } from "./stories";

// /?story=key&theme=mask&props={"variant":"quiet"}
const params = new URLSearchParams(location.search);
const Story = stories[(params.get("story") ?? "key") as StoryName];
const props = JSON.parse(params.get("props") ?? "{}");

document.documentElement.dataset.theme = params.get("theme") ?? "paper";

createRoot(document.getElementById("root")!).render(<Story {...props} />);
