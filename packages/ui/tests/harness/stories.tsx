import { Key, keySizes, keyVariants, type KeyProps } from "../../components";

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

export const stories = {
  key: KeyStory,
  "key-matrix": KeyMatrix,
};

export type StoryName = keyof typeof stories;
