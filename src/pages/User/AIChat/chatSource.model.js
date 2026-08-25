function normalizeId(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

const OFFICE_XML_TAG_PATTERN =
  /\\?<\/?(?:a|p|pic|r|w|wp|c|xdr|dgm|mc):[A-Za-z_][\w.-]*(?:\s[^<>]*?)?\/?>/gi;

function normalizeSourceMarkers(value) {
  return value
    .replace(/\[SLIDE:\s*([^\]]+)\]/gi, " · Slide $1 · ")
    .replace(/\[PAGE:\s*([^\]]+)\]/gi, " · Trang $1 · ")
    .replace(/\[TITLE:\s*([^\]]+)\]/gi, " · Tiêu đề: $1 · ")
    .replace(/\s+/g, " ")
    .replace(/(?:\s*·\s*){2,}/g, " · ")
    .replace(/^\s*·\s*|\s*·\s*$/g, "")
    .trim();
}

export function getChatSourceSnippetPresentation(snippet) {
  if (typeof snippet !== "string" || !snippet.trim()) {
    return { text: "", sanitized: false, showFallback: false };
  }

  const normalized = snippet.trim();
  const officeTags = normalized.match(OFFICE_XML_TAG_PATTERN) ?? [];
  const officeMarkupLength = officeTags.reduce(
    (total, tag) => total + tag.length,
    0,
  );
  const hasOfficeMarkup =
    officeTags.length >= 2 ||
    (officeTags.length === 1 &&
      officeMarkupLength / normalized.length >= 0.4);

  const withoutOfficeMarkup = hasOfficeMarkup
    ? normalized.replace(OFFICE_XML_TAG_PATTERN, " ")
    : normalized;
  const text = normalizeSourceMarkers(withoutOfficeMarkup);
  const hasMeaningfulText = /[\p{L}\p{N}]/u.test(text);

  return {
    text: hasMeaningfulText ? text : "",
    sanitized: hasOfficeMarkup,
    showFallback: hasOfficeMarkup && !hasMeaningfulText,
  };
}

export function getChatSourceLocatorPresentation(sourceLocator) {
  const values = Array.isArray(sourceLocator)
    ? sourceLocator
    : [sourceLocator];

  return values
    .filter((value) => typeof value === "string" && value.trim())
    .map(normalizeSourceMarkers)
    .filter(Boolean)
    .join(" · ");
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
