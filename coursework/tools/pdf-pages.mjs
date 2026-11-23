import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const file = process.argv[2];
const doc = await getDocument({ url: file, useSystemFonts: true }).promise;
const out = [];
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent();
  const text = content.items.map((it) => it.str).join(" ").replace(/\s+/g, " ").trim();
  out.push(`--- стр. ${i}: ${text.slice(0, 110)}`);
}
console.log(out.join("\n"));
console.log("ВСЕГО СТРАНИЦ:", doc.numPages);
