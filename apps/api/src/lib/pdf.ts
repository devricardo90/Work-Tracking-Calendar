function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export type PdfFontKey = "sans" | "mono";

export type PdfPage = {
  commands: string[];
};

function buildContentStream(commands: string[]) {
  return `${commands.join("\n")}\n`;
}

export function beginText() {
  return "BT";
}

export function endText() {
  return "ET";
}

export function setFont(font: PdfFontKey, size: number) {
  const fontName = font === "mono" ? "F2" : "F1";
  return `/${fontName} ${size} Tf`;
}

export function setLeading(value: number) {
  return `${value} TL`;
}

export function textAt(x: number, y: number, value: string) {
  return `1 0 0 1 ${x} ${y} Tm (${escapePdfText(value)}) Tj`;
}

export function drawLine(x1: number, y1: number, x2: number, y2: number) {
  return `${x1} ${y1} m ${x2} ${y2} l S`;
}

export function drawRectangle(x: number, y: number, width: number, height: number) {
  return `${x} ${y} ${width} ${height} re S`;
}

export function createPdfDocument(pages: PdfPage[]) {
  const objects: string[] = [];

  const addObject = (content: string) => {
    objects.push(content);
    return objects.length;
  };

  const sansFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const monoFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");

  const pageIds = pages.map((page) => {
    const stream = buildContentStream(page.commands);
    const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}endstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent PAGES_ID 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${sansFontId} 0 R /F2 ${monoFontId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );

    return { pageId, contentId };
  });

  const pagesId = addObject(
    `<< /Type /Pages /Kids [${pageIds.map(({ pageId }) => `${pageId} 0 R`).join(" ")}] /Count ${pageIds.length} >>`,
  );

  for (const { pageId } of pageIds) {
    objects[pageId - 1] = objects[pageId - 1].replace("PAGES_ID", String(pagesId));
  }

  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${offsets[index].toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}
