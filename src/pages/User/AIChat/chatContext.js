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

// ── Factory functions ──────────────────────────────────────────────────────────

/**
 * Create a Document context.
 *
 * Use when the user asks about a specific document (ASK_THIS_DOCUMENT).
 *
 * @param {{ id: string, title: string }} document
 * @returns {ChatContext}
 */
export function createDocumentContext(document) {
  return {
    mode: CHAT_MODE_DOCUMENT,
    document: { id: document.id, title: document.title },
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
    libraryFilters: filters ?? null,
  };
}

// ── Context helpers ────────────────────────────────────────────────────────────

/**
 * True when context is set and has a valid mode.
 * @param {ChatContext | null | undefined} context
 * @returns {boolean}
 */
export function hasActiveContext(context) {
  return (
    context !== null &&
    context !== undefined &&
    (context.mode === CHAT_MODE_DOCUMENT || context.mode === CHAT_MODE_LIBRARY)
  );
}

/**
 * True when context is ASK_THIS_DOCUMENT.
 * @param {ChatContext | null | undefined} context
 * @returns {boolean}
 */
export function isDocumentContext(context) {
  return context?.mode === CHAT_MODE_DOCUMENT;
}

/**
 * True when context is ASK_MY_LIBRARY.
 * @param {ChatContext | null | undefined} context
 * @returns {boolean}
 */
export function isLibraryContext(context) {
  return context?.mode === CHAT_MODE_LIBRARY;
}

// ── Session → Context mapper ───────────────────────────────────────────────────

/**
 * Derive a ChatContext from a backend ChatSessionDto.
 *
 * Called when the user selects an existing session from the sidebar.
 * The session's mode and documentId are the authoritative source of context.
 *
 * Returns null if the session DTO is missing or has an unrecognised mode.
 *
 * @param {{ mode: string, documentId?: string | null, document?: { id: string, title: string } | null } | null | undefined} sessionDto
 * @returns {ChatContext | null}
 */
export function deriveContextFromSession(sessionDto) {
  if (!sessionDto) return null;

  if (sessionDto.mode === CHAT_MODE_DOCUMENT) {
    const doc = sessionDto.document ?? null;
    const id = doc?.id ?? sessionDto.documentId ?? null;
    const title = doc?.title ?? "";
    if (!id) return null;
    return createDocumentContext({ id, title });
  }

  if (sessionDto.mode === CHAT_MODE_LIBRARY) {
    // Library context: no document, no filters (filters are not persisted per-session in the contract).
    return createLibraryContext(null);
  }

  // Unrecognised or COMMUNITY_SEARCH — return null; do not invent context.
  return null;
}

// ── JSDoc types (runtime documentation only — project has no TypeScript) ───────

/**
 * @typedef {Object} ChatContext
 * @property {"ASK_THIS_DOCUMENT" | "ASK_MY_LIBRARY"} mode
 * @property {{ id: string, title: string } | null} document  - Populated for ASK_THIS_DOCUMENT
 * @property {LibraryFilters | null} libraryFilters            - Optional narrowing for ASK_MY_LIBRARY
 */

/**
 * @typedef {Object} LibraryFilters
 * @property {string | undefined} [subjectId]
 * @property {string[] | undefined} [subjectIds]
 * @property {string | undefined} [categoryId]
 * @property {string | undefined} [fileType]
 * @property {string[] | undefined} [documentIds]
 */
