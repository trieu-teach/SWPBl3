function normalizeId(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

export function getChatSourceDocumentId(source) {
  return normalizeId(source?.documentId) || normalizeId(source?.citationId);
}

export function getChatSourceNumber(source, index) {
  const sourceNumber = Number(source?.sourceNumber);
  if (Number.isInteger(sourceNumber) && sourceNumber > 0) {
    return sourceNumber;
  }
  return index + 1;
}
