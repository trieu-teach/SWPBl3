import assert from "node:assert/strict";
import test from "node:test";

import {
  DOCUMENT_MODERATION_FLAG,
  DOCUMENT_MODERATION_STATUS,
  buildModerationKeywordIdMap,
  canDecideDocumentModeration,
  canHideModeratedDocument,
  canUnhideModeratedDocument,
  getDocumentModerationFlagPresentation,
  getDocumentModerationStatusPresentation,
  isQueuedDocumentModerationStatus,
} from "../src/lib/moderation.js";
import { getModerationStatus } from "../src/pages/User/DocumentLibrary/utils/document-formatters.js";

test("presents every moderation lifecycle status from the backend contract", () => {
  assert.deepEqual(Object.keys(DOCUMENT_MODERATION_STATUS), [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "FLAGGED",
    "AUTO_BLOCKED",
    "UNDER_REVIEW",
    "APPEALED",
    "SYSTEM_CLEARED",
    "EXPIRED",
  ]);
  assert.equal(
    getDocumentModerationStatusPresentation("SYSTEM_CLEARED").label,
    "Máy đã gỡ cờ",
  );
  assert.equal(
    getDocumentModerationStatusPresentation("AUTO_BLOCKED").color,
    "error",
  );
});

test("keeps moderation scan flags independent from review statuses", () => {
  assert.deepEqual(Object.keys(DOCUMENT_MODERATION_FLAG), [
    "NOT_SCANNED",
    "NORMAL",
    "FLAGGED",
    "SCAN_FAILED",
  ]);
  assert.equal(
    getDocumentModerationFlagPresentation("NOT_SCANNED").label,
    "Chưa quét",
  );
  assert.equal(
    getDocumentModerationFlagPresentation("NORMAL").color,
    "success",
  );
});

test("recognizes every document state included in the reviewer queue", () => {
  for (const status of [
    "PENDING",
    "FLAGGED",
    "AUTO_BLOCKED",
    "UNDER_REVIEW",
    "APPEALED",
  ]) {
    assert.equal(isQueuedDocumentModerationStatus(status), true);
  }

  for (const status of ["APPROVED", "REJECTED", "SYSTEM_CLEARED", "EXPIRED"]) {
    assert.equal(isQueuedDocumentModerationStatus(status), false);
  }
});

test("only shows moderation status for public documents", () => {
  assert.equal(
    getModerationStatus({
      visibility: "PUBLIC",
      moderationStatus: "FLAGGED",
    })?.label,
    "Cần xem (cờ từ khóa)",
  );
  assert.equal(
    getModerationStatus({
      visibility: "PRIVATE",
      moderationStatus: "FLAGGED",
    }),
    null,
  );
});

test("requires a queued public document before showing review decisions", () => {
  assert.equal(
    canDecideDocumentModeration({
      visibility: "PUBLIC",
      moderationStatus: "AUTO_BLOCKED",
    }),
    true,
  );
  assert.equal(
    canDecideDocumentModeration({
      visibility: "PRIVATE",
      moderationStatus: "AUTO_BLOCKED",
    }),
    false,
  );
  assert.equal(
    canDecideDocumentModeration({
      visibility: "PUBLIC",
      moderationStatus: "APPROVED",
    }),
    false,
  );
});

test("does not restore documents held by moderation", () => {
  assert.equal(
    canUnhideModeratedDocument({
      status: "HIDDEN",
      moderationStatus: "SYSTEM_CLEARED",
      moderationFlag: "NORMAL",
    }),
    true,
  );
  for (const moderationStatus of [
    "AUTO_BLOCKED",
    "REJECTED",
    "APPEALED",
    "EXPIRED",
  ]) {
    assert.equal(
      canUnhideModeratedDocument({
        status: "HIDDEN",
        moderationStatus,
        moderationFlag: "NORMAL",
      }),
      false,
    );
  }
  assert.equal(
    canUnhideModeratedDocument({
      status: "HIDDEN",
      moderationStatus: "APPROVED",
      moderationFlag: "FLAGGED",
    }),
    false,
  );
});

test("only hides active documents outside the reviewer queue", () => {
  assert.equal(
    canHideModeratedDocument({
      status: "ACTIVE",
      moderationStatus: "APPROVED",
    }),
    true,
  );
  assert.equal(
    canHideModeratedDocument({
      status: "ACTIVE",
      moderationStatus: "FLAGGED",
    }),
    false,
  );
});

test("maps matched keyword names to backend keyword ids", () => {
  const ids = buildModerationKeywordIdMap([
    { id: "keyword-1", keyword: " Ma túy " },
    { id: "keyword-2", keyword: "CRACK" },
  ]);

  assert.equal(ids["ma túy"], "keyword-1");
  assert.equal(ids.crack, "keyword-2");
});
