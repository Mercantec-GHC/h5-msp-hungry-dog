/**
 * PDF med footer: "Side X ud af Y"
 * - Y = antal PDF-sider − de første skipPages sider (= samlet antal **indholdssider**).
 * - Standard startPage=3 → skipPages=2 → første tekst-side er "Side 1 ud af Y" hvor Y = total − 2.
 *
 * Kræver: npm install i Rapport. Kør mkdocs serve først.
 *
 *   npm run pdf
 *   npm run pdf -- http://127.0.0.1:8000/hele-sitet/ rapport.pdf 3
 *
 * Sidste tal = hvilken PDF-side der får "Side 1" (default 3). Miljø: PDF_START_PAGE=3
 */

import fs from "fs";
import puppeteer from "puppeteer";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const url = process.argv[2] ?? "http://127.0.0.1:8000/hele-sitet/";
const outPath = process.argv[3] ?? "svendeprøve-hele-sitet.pdf";
const startPage = Number(
  process.argv[4] ?? process.env.PDF_START_PAGE ?? 3,
);

if (!Number.isFinite(startPage) || startPage < 1) {
  console.error("PDF_START_PAGE / 4. argument skal være et heltal ≥ 1.");
  process.exit(1);
}

const skipPages = startPage - 1;

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

let pdfBuffer;

try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 180000 });
  await new Promise((r) => setTimeout(r, 2500));
  await page.emulateMediaType("print");

  /*
   * Chromium lægger stadig CSS @page-marginer (extra.css + evt. print-JS) i PDF’en.
   * pdf-lib tegner footer bagefter → dobbelt sidetal (fx «ud af 39» + «ud af 37»).
   * Fjern margin-footere før print – kun scriptets tekst tilbage.
   */
  await page.addStyleTag({
    content: `
      @page :first {
        @bottom-center { content: none !important; }
        @bottom-right { content: none !important; }
      }
      @page toc {
        @bottom-center { content: none !important; }
        @bottom-right { content: none !important; }
      }
      @page {
        @bottom-center { content: none !important; }
        @bottom-right { content: none !important; }
      }
    `,
  });

  pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    displayHeaderFooter: false,
    margin: {
      top: "14mm",
      bottom: "26mm",
      left: "11mm",
      right: "11mm",
    },
    scale: 1,
  });
} finally {
  await browser.close();
}

const doc = await PDFDocument.load(pdfBuffer);
const font = await doc.embedFont(StandardFonts.Helvetica);
const pages = doc.getPages();
const total = pages.length;

if (skipPages >= total) {
  console.error(
    `PDF har kun ${total} side(r); kan ikke springe ${skipPages} sider over (startPage=${startPage}).`,
  );
  process.exit(1);
}

const contentTotal = total - skipPages;

for (let i = 0; i < total; i++) {
  if (i < skipPages) continue;
  const n = i - skipPages + 1;
  /* Y = antal PDF-sider minus de første (skipPages), dvs. kun indholdssider */
  const label = `Side ${n} ud af ${contentTotal}`;
  const p = pages[i];
  const { width } = p.getSize();
  const fontSize = 9;
  const tw = font.widthOfTextAtSize(label, fontSize);
  p.drawText(label, {
    x: (width - tw) / 2,
    y: 24,
    size: fontSize,
    font,
    color: rgb(0.26, 0.26, 0.26),
  });
}

const outBytes = await doc.save();
fs.writeFileSync(outPath, outBytes);

console.log(
  `PDF gemt: ${outPath} — sidetal fra PDF-side ${startPage} (${contentTotal} indholdssider, "Side 1" … "Side ${contentTotal}") - husk gerne at omdøbe den til et passende navn for jeres rapport!`,
);
