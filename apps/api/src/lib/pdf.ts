function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildContentStream(lines: string[]) {
  const commands = [
    "BT",
    "/F1 12 Tf",
    "14 TL",
  ];

  for (const line of lines) {
    commands.push(line);
  }

  commands.push("ET");
  return `${commands.join("\n")}\n`;
}

export function createPdfDocument(pages: string[][]) {
  const objects: string[] = [];

  const addObject = (content: string) => {
    objects.push(content);
    return objects.length;
  };

  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  const pageIds = pages.map((pageLines) => {
    const stream = buildContentStream(pageLines);
    const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}endstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent PAGES_ID 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );

    return { pageId, contentId };
  });

  const pagesId = addObject(
    `<< /Type /Pages /Kids [${pageIds.map(({ pageId }) => `${pageId} 0 R`).join(" ")}] /Count ${pageIds.length} >>`,
  );

  objects[pageIds[0] ? pageIds[0].pageId - 1 : 0] = objects[pageIds[0] ? pageIds[0].pageId - 1 : 0];
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

export function createTextLine(x: number, y: number, value: string) {
  return `${x} ${y} Td (${escapePdfText(value)}) Tj`;
}
