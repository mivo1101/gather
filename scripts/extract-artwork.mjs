#!/usr/bin/env node
/**
 * Cuts individual artwork pieces out of a flat-lay sheet.
 *
 * Sheets arrive as one image with many pieces on a flat background. This
 * flood-fills the background from the borders (so a dark object in the middle
 * of a dark sheet keeps its own pixels), labels what is left, and writes each
 * piece out trimmed with an alpha channel.
 *
 *   node scripts/extract-artwork.mjs <source> <outDir> [--bg=black|white]
 *     [--bg=black|white|auto] [--tolerance=24] [--min=90] [--gap=14]
 *     [--max=900] [--prefix=piece]
 *
 * Keep the tolerance tight on a dark sheet: a charcoal envelope on black is
 * only a few levels away from the background.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import sharp from "sharp";

const [source, outDir] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const flags = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => a.replace(/^--/, "").split("=")),
);
if (!source || !outDir) {
  console.error("usage: extract-artwork.mjs <source> <outDir> [--bg=black]");
  process.exit(1);
}

const bg = flags.bg ?? "white";
const tolerance = Number(flags.tolerance ?? 24);
const minSide = Number(flags.min ?? 90);
const gap = Number(flags.gap ?? 14);
const maxSide = Number(flags.max ?? 900);
const prefix = flags.prefix ?? basename(source).replace(/\.[^.]+$/, "");

const image = sharp(source).ensureAlpha();
const { width, height } = await image.metadata();
const { data } = await image.raw().toBuffer({ resolveWithObject: true });

// "auto" reads the sheet's own background from its corners, for stock shot on
// a textured surface rather than a studio black or white.
function cornerAverage() {
  const spots = [
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [width - 3, height - 3],
  ];
  const sum = [0, 0, 0];
  for (const [x, y] of spots) {
    const p = (y * width + x) * 4;
    sum[0] += data[p];
    sum[1] += data[p + 1];
    sum[2] += data[p + 2];
  }
  return sum.map((channel) => Math.round(channel / spots.length));
}

const target =
  bg === "black"
    ? [0, 0, 0]
    : bg === "auto"
      ? cornerAverage()
      : [255, 255, 255];
const isBackgroundish = (index) => {
  const p = index * 4;
  if (data[p + 3] < 24) return true;
  return (
    Math.abs(data[p] - target[0]) <= tolerance &&
    Math.abs(data[p + 1] - target[1]) <= tolerance &&
    Math.abs(data[p + 2] - target[2]) <= tolerance
  );
};

// Flood fill the background inward from every border pixel.
const background = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) {
  stack.push(x, (height - 1) * width + x);
}
for (let y = 0; y < height; y++) {
  stack.push(y * width, y * width + width - 1);
}
while (stack.length) {
  const index = stack.pop();
  if (background[index] || !isBackgroundish(index)) continue;
  background[index] = 1;
  const x = index % width;
  const y = (index - x) / width;
  if (x > 0) stack.push(index - 1);
  if (x < width - 1) stack.push(index + 1);
  if (y > 0) stack.push(index - width);
  if (y < height - 1) stack.push(index + width);
}

// Label what survives, so each piece is one connected run of pixels.
const seen = new Uint8Array(width * height);
const boxes = [];
for (let start = 0; start < width * height; start++) {
  if (background[start] || seen[start]) continue;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let count = 0;
  const queue = [start];
  seen[start] = 1;
  while (queue.length) {
    const index = queue.pop();
    const x = index % width;
    const y = (index - x) / width;
    count++;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    const neighbours = [
      x > 0 ? index - 1 : -1,
      x < width - 1 ? index + 1 : -1,
      y > 0 ? index - width : -1,
      y < height - 1 ? index + width : -1,
    ];
    for (const next of neighbours) {
      if (next < 0 || seen[next] || background[next]) continue;
      seen[next] = 1;
      queue.push(next);
    }
  }
  boxes.push({ minX, minY, maxX, maxY, count });
}

// A piece can be several runs - a card inside an envelope, a loose sprig.
// Merge boxes that sit within `gap` of each other. On a staggered flat-lay
// the boxes of neighbouring pieces overlap without the pieces touching, so
// a negative gap turns merging off and each run stays its own piece.
const merged = [];
for (const box of gap < 0 ? [] : boxes.sort((a, b) => b.count - a.count)) {
  const hit = merged.find(
    (other) =>
      box.minX <= other.maxX + gap &&
      other.minX <= box.maxX + gap &&
      box.minY <= other.maxY + gap &&
      other.minY <= box.maxY + gap,
  );
  if (hit) {
    hit.minX = Math.min(hit.minX, box.minX);
    hit.minY = Math.min(hit.minY, box.minY);
    hit.maxX = Math.max(hit.maxX, box.maxX);
    hit.maxY = Math.max(hit.maxY, box.maxY);
    hit.count += box.count;
  } else {
    merged.push({ ...box });
  }
}

const sized = (gap < 0 ? boxes : merged).filter(
  (box) => box.maxX - box.minX >= minSide && box.maxY - box.minY >= minSide,
);

// A detail inside a piece - a motif on a card, a window in a border - is part
// of that piece, not a piece of its own. Drop any box another one contains.
const pieces = sized
  .filter(
    (box) =>
      !sized.some(
        (other) =>
          other !== box &&
          other.minX <= box.minX &&
          other.minY <= box.minY &&
          other.maxX >= box.maxX &&
          other.maxY >= box.maxY,
      ),
  )
  .sort((a, b) => a.minY - b.minY || a.minX - b.minX);

// Background pixels become transparent; everything else keeps its own alpha.
const cut = Buffer.from(data);
for (let index = 0; index < width * height; index++) {
  if (background[index]) cut[index * 4 + 3] = 0;
}

mkdirSync(outDir, { recursive: true });
const manifest = [];
for (const [order, box] of pieces.entries()) {
  const pad = 4;
  const left = Math.max(0, box.minX - pad);
  const top = Math.max(0, box.minY - pad);
  const cropWidth = Math.min(width - left, box.maxX - box.minX + pad * 2);
  const cropHeight = Math.min(height - top, box.maxY - box.minY + pad * 2);
  const name = `${prefix}-${String(order + 1).padStart(2, "0")}.png`;
  await sharp(cut, { raw: { width, height, channels: 4 } })
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .resize({
      width: cropWidth >= cropHeight ? maxSide : undefined,
      height: cropHeight > cropWidth ? maxSide : undefined,
      fit: "inside",
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 9 })
    .toFile(join(outDir, name));
  manifest.push({ name, width: cropWidth, height: cropHeight, x: left, y: top });
}

writeFileSync(
  join(outDir, `${prefix}-manifest.json`),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(`${pieces.length} pieces -> ${outDir}`);
