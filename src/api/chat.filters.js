import {
  LIBRARY_DOCUMENT_LIMIT_MESSAGE,
  LIBRARY_SOURCE_REQUIRED_MESSAGE,
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

function assertDocumentLimit(documentIds) {
  if (documentIds.length > MAX_LIBRARY_DOCUMENTS) {
    throw new RangeError(LIBRARY_DOCUMENT_LIMIT_MESSAGE);
  }
}

export function hasSelectedLibrarySource(filters) {
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    return false;
  }

  return Boolean(
    normalizeString(filters.subjectId) ||
      normalizeStringArray(filters.subjectIds).length > 0 ||
      normalizeStringArray(filters.documentIds).length > 0,
  );
}

export function sanitizeLibraryFilters(filters) {
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    return null;
  }

  const cleaned = {};
  const subjectId = normalizeString(filters.subjectId);
  const subjectIds = normalizeStringArray(filters.subjectIds);
  const documentIds = normalizeStringArray(filters.documentIds);
  assertDocumentLimit(documentIds);

  // Explicitly selected files are a narrower scope than subject filters.
  if (documentIds.length > 0) {
    cleaned.documentIds = documentIds;
  } else if (subjectIds.length > 0) {
    cleaned.subjectIds = subjectIds;
  } else if (subjectId) {
    cleaned.subjectId = subjectId;
  }

  const categoryId = normalizeString(filters.categoryId);
  const fileType = normalizeString(filters.fileType);
  if (categoryId) cleaned.categoryId = categoryId;
  if (fileType) cleaned.fileType = fileType;

  return Object.keys(cleaned).length > 0 ? cleaned : null;
}

export function requireLibrarySourceFilters(filters) {
  if (!hasSelectedLibrarySource(filters)) {
    throw new Error(LIBRARY_SOURCE_REQUIRED_MESSAGE);
  }

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
