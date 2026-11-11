// Generates .claude-plugin/icon.png (512×512): a scope reticle with a gap in the ring.
// Pure Node (zlib), no image deps. Run: node scripts/icon.mjs
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const N = 512;
const bg = [17, 24, 39];
const fg = [250, 204, 21];
const px = Buffer.alloc(N * N * 3);
const set = (x, y, c, a = 1) => {
  const i = (y * N + x) * 3;
  for (let k = 0; k < 3; k++) px[i + k] = Math.round(px[i + k] * (1 - a) + c[k] * a);
};
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) set(x, y, bg);

const cx = N / 2, cy = N / 2;
const smooth = (d, w) => Math.max(0, Math.min(1, w - Math.abs(d))); // ~1px antialias
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
    const r = Math.hypot(dx, dy);
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI; // -180..180
    let a = 0;
    // Outer ring with a gap at the top-right (the "gap" we scout for).
    if (!(ang > -70 && ang < -20)) a = Math.max(a, smooth(r - 170, 14));
    // Inner dot.
    a = Math.max(a, smooth(r, 34) > 0 ? Math.min(1, 34 - r) : 0);
    // Crosshair ticks.
    const onV = Math.abs(dx) < 10 && ((r > 70 && r < 130) || (r > 200 && r < 236));
    const onH = Math.abs(dy) < 10 && ((r > 70 && r < 130) || (r > 200 && r < 236));
    if (onV || onH) a = Math.max(a, 1);
    if (a > 0) set(x, y, fg, Math.min(1, a));
  }

const raw = Buffer.alloc((N * 3 + 1) * N);
for (let y = 0; y < N; y++) {
  raw[y * (N * 3 + 1)] = 0;
  px.copy(raw, y * (N * 3 + 1) + 1, y * N * 3, (y + 1) * N * 3);
}
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(N, 0);
ihdr.writeUInt32BE(N, 4);
ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw)),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync(".claude-plugin/icon.png", png);
console.log(`wrote .claude-plugin/icon.png (${png.length} bytes)`);
