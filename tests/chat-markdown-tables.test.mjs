import test from "node:test";
import assert from "node:assert/strict";
import { splitMarkdownBlocks } from "../src/pages/User/AIChat/markdownTables.js";

test("splits a pipe table from surrounding markdown", () => {
  const blocks = splitMarkdownBlocks(
    "Tóm tắt:\n\n| Mục | Giá trị |\n| --- | ---: |\n| Tín chỉ | **3** |\n\nKết luận.",
  );

  assert.deepEqual(blocks, [
    { type: "markdown", value: "Tóm tắt:\n" },
    {
      type: "table",
      headers: ["Mục", "Giá trị"],
      rows: [["Tín chỉ", "**3**"]],
    },
    { type: "markdown", value: "\nKết luận." },
  ]);
});

test("leaves ordinary markdown untouched", () => {
  assert.deepEqual(splitMarkdownBlocks("- Một\n- Hai"), [
    { type: "markdown", value: "- Một\n- Hai" },
  ]);
});
