function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeStringArray(value) {
  return Array.isArray(value)
    ? [...new Set(value.map(normalizeString).filter(Boolean))]
    : [];
}

export function sanitizeLibraryFilters(filters) {
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    return null;
  }

  const cleaned = {};
  const subjectId = normalizeString(filters.subjectId);
  const subjectIds = normalizeStringArray(filters.subjectIds);
  const documentIds = normalizeStringArray(filters.documentIds);

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

export function buildChatSessionPayload({
  mode,
  documentId,
  documentIds,
}) {
  const body = { mode };
  const normalizedDocumentId = normalizeString(documentId);
  const normalizedDocumentIds = normalizeStringArray(documentIds);

  if (normalizedDocumentId) {
    body.documentId = normalizedDocumentId;
  } else if (normalizedDocumentIds.length > 0) {
    body.documentIds = normalizedDocumentIds;
  }

  return body;
}
