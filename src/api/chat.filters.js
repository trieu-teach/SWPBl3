import {
  LIBRARY_DOCUMENT_LIMIT_MESSAGE,
  MAX_LIBRARY_DOCUMENTS,
} from "./chat.constants.js";

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeStringArray(value) {
  return Array.isArray(value)
    ? [...new Set(value.map(normalizeString).filter(Boolean))]
    : [];
}

function normalizeSubjectIds(filters) {
  return normalizeStringArray([
    filters?.subjectId,
    ...(Array.isArray(filters?.subjectIds) ? filters.subjectIds : []),
  ]);
}

function assertDocumentLimit(documentIds) {
  if (documentIds.length > MAX_LIBRARY_DOCUMENTS) {
    throw new RangeError(LIBRARY_DOCUMENT_LIMIT_MESSAGE);
  }
}

export function sanitizeLibraryFilters(filters) {
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    return null;
  }

  const cleaned = {};
  const subjectIds = normalizeSubjectIds(filters);
  const documentIds = normalizeStringArray(filters.documentIds);
  assertDocumentLimit(documentIds);

  // Explicitly selected files are a narrower scope than subject filters.
  if (documentIds.length > 0) {
    cleaned.documentIds = documentIds;
  } else if (subjectIds.length > 0) {
    cleaned.subjectIds = subjectIds;
  }

  const categoryId = normalizeString(filters.categoryId);
  const fileType = normalizeString(filters.fileType);
  if (categoryId) cleaned.categoryId = categoryId;
  if (fileType) cleaned.fileType = fileType;

  return Object.keys(cleaned).length > 0 ? cleaned : null;
}

export function requireLibrarySourceFilters(filters) {
  return sanitizeLibraryFilters(filters);
}

export function buildChatSessionPayload({
  mode,
  documentId,
  documentIds,
}) {
  const body = { mode };
  const normalizedDocumentId = normalizeString(documentId);
  const normalizedDocumentIds = normalizeStringArray(documentIds);
  assertDocumentLimit(normalizedDocumentIds);

  if (normalizedDocumentId) {
    body.documentId = normalizedDocumentId;
  } else if (normalizedDocumentIds.length > 0) {
    body.documentIds = normalizedDocumentIds;
  }

  return body;
}
