import test from "node:test";
import assert from "node:assert/strict";
import {
  buildChatSessionPayload,
  sanitizeLibraryFilters,
} from "../src/api/chat.filters.js";

test("sends multiple subjectIds without display metadata", () => {
  assert.deepEqual(
    sanitizeLibraryFilters({
      subjectIds: ["subject-1", "subject-1", "subject-2"],
      _subjectsMeta: [{ id: "subject-1", name: "Công nghệ phần mềm" }],
    }),
    { subjectIds: ["subject-1", "subject-2"] },
  );
});

test("explicit documentIds take precedence over subject filters", () => {
  assert.deepEqual(
    sanitizeLibraryFilters({
      subjectIds: ["subject-1"],
      documentIds: ["document-1", "document-1", "document-2"],
      _documentMeta: [{ id: "document-1", title: "SRS" }],
    }),
    { documentIds: ["document-1", "document-2"] },
  );
});

test("omits the filters object for the whole library", () => {
  assert.equal(sanitizeLibraryFilters(null), null);
  assert.equal(sanitizeLibraryFilters({}), null);
});

test("does not send unsupported subject filters when creating a session", () => {
  assert.deepEqual(
    buildChatSessionPayload({
      mode: "ASK_MY_LIBRARY",
      subjectIds: ["subject-1", "subject-2"],
    }),
    { mode: "ASK_MY_LIBRARY" },
  );
});

test("keeps explicit documents when creating a selected-sources session", () => {
  assert.deepEqual(
    buildChatSessionPayload({
      mode: "ASK_MY_LIBRARY",
      documentIds: ["document-1", "document-1", "document-2"],
    }),
    {
      mode: "ASK_MY_LIBRARY",
      documentIds: ["document-1", "document-2"],
    },
  );
});
