import { expect, test, type Locator, type Page } from "@playwright/test";
import type { Theme } from "..";
import type { FieldStoryProps, StoryName } from "./harness/stories";
import { centreY, contrast, measureInk, parseRgb } from "./ink";

const help = "Use the name you would like us to call you.";

async function open(
  page: Page,
  story: StoryName,
  props: FieldStoryProps = {},
  theme: Theme = "paper",
) {
  const query = new URLSearchParams({
    story,
    theme,
    props: JSON.stringify(props),
  });
  await page.goto(`/?${query}`);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

async function mountField(page: Page, props?: FieldStoryProps, theme?: Theme) {
  await open(page, "field", props, theme);
  return page.getByRole("textbox");
}

// Resolves a token the way the page sees it, e.g. "var(--rule)" -> "rgb(...)".
const resolve = (page: Page, value: string) =>
  page.evaluate((value) => {
    const probe = document.createElement("div");
    probe.style.color = value;
    document.body.append(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  }, value);

const style = (target: Locator, pseudo?: string) =>
  target.evaluate((el, pseudo) => {
    const s = getComputedStyle(el, pseudo);
    return {
      color: s.color,
      background: s.backgroundColor,
      border: s.borderTopColor,
      shadow: s.boxShadow,
    };
  }, pseudo);

async function expectBorder(page: Page, input: Locator, token: string) {
  await expect(input).toHaveCSS("border-top-color", await resolve(page, token));
}

test.describe("behaviour", () => {
  test("is a text input named by its label and described by its help", async ({
    page,
  }) => {
    const input = await mountField(page);
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveAccessibleName("your name");
    await expect(input).toHaveAccessibleDescription(help);
    await expect(input).not.toHaveAttribute("aria-invalid");
  });

  test("the test point is decoration", async ({ page }) => {
    await mountField(page);
    await expect(page.locator(".field__point")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  test("clicking the label focuses the input", async ({ page }) => {
    const input = await mountField(page);
    await page.getByText("your name").click();
    await expect(input).toBeFocused();
  });

  test("takes typed text", async ({ page }) => {
    const input = await mountField(page);
    await input.fill("Alex Morgan");
    await expect(input).toHaveValue("Alex Morgan");
  });

  test("passes native input props through", async ({ page }) => {
    const input = await mountField(page, {
      type: "email",
      name: "email",
      autoComplete: "email",
      required: true,
    });
    await expect(input).toHaveAttribute("type", "email");
    await expect(input).toHaveAttribute("name", "email");
    await expect(input).toHaveAttribute("autocomplete", "email");
    await expect(input).toHaveJSProperty("required", true);
  });

  test("keeps a given id and aria-describedby", async ({ page }) => {
    const input = await mountField(page, {
      id: "name",
      "aria-describedby": "elsewhere",
    });
    await expect(input).toHaveId("name");
    await expect(page.locator("label")).toHaveAttribute("for", "name");
    await expect(input).toHaveAttribute(
      "aria-describedby",
      "name-note elsewhere",
    );
  });

  test("omits the note when there's no help", async ({ page }) => {
    const input = await mountField(page, { help: "" });
    await expect(input).not.toHaveAttribute("aria-describedby");
    await expect(page.locator(".field__note")).toHaveCount(0);
  });

  test("is in the tab order", async ({ page, browserName }) => {
    const input = await mountField(page);
    await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
    await expect(input).toBeFocused();
  });
});

test.describe("error", () => {
  test("is invalid and described by the error instead of the help", async ({
    page,
  }) => {
    const input = await mountField(page, { error: "Please enter your name." });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription(
      "Error: Please enter your name.",
    );
    await expect(page.getByText(help)).toHaveCount(0);
  });

  test("the prefix can be translated", async ({ page }) => {
    const input = await mountField(page, {
      error: "Veuillez saisir votre nom.",
      errorPrefix: "Erreur :",
    });
    await expect(input).toHaveAccessibleDescription(
      "Erreur : Veuillez saisir votre nom.",
    );
  });

  test("wraps under the message, not the prefix", async ({ page }) => {
    await mountField(page, {
      width: 200,
      error: "Enter a complete email address, like alex@example.com.",
    });
    const [prefix, message] = await page
      .locator(".field__error > span")
      .evaluateAll((spans) => spans.map((s) => s.getBoundingClientRect()));
    expect(message.left - prefix.right, "prefix-to-message gap").toBe(4);
    expect(message.height, "message wraps").toBeGreaterThan(prefix.height);
  });
});

test.describe("disabled", () => {
  test("can't be edited or tabbed to", async ({ page, browserName }) => {
    const input = await mountField(page, { disabled: true });
    await expect(input).toBeDisabled();
    await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
    await expect(input).not.toBeFocused();
  });
});

test.describe("read only", () => {
  test("shows a fixed value that can't be edited", async ({ page }) => {
    const input = await mountField(page, {
      readOnly: true,
      defaultValue: "Alex Morgan",
    });
    await expect(input).toHaveValue("Alex Morgan");
    await expect(input).not.toBeEditable();
    await input.press("x");
    await expect(input).toHaveValue("Alex Morgan");
  });

  test("is left out of the tab order", async ({ page, browserName }) => {
    const input = await mountField(page, { readOnly: true });
    await expect(input).toHaveAttribute("tabindex", "-1");
    await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
    await expect(input).not.toBeFocused();
  });
});

test.describe("states", () => {
  test("rest, hover and label hover", async ({ page }) => {
    const input = await mountField(page);
    await expectBorder(page, input, "var(--rule-strong)");
    await expect(input).toHaveCSS("border-top-width", "1px");

    await input.hover();
    await expectBorder(page, input, "var(--ink)");

    await page.getByText("your name").hover();
    await expectBorder(page, input, "var(--ink)");
  });

  test("error, and error hover at 2px", async ({ page }) => {
    const input = await mountField(page, { error: "Please enter your name." });
    const error = await resolve(page, "var(--field-border-error)");
    expect(error).toBe(await resolve(page, "var(--signal-text)"));
    await expectBorder(page, input, error);
    await expect(input).toHaveCSS("box-shadow", "none");

    await input.hover();
    await expectBorder(page, input, error);
    await expect(input).toHaveCSS("box-shadow", `${error} 0px 0px 0px 1px inset`);
  });

  test("error hover doesn't move the text", async ({ page }) => {
    const input = await mountField(page, {
      error: "Please enter your name.",
      defaultValue: "Alex Morgan",
    });
    const { color, background } = await style(input);
    const measure = () =>
      measureInk(input, parseRgb(color), parseRgb(background), 3);
    const rest = await measure();
    await input.hover();
    await expect(input).not.toHaveCSS("box-shadow", "none");
    expect(await measure()).toEqual(rest);
  });

  for (const [name, props] of [
    ["disabled", { disabled: true }],
    ["read only", { readOnly: true }],
  ] as const) {
    test(`${name} doesn't react to hover`, async ({ page }) => {
      const input = await mountField(page, props);
      const rest = await style(input);
      await input.hover({ force: true });
      expect(await style(input)).toEqual(rest);
      await expectBorder(
        page,
        input,
        name === "disabled" ? "var(--rule)" : "var(--rule-strong)",
      );
      await expect(input).toHaveCSS(
        "background-color",
        await resolve(page, "var(--paper-sunken)"),
      );
    });
  }

  for (const [name, props, ring] of [
    ["default", {}, "var(--focus-ring)"],
    ["error", { error: "Please enter your name." }, "var(--field-border-error)"],
  ] as const) {
    test(`${name} focus ring sits 3px out, 2px wide`, async ({
      page,
      browserName,
    }) => {
      const input = await mountField(page, props);
      await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
      await expect(input).toBeFocused();
      await expect(input).toHaveCSS("outline-style", "solid");
      await expect(input).toHaveCSS("outline-width", "2px");
      await expect(input).toHaveCSS("outline-offset", "3px");
      await expect(input).toHaveCSS("outline-color", await resolve(page, ring));
    });
  }

  test("read only shows no focus ring when clicked", async ({ page }) => {
    const input = await mountField(page, {
      readOnly: true,
      defaultValue: "Alex Morgan",
    });
    await input.click();
    await expect(input).toBeFocused();
    await expect(input).toHaveCSS("outline-style", "none");
  });
});

/*
 * WCAG AA: 4.5:1 for text, 3:1 for the borders that mark out an editable
 * field. Disabled text is exempt but is checked anyway.
 */
test.describe("contrast", () => {
  for (const theme of ["paper", "mask"] as const) {
    test(`text and borders on ${theme}`, async ({ page }) => {
      const pairs: [string, string, string][] = [];
      const check = async (props: FieldStoryProps, borders: boolean) => {
        const input = await mountField(page, props, theme);
        const field = await style(input);
        const placeholder = await style(input, "::placeholder");
        const surface = await style(page.locator("body"));
        const note = await style(page.locator(".field__note"));
        const label = await style(page.locator(".field__label"));
        const tag = JSON.stringify(props);
        pairs.push(
          [`${tag} value`, field.color, field.background],
          [`${tag} placeholder`, placeholder.color, field.background],
          [`${tag} label`, label.color, surface.background],
          [`${tag} note`, note.color, surface.background],
        );
        if (borders) {
          expect(
            contrast(parseRgb(field.border), parseRgb(field.background)),
            `${tag} border on field`,
          ).toBeGreaterThanOrEqual(3);
          expect(
            contrast(parseRgb(field.border), parseRgb(surface.background)),
            `${tag} border on page`,
          ).toBeGreaterThanOrEqual(3);
        }
      };

      await check({}, true);
      await check({ error: "Please enter your name." }, true);
      await check({ disabled: true }, false);
      await check({ readOnly: true }, true);

      for (const [what, fg, bg] of pairs) {
        expect(
          contrast(parseRgb(fg), parseRgb(bg)),
          `${what}: ${fg} on ${bg}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});

test.describe("layout", () => {
  test("stacks label, input and note 8px apart", async ({ page }) => {
    await mountField(page);
    const [label, input, note] = await page
      .locator(".field > *")
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect()));
    expect(label.height).toBe(23);
    expect(input.top - label.bottom).toBe(8);
    expect(input.height).toBe(48);
    expect(note.top - input.bottom).toBe(8);
    expect(note.height).toBe(23);
    expect(input.width).toBe(480);
  });
});

test.describe("optical spacing", () => {
  const LIFT = 1;
  const SLACK = 0.75;

  for (const [name, props] of [
    ["value", { defaultValue: "ELLIE HILL" }],
    ["placeholder", { placeholder: "ELLIE HILL" }],
    ["error hover value", { defaultValue: "ELLIE HILL", error: "Required." }],
  ] as const) {
    test(`${name} sits on the optical centre`, async ({ page }) => {
      const input = await mountField(page, props);
      if (name.startsWith("error hover")) await input.hover();
      const s = await style(input, name === "placeholder" ? "::placeholder" : undefined);
      const { background } = await style(input);
      const ink = await measureInk(
        input,
        parseRgb(s.color),
        parseRgb(background),
        3,
      );
      const height = (await input.boundingBox())!.height;
      const opticalCentre = height / 2 - LIFT;
      expect(
        Math.abs(centreY(ink) - opticalCentre),
        `cap band ${ink.top}–${ink.bottom}, centre ${centreY(ink)} vs ${opticalCentre}`,
      ).toBeLessThan(SLACK);
    });
  }

  for (const theme of ["paper", "mask"] as const) {
    test(`test point is centred on the label's x-height on ${theme}`, async ({
      page,
    }) => {
      await mountField(page, { label: "surname" }, theme);
      const label = page.locator(".field__label");
      const { background } = await style(page.locator("body"));
      const copper = parseRgb(await resolve(page, "var(--copper)"));
      const text = await measureInk(
        label,
        parseRgb((await style(label)).color),
        parseRgb(background),
      );
      const point = await measureInk(label, copper, parseRgb(background));

      // r 3.5 with a 2px stroke fills the 9px asset box.
      expect(point.right - point.left).toBe(9);
      expect(point.bottom - point.top).toBe(9);
      expect(
        Math.abs(centreY(point) - centreY(text)),
        `point centre ${centreY(point)} vs x-height centre ${centreY(text)}`,
      ).toBeLessThan(SLACK);
    });
  }
});

test.describe("visual", () => {
  for (const theme of ["paper", "mask"] as const) {
    test(`matrix on ${theme}`, async ({ page }) => {
      await open(page, "field-matrix", {}, theme);
      await expect(page.locator("#root")).toHaveScreenshot(
        `field-matrix-${theme}.png`,
      );
    });
  }
});
