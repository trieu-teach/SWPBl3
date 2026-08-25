import assert from "node:assert/strict";
import test from "node:test";
import {
  getChatSourceDocumentId,
  getChatSourceNumber,
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
