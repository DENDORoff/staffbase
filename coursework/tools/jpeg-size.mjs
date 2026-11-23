/** Чтение размеров JPEG (SOF0/SOF2) для вставки в Word. */
import { readFileSync } from "node:fs";

export function jpegSize(path) {
  const buf = readFileSync(path);
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i += 1; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xcc && marker !== 0xc8) {
      const height = buf.readUInt16BE(i + 5);
      const width = buf.readUInt16BE(i + 7);
      return { width, height };
    }
    const len = buf.readUInt16BE(i + 2);
    i += 2 + len;
  }
  throw new Error("SOF marker not found in " + path);
}
