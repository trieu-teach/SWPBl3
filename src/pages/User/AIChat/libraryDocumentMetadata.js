function normalizeId(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

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
