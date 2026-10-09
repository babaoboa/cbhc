import type { Meta, StoryObj } from "@storybook/react-vite";
import { Key } from "../key/Key";
import { Field, type FieldProps } from "./Field";

const meta = {
  title: "Components/Field",
  component: Field,
  tags: ["autodocs"],
  args: {
    label: "your name",
    placeholder: "e.g. Alex Morgan",
    help: "Use the name you would like us to call you.",
  },
  argTypes: {
    label: { control: "text" },
    help: { control: "text" },
    error: { control: "text" },
  },
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <Field {...args} />
    </div>
  ),
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

const filled = { defaultValue: "Alex Morgan" };
const errorEmpty = { error: "Please enter your name." };
const errorFilled = {
  label: "email address",
  type: "email",
  placeholder: "e.g. alex@example.com",
  defaultValue: "alex@",
  error: "Enter a complete email address.",
};
const disabled = { disabled: true, help: undefined };
const disabledFilled = { ...filled, disabled: true, help: undefined };
const readOnly = { ...filled, readOnly: true, help: undefined };

export const Empty: Story = {};

export const Filled: Story = { args: filled };

export const ErrorEmpty: Story = { name: "Error / empty", args: errorEmpty };

export const ErrorFilled: Story = { name: "Error / filled", args: errorFilled };

export const Disabled: Story = { args: disabled };

export const DisabledFilled: Story = {
  name: "Disabled / filled",
  args: disabledFilled,
};

export const ReadOnly: Story = { args: readOnly };

const states: [string, Partial<FieldProps>][] = [
  ["empty", {}],
  ["filled", filled],
  ["error / empty", errorEmpty],
  ["error / filled", errorFilled],
  ["disabled / empty", disabled],
  ["disabled / filled", disabledFilled],
  ["read only", readOnly],
];

// Hover and focus are live: point at or tab into any field.
export const AllStates: Story = {
  render: (args) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "var(--space-6) var(--space-8)",
        alignItems: "start",
      }}
    >
      {states.map(([name, state]) => (
        <div key={name} style={{ display: "grid", gap: "var(--space-3)" }}>
          <span className="text-label" style={{ color: "var(--ink-muted)" }}>
            {name}
          </span>
          <Field {...args} {...state} />
        </div>
      ))}
    </div>
  ),
};

export const WithKey: Story = {
  args: {
    label: "email address",
    type: "email",
    placeholder: "e.g. alex@example.com",
    help: undefined,
  },
  render: (args) => (
    <form
      onSubmit={(event) => event.preventDefault()}
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "var(--space-3)",
        maxWidth: 560,
      }}
    >
      <div style={{ flex: 1 }}>
        <Field {...args} />
      </div>
      <Key type="submit">Join the club</Key>
    </form>
  ),
};
