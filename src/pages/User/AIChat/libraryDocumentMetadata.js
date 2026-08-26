function normalizeId(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

const HIDDEN_DOCUMENT_REASONS = new Set([
  "DOCUMENT_INACTIVE",
  "DOCUMENT_NOT_FOUND",
]);

function normalizeLookup(document, field) {
  const lookup = document?.[field];
  const explicitId = normalizeId(document?.[`${field}Id`]);

  if (typeof lookup === "string") {
    return { id: explicitId, name: lookup.trim() };
  }

  if (lookup && typeof lookup === "object" && !Array.isArray(lookup)) {
    return {
      id: explicitId ?? normalizeId(lookup.id),
      name: typeof lookup.name === "string" ? lookup.name.trim() : "",
    };
  }

  const fallbackName = document?.[`${field}Name`];
  return {
    id: explicitId,
    name: typeof fallbackName === "string" ? fallbackName.trim() : "",
  };
}

export function normalizeAiDocument(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    return document;
  }

  const subject = normalizeLookup(document, "subject");
  const category = normalizeLookup(document, "category");
  const normalized = { ...document };

  if (document.accessType === "SAVED" || document.accessType === "OWNED") {
    normalized.accessType = document.accessType;
  }
  if (typeof document.aiUsable === "boolean") {
    normalized.aiUsable = document.aiUsable;
  }
  if (Object.prototype.hasOwnProperty.call(document, "unavailableReason")) {
    normalized.unavailableReason = document.unavailableReason ?? null;
  }

  delete normalized.subjectName;
  delete normalized.categoryName;

  if (subject.id) normalized.subjectId = subject.id;
  if (subject.name) normalized.subject = subject.name;
  if (category.id) normalized.categoryId = category.id;
  if (category.name) normalized.category = category.name;

  return normalized;
}

/**
 * The AI picker is intentionally limited to the user's own uploads and the
 * community documents that are still present in Saved Documents.
 *
 * Saved documents whose source was removed, made private or lost moderation
 * approval must not remain visible in the picker. Other AI-readiness failures
 * (for example extraction still processing) remain visible with their status.
 */
export function isVisibleAiLibraryDocument(document) {
  const normalized = normalizeAiDocument(document);
  if (!normalized || typeof normalized !== "object") return false;

  // A moderator-hidden or deleted personal upload is not part of the active AI
  // library, even though the current user still owns the underlying record.
  if (HIDDEN_DOCUMENT_REASONS.has(normalized.unavailableReason)) return false;
  if (normalized.status && normalized.status !== "ACTIVE") return false;

  if (normalized.accessType === "OWNED") return true;
  if (normalized.accessType !== "SAVED") return false;

  if (normalized.unavailableReason === "ACCESS_REVOKED") return false;
  if (normalized.visibility && normalized.visibility !== "PUBLIC") {
    return false;
  }
  if (
    normalized.moderationStatus &&
    normalized.moderationStatus !== "APPROVED"
  ) {
    return false;
  }

  return true;
}

export function filterVisibleAiLibraryDocuments(documents) {
  return (Array.isArray(documents) ? documents : []).filter(
    isVisibleAiLibraryDocument,
  );
}

export function mergeAiDocumentMetadata(summary, detail) {
  const normalizedSummary = normalizeAiDocument(summary) ?? {};
  const normalizedDetail = normalizeAiDocument(detail) ?? {};

  return {
    ...normalizedDetail,
    ...normalizedSummary,
    subjectId: normalizedSummary.subjectId ?? normalizedDetail.subjectId,
    subject: normalizedSummary.subject ?? normalizedDetail.subject,
    categoryId: normalizedSummary.categoryId ?? normalizedDetail.categoryId,
    category: normalizedSummary.category ?? normalizedDetail.category,
  };
}
