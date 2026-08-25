import test from "node:test";
import assert from "node:assert/strict";
import {
  buildChatSessionPayload,
  requireLibrarySourceFilters,
  sanitizeLibraryFilters,
} from "../src/api/chat.filters.js";
import {
  LIBRARY_DOCUMENT_LIMIT_MESSAGE,
  MAX_LIBRARY_DOCUMENTS,
} from "../src/api/chat.constants.js";

test("sends one selected subject with the subjectIds contract", () => {
  assert.deepEqual(
    sanitizeLibraryFilters({
      subjectId: "subject-1",
      _subjectMeta: { id: "subject-1", name: "Công nghệ phần mềm" },
    }),
    { subjectIds: ["subject-1"] },
  );
});

test("keeps one subjectIds value", () => {
  assert.deepEqual(sanitizeLibraryFilters({ subjectIds: ["subject-1"] }), {
    subjectIds: ["subject-1"],
  });
});

test("sends multiple unique subjectIds", () => {
  assert.deepEqual(
    sanitizeLibraryFilters({
      subjectIds: ["subject-1", "subject-1", "subject-2"],
    }),
    { subjectIds: ["subject-1", "subject-2"] },
  );
});

test("explicit documentIds take precedence over subjectIds", () => {
  assert.deepEqual(
    requireLibrarySourceFilters({
      subjectIds: ["subject-1", "subject-2"],
      documentIds: ["document-1", "document-1", "document-2"],
      _documentMeta: [{ id: "document-1", title: "SRS" }],
    }),
    { documentIds: ["document-1", "document-2"] },
  );
});

test("documents from multiple subjects can share an explicit file scope", () => {
  assert.deepEqual(
    requireLibrarySourceFilters({
      documentIds: ["subject-1-document", "subject-2-document"],
    }),
    { documentIds: ["subject-1-document", "subject-2-document"] },
  );
});

test("omits empty filters", () => {
  assert.equal(sanitizeLibraryFilters(null), null);
  assert.equal(sanitizeLibraryFilters({}), null);
});

test("allows asking the whole library or using optional filters", () => {
  assert.equal(requireLibrarySourceFilters(null), null);
  assert.deepEqual(requireLibrarySourceFilters({ fileType: "pdf" }), {
    fileType: "pdf",
  });
  assert.deepEqual(requireLibrarySourceFilters({ subjectId: "subject-1" }), {
    subjectIds: ["subject-1"],
  });
});

test("rejects more than five explicit documents at the API boundary", () => {
  const documentIds = Array.from(
    { length: MAX_LIBRARY_DOCUMENTS + 1 },
    (_, index) => `document-${index + 1}`,
  );

  assert.throws(
    () => sanitizeLibraryFilters({ subjectId: "subject-1", documentIds }),
    (error) =>
      error instanceof RangeError &&
      error.message === LIBRARY_DOCUMENT_LIMIT_MESSAGE,
  );
  assert.throws(
    () =>
      buildChatSessionPayload({
        mode: "ASK_MY_LIBRARY",
        documentIds,
      }),
    RangeError,
  );
});

test("does not send subject filters when creating a session", () => {
  assert.deepEqual(
    buildChatSessionPayload({
      mode: "ASK_MY_LIBRARY",
      subjectId: "subject-1",
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
