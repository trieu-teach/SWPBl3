import assert from "node:assert/strict";
import test from "node:test";
import {
  getChatSourceDocumentId,
  getChatSourceLocatorPresentation,
  getChatSourceNumber,
  getChatSourceSnippetPresentation,
} from "../src/pages/User/AIChat/chatSource.model.js";

test("uses documentId from the subject-mode source contract", () => {
  assert.equal(
    getChatSourceDocumentId({
      documentId: " document-1 ",
      citationId: "legacy-citation",
    }),
    "document-1",
  );
});

test("falls back to the legacy citationId for older responses", () => {
  assert.equal(
    getChatSourceDocumentId({ citationId: " legacy-document " }),
    "legacy-document",
  );
  assert.equal(getChatSourceDocumentId({}), null);
});

test("uses the backend sourceNumber and falls back to display order", () => {
  assert.equal(getChatSourceNumber({ sourceNumber: 7 }, 0), 7);
  assert.equal(getChatSourceNumber({}, 2), 3);
  assert.equal(getChatSourceNumber({ sourceNumber: 0 }, 1), 2);
});

test("removes leaked PowerPoint OpenXML from source snippets", () => {
  const presentation = getChatSourceSnippetPresentation(
    '\\</a:ln>\\</p:spPr>\\</p:sp>\\<p:sp>\\<p:nvSpPr>\\<p:cNvPr name="AutoShape 3" id="3"/>\\</p:nvSpPr>',
  );

  assert.deepEqual(presentation, {
    text: "",
    sanitized: true,
    showFallback: true,
  });
});

test("keeps readable text while removing surrounding PowerPoint OpenXML", () => {
  const presentation = getChatSourceSnippetPresentation(
    "\\<p:sp>\\<a:p>Quan hệ lợi ích kinh tế\\</a:p>\\</p:sp>",
  );

  assert.equal(presentation.text, "Quan hệ lợi ích kinh tế");
  assert.equal(presentation.sanitized, true);
  assert.equal(presentation.showFallback, false);
});

test("formats slide and page markers without changing normal snippets", () => {
  assert.deepEqual(
    getChatSourceSnippetPresentation(
      "React SPA [SLIDE: 4] [TITLE: System roles] Nội dung chính",
    ),
    {
      text: "React SPA · Slide 4 · Tiêu đề: System roles · Nội dung chính",
      sanitized: false,
      showFallback: false,
    },
  );
  assert.equal(
    getChatSourceSnippetPresentation("Nội dung JDBC thông thường.").text,
    "Nội dung JDBC thông thường.",
  );
  assert.equal(
    getChatSourceSnippetPresentation("[PAGE: 5] UserDAO.java").text,
    "Trang 5 · UserDAO.java",
  );
});

test("formats source locator arrays for display", () => {
  assert.equal(
    getChatSourceLocatorPresentation(["[SLIDE: 4]", "[PAGE: 5]"]),
    "Slide 4 · Trang 5",
  );
  assert.equal(getChatSourceLocatorPresentation(null), "");
});
