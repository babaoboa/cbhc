import type { Decorator, Preview } from "@storybook/react-vite";
import { themes, type Theme } from "../tokens";
// @ts-expect-error smth ig
import "../tokens/tokens.css";

const withTheme: Decorator = (Story, { globals, viewMode }) => (
  <div
    data-theme={globals.theme as Theme}
    style={{
      boxSizing: "border-box",
      minHeight: viewMode === "docs" ? undefined : "100vh",
      padding: 24,
      background: "var(--paper)",
      color: "var(--ink)",
    }}
  >
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Token theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [...themes],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "paper" },
  parameters: {
    layout: "fullscreen",
  },
};

export default preview;
