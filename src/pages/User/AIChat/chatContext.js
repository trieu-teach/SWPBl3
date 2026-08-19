/**
 * @file chatContext.js
 * Chat Mode & Chat Context domain model.
 *
 * Source of truth for:
 *   - Mode constants (ASK_THIS_DOCUMENT / ASK_MY_LIBRARY)
 *   - Context factory functions
 *   - Context helper predicates
 *
 * No React dependency — importable from hooks, services, and components.
 */

// ── Mode constants ─────────────────────────────────────────────────────────────

/** @type {"ASK_THIS_DOCUMENT"} */
export const CHAT_MODE_DOCUMENT = "ASK_THIS_DOCUMENT";

/** @type {"ASK_MY_LIBRARY"} */
export const CHAT_MODE_LIBRARY = "ASK_MY_LIBRARY";

const LIBRARY_FILTER_FIELDS = [
  "subjectId",
  "subjectIds",
  "categoryId",
  "fileType",
  "documentIds",
];

function normalizeDocumentId(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

function normalizeLibraryFilters(filters) {
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    return null;
  }

  const normalized = {};
  for (const field of LIBRARY_FILTER_FIELDS) {
    const value = filters[field];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length > 0) normalized[field] = [...value];
    } else if (typeof value !== "string" || value.trim()) {
      normalized[field] = value;
    }
  }

  // Temporary display metadata for the current document-picker UI.
  if (
    normalized.documentIds &&
    Array.isArray(filters._documentMeta) &&
    filters._documentMeta.length > 0
  ) {
    normalized._documentMeta = filters._documentMeta.map((document) => ({
      id: document.id,
      title: document.title,
    }));
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

// ── Factory functions ──────────────────────────────────────────────────────────

/**
 * Create a Document context.
 *
 * Use when the user asks about a specific document (ASK_THIS_DOCUMENT).
 *
 * @param {string | { documentId?: string, id?: string, title?: string }} document
 * @returns {ChatContext | null}
 */
export function createDocumentContext(document) {
  const hasCanonicalId =
    document !== null &&
    typeof document === "object" &&
    Object.prototype.hasOwnProperty.call(document, "documentId");
  const documentId = normalizeDocumentId(
    typeof document === "string"
      ? document
      : hasCanonicalId
        ? document.documentId
        : document?.id,
  );

  if (!documentId) return null;

  const title =
    typeof document === "object" && typeof document?.title === "string"
      ? document.title
      : "";

  return {
    mode: CHAT_MODE_DOCUMENT,
    documentId,
    document: { id: documentId, title },
    libraryFilters: null,
  };
}

/**
 * Create a Library context.
 *
 * Use when the user asks across their library (ASK_MY_LIBRARY).
 *
 * Empty filters (null) means: search the entire library.
 * Non-null filters narrow the retrieval scope without changing the mode.
 *
 * Important: libraryFilters === null does NOT mean "no context".
 * It means the entire library is the context.
 *
 * @param {LibraryFilters | null} [filters]
 * @returns {ChatContext}
 */
export function createLibraryContext(filters = null) {
  return {
    mode: CHAT_MODE_LIBRARY,
    document: null,
    libraryFilters: normalizeLibraryFilters(filters),
  };
}

// ── Context helpers ────────────────────────────────────────────────────────────

/**
 * True when context is ASK_THIS_DOCUMENT.
 * @param {ChatContext | null | undefined} context
 * @returns {boolean}
 */
export function isDocumentContext(context) {
  if (context?.mode !== CHAT_MODE_DOCUMENT) return false;

  const documentId = normalizeDocumentId(context.documentId);
  if (!documentId) return false;

  return (
    context.document === undefined ||
    context.document === null ||
    normalizeDocumentId(context.document.id) === documentId
  );
}

/**
 * True when context is ASK_MY_LIBRARY.
 * @param {ChatContext | null | undefined} context
 * @returns {boolean}
 */
export function isLibraryContext(context) {
  return (
    context?.mode === CHAT_MODE_LIBRARY &&
    (context.libraryFilters === null ||
      (typeof context.libraryFilters === "object" &&
        !Array.isArray(context.libraryFilters)))
  );
}

// ── JSDoc types (runtime documentation only — project has no TypeScript) ───────

/**
 * @typedef {Object} ChatContext
 * @property {"ASK_THIS_DOCUMENT" | "ASK_MY_LIBRARY"} mode
 * @property {string | undefined} [documentId]                  - Canonical identity for ASK_THIS_DOCUMENT
 * @property {{ id: string, title: string } | null} document    - Temporary display compatibility
 * @property {LibraryFilters | null} libraryFilters             - Optional narrowing for ASK_MY_LIBRARY
 */

/**
 * @typedef {Object} LibraryFilters
 * @property {string | undefined} [subjectId]
 * @property {string[] | undefined} [subjectIds]
 * @property {string | undefined} [categoryId]
 * @property {string | undefined} [fileType]
 * @property {string[] | undefined} [documentIds]
 * @property {{ id: string, title: string }[] | undefined} [_documentMeta] - Temporary UI compatibility
 */
