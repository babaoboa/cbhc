import type { Locator } from "@playwright/test";
import { PNG } from "pngjs";

export type Box = { left: number; right: number; top: number; bottom: number };

export type KeyInk = {
  width: number;
  height: number;
  text: Box;
  pad?: Box;
};

type Rgb = [number, number, number];

export const parseRgb = (value: string): Rgb => {
  const [r, g, b] = value.match(/\d+(\.\d+)?/g)!.map(Number);
  return [r, g, b];
};

const distance = (a: Rgb, b: Rgb) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const coverage = (px: Rgb, from: Rgb, to: Rgb) => {
  const d = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
  const p = [px[0] - from[0], px[1] - from[1], px[2] - from[2]];
  return (
    (p[0] * d[0] + p[1] * d[1] + p[2] * d[2]) /
    (d[0] ** 2 + d[1] ** 2 + d[2] ** 2)
  );
};

export async function measureKeyInk(key: Locator): Promise<KeyInk> {
  const colors = await key.evaluate((el) => {
    const pad = el.querySelector(".key__pad");
    return {
      text: getComputedStyle(el).color,
      pad: pad?.checkVisibility()
        ? getComputedStyle(pad).backgroundColor
        : null,
    };
  });
  const box = (await key.boundingBox())!;
  const scale = await key.evaluate(() => devicePixelRatio);
  const png = PNG.sync.read(
    await key.screenshot({ animations: "disabled", scale: "device" }),
  );
  const originX = Math.floor(box.x * scale) / scale - box.x;
  const originY = Math.floor(box.y * scale) / scale - box.y;

  const inset = scale * 1.5;
  const scan = {
    left: Math.ceil(-originX * scale + inset),
    right: Math.floor((box.width - originX) * scale - inset),
    top: Math.ceil(-originY * scale + inset),
    bottom: Math.floor((box.height - originY) * scale - inset),
  };
  const pixel = (x: number, y: number): Rgb => {
    const i = (y * png.width + x) * 4;
    return [png.data[i], png.data[i + 1], png.data[i + 2]];
  };

  const face = pixel(scan.left, Math.round((scan.top + scan.bottom) / 2));
  const text = parseRgb(colors.text);
  const pad = colors.pad ? parseRgb(colors.pad) : null;
  const found: { text?: Box; pad?: Box } = {};
  const grow = (name: "text" | "pad", x: number, y: number) => {
    const b = (found[name] ??= { left: x, right: x, top: y, bottom: y });
    b.left = Math.min(b.left, x);
    b.right = Math.max(b.right, x);
    b.top = Math.min(b.top, y);
    b.bottom = Math.max(b.bottom, y);
  };

  for (let y = scan.top; y < scan.bottom; y++) {
    for (let x = scan.left; x < scan.right; x++) {
      const px = pixel(x, y);
      if (pad && distance(px, pad) < distance(face, pad) / 4) grow("pad", x, y);
      else if (coverage(px, face, text) >= 0.5) grow("text", x, y);
    }
  }

  const toCss = (b: Box): Box => ({
    left: originX + b.left / scale,
    right: originX + (b.right + 1) / scale,
    top: originY + b.top / scale,
    bottom: originY + (b.bottom + 1) / scale,
  });

  if (!found.text) throw new Error("No label ink found in key screenshot");
  return {
    width: box.width,
    height: box.height,
    text: toCss(found.text),
    pad: found.pad && toCss(found.pad),
  };
}
export async function measureInk(
  target: Locator,
  ink: Rgb,
  background: Rgb,
  inset = 0,
): Promise<Box> {
  const box = (await target.boundingBox())!;
  const scale = await target.evaluate(() => devicePixelRatio);
  const png = PNG.sync.read(
    await target.screenshot({ animations: "disabled", scale: "device" }),
  );
  const originX = Math.floor(box.x * scale) / scale - box.x;
  const originY = Math.floor(box.y * scale) / scale - box.y;
  const from = Math.ceil(inset * scale);
  let found: Box | undefined;

  for (let y = from; y < png.height - from; y++) {
    for (let x = from; x < png.width - from; x++) {
      const i = (y * png.width + x) * 4;
      const px: Rgb = [png.data[i], png.data[i + 1], png.data[i + 2]];
      const t = Math.min(1, coverage(px, background, ink));
      const blend = background.map((c, n) => c + (ink[n] - c) * t) as Rgb;
      if (t < 0.5 || distance(px, blend) > 24) continue;
      found ??= { left: x, right: x, top: y, bottom: y };
      found.left = Math.min(found.left, x);
      found.right = Math.max(found.right, x);
      found.top = Math.min(found.top, y);
      found.bottom = Math.max(found.bottom, y);
    }
  }

  if (!found) throw new Error(`No rgb(${ink}) ink found in screenshot`);
  return {
    left: originX + found.left / scale,
    right: originX + (found.right + 1) / scale,
    top: originY + found.top / scale,
    bottom: originY + (found.bottom + 1) / scale,
  };
}

export async function paintedBottom(key: Locator): Promise<number> {
  const box = (await key.boundingBox())!;
  const margin = 8;
  const png = PNG.sync.read(
    await key.page().screenshot({
      clip: {
        x: box.x,
        y: box.y - margin,
        width: box.width,
        height: box.height + margin * 2,
      },
      scale: "css",
    }),
  );
  const x = Math.floor(png.width / 2);
  const at = (y: number): Rgb => {
    const i = (y * png.width + x) * 4;
    return [png.data[i], png.data[i + 1], png.data[i + 2]];
  };
  const background = at(png.height - 1);
  let y = png.height - 1;
  while (y > 0 && distance(at(y), background) < 24) y--;
  return y + 1 - margin;
}

export async function faceColor(key: Locator): Promise<Rgb> {
  const box = (await key.boundingBox())!;
  const png = PNG.sync.read(
    await key.page().screenshot({
      clip: { x: box.x + 3, y: box.y + box.height / 2, width: 1, height: 1 },
      scale: "css",
    }),
  );
  return [png.data[0], png.data[1], png.data[2]];
}

export const luminance = (rgb: Rgb) => {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

export const centreY = (b: Box) => (b.top + b.bottom) / 2;
