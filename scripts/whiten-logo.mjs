// One-off asset prep. Converts a dark-logo-on-solid-light-background image into a
// clean white-on-transparent PNG, so it sits on the black logo wall without showing
// a grey box. Anti-aliased edges survive, which a CSS invert() filter cannot do.
//
// Uses sharp, already present as an Astro dependency — nothing extra installed.
// Usage: node scripts/whiten-logo.mjs <in> <out.png>
import sharp from 'sharp';

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error('usage: node scripts/whiten-logo.mjs <in> <out.png>');
  process.exit(1);
}

const { data, info } = await sharp(inPath).ensureAlpha().raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const luma = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];

// Background is the corner pixel; darkest ink sets the contrast range so faint
// logos on cream backgrounds still come out fully opaque.
const bg = luma(0);
let min = 255;
for (let i = 0; i < data.length; i += channels) {
  if (data[i + 3] < 8) continue; // already transparent: not ink
  const l = luma(i);
  if (l < min) min = l;
}
const range = Math.max(bg - min, 1);

const out = Buffer.alloc(width * height * 4);
for (let p = 0, i = 0; i < data.length; i += channels, p += 4) {
  const srcA = data[i + 3] / 255;
  const ink = Math.min(1, Math.max(0, (bg - luma(i)) / range));
  out[p] = 255; out[p + 1] = 255; out[p + 2] = 255;
  out[p + 3] = Math.round(ink * 255 * srcA);
}
await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(outPath);
console.log(`${outPath}  bg=${bg.toFixed(0)} minInk=${min.toFixed(0)} ${width}x${height}`);
