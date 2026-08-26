import test from "node:test";
import assert from "node:assert/strict";
import {
  mergeAiDocumentMetadata,
  normalizeAiDocument,
} from "../src/pages/User/AIChat/libraryDocumentMetadata.js";

test("normalizes flat AI document subject metadata", () => {
  assert.deepEqual(
    normalizeAiDocument({
      id: "document-1",
      subjectId: "subject-1",
      subject: "Origami",
      categoryId: "category-1",
      category: "ORI",
    }),
    {
      id: "document-1",
      subjectId: "subject-1",
      subject: "Origami",
      categoryId: "category-1",
      category: "ORI",
    },
  );
});

test("normalizes nested metadata returned by the regular document API", () => {
  assert.deepEqual(
    normalizeAiDocument({
      id: "document-1",
      subject: { id: "subject-1", name: "Origami" },
      category: { id: "category-1", name: "ORI" },
    }),
    {
      id: "document-1",
      subjectId: "subject-1",
      subject: "Origami",
      categoryId: "category-1",
      category: "ORI",
    },
  );
});

test("hydrates metadata missing from an older AI document response", () => {
  assert.deepEqual(
    mergeAiDocumentMetadata(
      { id: "document-1", title: "Biên nhan ori", aiUsable: true },
      {
        id: "document-1",
        title: "Biên nhan ori",
        subject: { id: "subject-1", name: "Origami" },
        category: { id: "category-1", name: "ORI" },
      },
    ),
    {
      id: "document-1",
      title: "Biên nhan ori",
      aiUsable: true,
      subjectId: "subject-1",
      subject: "Origami",
      categoryId: "category-1",
      category: "ORI",
    },
  );
});
