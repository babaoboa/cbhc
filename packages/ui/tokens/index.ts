// Typed handles for the CSS custom properties in ./tokens.css.
// Colours resolve through var() so they follow the nearest data-theme.

export const themes = ["paper", "mask"] as const;
export type Theme = (typeof themes)[number];

const colorNames = [
  "paper",
  "paper-raised",
  "paper-sunken",
  "grid",
  "rule",
  "rule-strong",
  "ink",
  "ink-muted",
  "mask-green",
  "mask-green-trace",
  "mask-green-lip",
  "mask-black",
  "mask-purple",
  "mask-blue",
  "mask-red",
  "mask-white",
  "enig",
  "copper",
  "on-mask",
  "on-light-mask",
  "signal",
  "signal-text",
  "led-open",
  "led-soon",
  "led-off",
  "focus-ring",
] as const;
export type ColorToken = (typeof colorNames)[number];

export const color = Object.fromEntries(
  colorNames.map((name) => [name, `var(--${name})`]),
) as { readonly [K in ColorToken]: `var(--${K})` };

// Pixel values, for layout maths such as snapping to the 24px pitch.
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  24: 96,
} as const;
export type SpaceToken = keyof typeof space;

export const pitch = space[6];

export const radius = {
  0: 0,
  pad: 3,
  board: 8,
  hole: 999,
} as const;
export type RadiusToken = keyof typeof radius;

export const font = {
  serif: "var(--font-serif)",
  pixel: "var(--font-pixel)",
} as const;

export const textStyles = [
  "display",
  "title",
  "heading",
  "subhead",
  "lede",
  "body",
  "small",
  "small-italic",
  "readout",
  "key",
  "label",
] as const;
export type TextStyle = (typeof textStyles)[number];

export const focusShadow = "var(--focus-shadow)";
