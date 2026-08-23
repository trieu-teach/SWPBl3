function splitTableRow(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function isTableSeparator(line) {
  if (!line?.includes("|")) return false;
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function startsTable(lines, index) {
  return (
    index + 1 < lines.length &&
    lines[index].includes("|") &&
    isTableSeparator(lines[index + 1])
  );
}

export function splitMarkdownBlocks(content = "") {
  const lines = String(content).split(/\r?\n/);
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    if (startsTable(lines, index)) {
      const headers = splitTableRow(lines[index]);
      const rows = [];
      index += 2;

      while (index < lines.length && lines[index].trim() && lines[index].includes("|")) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }

      blocks.push({ type: "table", headers, rows });
      continue;
    }

    const markdownLines = [];
    while (index < lines.length && !startsTable(lines, index)) {
      markdownLines.push(lines[index]);
      index += 1;
    }

    const value = markdownLines.join("\n");
    if (value) blocks.push({ type: "markdown", value });
  }

  return blocks;
}
