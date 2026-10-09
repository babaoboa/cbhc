import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Key, keySizes, keyVariants } from "./Key";

const meta = {
  title: "Components/Key",
  component: Key,
  tags: ["autodocs"],
  args: {
    children: "Join the club",
    onClick: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: keyVariants },
    size: { control: "inline-radio", options: keySizes },
    children: { control: "text" },
  },
} satisfies Meta<typeof Key>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Quiet: Story = {
  args: { variant: "quiet" },
};

export const OnMask: Story = {
  args: { variant: "on-mask" },
};

export const Small: Story = {
  args: { size: "sm" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { loading: true, loadingLabel: "Joining" },
};

const states = [
  ["rest", {}],
  ["disabled", { disabled: true }],
  ["loading", { loading: true }],
] as const;

export const AllStates: Story = {
  render: (args) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, max-content)",
        gap: "var(--space-6) var(--space-8)",
        alignItems: "center",
      }}
    >
      <span />
      {states.map(([name]) => (
        <span
          key={name}
          className="text-label"
          style={{ color: "var(--ink-muted)" }}
        >
          {name}
        </span>
      ))}
      {keyVariants.flatMap((variant) =>
        keySizes.flatMap((size) => [
          <span
            key={`${variant}-${size}`}
            className="text-label"
            style={{ color: "var(--ink-muted)" }}
          >
            {variant} / {size}
          </span>,
          ...states.map(([name, state]) => (
            <Key
              key={`${variant}-${size}-${name}`}
              {...args}
              {...state}
              variant={variant}
              size={size}
            />
          )),
        ]),
      )}
    </div>
  ),
};
