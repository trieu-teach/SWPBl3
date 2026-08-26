import test from "node:test";
import assert from "node:assert/strict";
import {
  filterVisibleAiLibraryDocuments,
  isVisibleAiLibraryDocument,
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

test("shows only owned uploads and accessible saved documents in the AI library", () => {
  const owned = {
    id: "owned-1",
    accessType: "OWNED",
    visibility: "PRIVATE",
  };
  const saved = {
    id: "saved-1",
    accessType: "SAVED",
    visibility: "PUBLIC",
    moderationStatus: "APPROVED",
  };
  const communityOnly = {
    id: "community-1",
    accessType: "COMMUNITY",
    visibility: "PUBLIC",
  };

  assert.deepEqual(
    filterVisibleAiLibraryDocuments([owned, saved, communityOnly]),
    [owned, saved],
  );
});

test("hides saved documents that were deleted, made private, or lost approval", () => {
  assert.equal(
    isVisibleAiLibraryDocument({
      accessType: "SAVED",
      visibility: "PRIVATE",
      moderationStatus: "APPROVED",
      unavailableReason: "ACCESS_REVOKED",
    }),
    false,
  );
  assert.equal(
    isVisibleAiLibraryDocument({
      accessType: "SAVED",
      visibility: "PUBLIC",
      moderationStatus: "APPROVED",
      unavailableReason: "DOCUMENT_INACTIVE",
    }),
    false,
  );
  assert.equal(
    isVisibleAiLibraryDocument({
      accessType: "SAVED",
      visibility: "PUBLIC",
      moderationStatus: "PENDING",
    }),
    false,
  );
});

test("hides personal uploads after they are hidden or deleted", () => {
  assert.equal(
    isVisibleAiLibraryDocument({
      accessType: "OWNED",
      status: "HIDDEN",
      visibility: "PUBLIC",
      moderationStatus: "APPROVED",
    }),
    false,
  );
  assert.equal(
    isVisibleAiLibraryDocument({
      accessType: "OWNED",
      status: "DELETED",
      visibility: "PUBLIC",
      unavailableReason: "DOCUMENT_INACTIVE",
    }),
    false,
  );
  assert.equal(
    isVisibleAiLibraryDocument({
      accessType: "OWNED",
      status: "ACTIVE",
      visibility: "PRIVATE",
    }),
    true,
  );
});

test("keeps accessible saved documents visible while AI extraction is pending", () => {
  assert.equal(
    isVisibleAiLibraryDocument({
      accessType: "SAVED",
      visibility: "PUBLIC",
      moderationStatus: "APPROVED",
      aiUsable: false,
      unavailableReason: "EXTRACTION_NOT_READY",
    }),
    true,
  );
});
