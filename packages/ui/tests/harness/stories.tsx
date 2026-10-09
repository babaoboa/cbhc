import {
  Field,
  Key,
  keySizes,
  keyVariants,
  type FieldProps,
  type KeyProps,
} from "../../components";

declare global {
  interface Window {
    keyClicks: number;
  }
}

window.keyClicks = 0;

export type KeyStoryProps = Omit<KeyProps, "children" | "onClick" | "ref"> & {
  label?: string;
};

function KeyStory({ label = "Join the club", ...props }: KeyStoryProps) {
  return (
    <Key {...props} onClick={() => (window.keyClicks += 1)}>
      {label}
    </Key>
  );
}

const states = [{}, { disabled: true }, { loading: true }];

function KeyMatrix() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 248px)" }}>
      {keyVariants.flatMap((variant) =>
        keySizes.flatMap((size) =>
          states.map((state, i) => (
            <div
              key={`${variant}-${size}-${i}`}
              style={{ display: "flex", alignItems: "center", height: 64 }}
            >
              <Key variant={variant} size={size} {...state}>
                Join the club
              </Key>
            </div>
          )),
        ),
      )}
    </div>
  );
}

export type FieldStoryProps = Omit<FieldProps, "label" | "ref"> & {
  label?: string;
  width?: number;
};

const name = {
  label: "your name",
  placeholder: "e.g. Alex Morgan",
  help: "Use the name you would like us to call you.",
};

function FieldStory({ width = 480, ...props }: FieldStoryProps) {
  return (
    <div style={{ width }}>
      <Field {...name} {...props} />
    </div>
  );
}

const email = {
  label: "email address",
  placeholder: "e.g. alex@example.com",
  defaultValue: "alex@",
  error: "Enter a complete email address.",
};

const filled = { defaultValue: "Alex Morgan" };

const fieldStates: [string, Partial<FieldProps>][] = [
  ["empty", {}],
  ["filled", filled],
  ["error / empty", { error: "Please enter your name." }],
  ["error / filled", email],
  ["disabled / empty", { disabled: true, help: undefined }],
  ["disabled / filled", { ...filled, disabled: true, help: undefined }],
  ["read only", { ...filled, readOnly: true, help: undefined }],
];

function FieldMatrix() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 320px)",
        gap: "24px 32px",
        alignItems: "start",
      }}
    >
      {fieldStates.map(([title, props]) => (
        <div key={title} style={{ display: "grid", gap: 12 }}>
          <span className="text-label" style={{ color: "var(--ink-muted)" }}>
            {title}
          </span>
          <Field {...name} {...props} />
        </div>
      ))}
    </div>
  );
}

export const stories = {
  key: KeyStory,
  "key-matrix": KeyMatrix,
  field: FieldStory,
  "field-matrix": FieldMatrix,
};

export type StoryName = keyof typeof stories;
