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

import { MAX_LIBRARY_DOCUMENTS } from "../../../api/chat.constants.js";

// ── Mode constants ─────────────────────────────────────────────────────────────

/** @type {"ASK_THIS_DOCUMENT"} */
export const CHAT_MODE_DOCUMENT = "ASK_THIS_DOCUMENT";

/** @type {"ASK_MY_LIBRARY"} */
export const CHAT_MODE_LIBRARY = "ASK_MY_LIBRARY";

const LIBRARY_FILTER_FIELDS = [
  "categoryId",
  "fileType",
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

  const subjectId = normalizeDocumentId(filters.subjectId);
  const subjectIds = Array.isArray(filters.subjectIds)
    ? [...new Set(filters.subjectIds.map(normalizeDocumentId).filter(Boolean))]
    : [];
  const documentIds = Array.isArray(filters.documentIds)
    ? [...new Set(filters.documentIds.map(normalizeDocumentId).filter(Boolean))]
    : [];

  // A subject scope and an explicit document scope are mutually exclusive.
  // Explicit documents are the narrowest scope and therefore win.
  if (documentIds.length > 0) {
    normalized.documentIds = documentIds;
  } else if (subjectIds.length > 0) {
    normalized.subjectIds = subjectIds;
  } else if (subjectId) {
    normalized.subjectId = subjectId;
  }

  if (normalized.subjectIds) {
    const subjectIdsSet = new Set(normalized.subjectIds);
    const subjectsMeta = Array.isArray(filters._subjectsMeta)
      ? filters._subjectsMeta
      : [];
    normalized._subjectsMeta = subjectsMeta
      .map((subject) => {
        const id = normalizeDocumentId(subject?.id);
        if (!id || !subjectIdsSet.has(id)) return null;
        return {
          id,
          name:
            typeof subject?.name === "string" && subject.name.trim()
              ? subject.name.trim()
              : "Môn học đã chọn",
        };
      })
      .filter(Boolean);
  } else if (
    normalized.subjectId &&
    filters._subjectMeta &&
    typeof filters._subjectMeta === "object" &&
    !Array.isArray(filters._subjectMeta)
  ) {
    const metaId = normalizeDocumentId(filters._subjectMeta.id);
    if (metaId === normalized.subjectId) {
      normalized._subjectMeta = {
        id: metaId,
        name:
          typeof filters._subjectMeta.name === "string" && filters._subjectMeta.name.trim()
            ? filters._subjectMeta.name.trim()
            : "Môn học đã chọn",
      };
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
      available: document.available !== false,
      unavailableReason: document.unavailableReason ?? null,
    }));
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

export function setLibrarySubjectScope(subject) {
  return setLibrarySubjectScopes(subject ? [subject] : []);
}

export function setLibrarySubjectScopes(subjects) {
  const uniqueSubjects = new Map();
  (Array.isArray(subjects) ? subjects : []).forEach((subject) => {
    const id = normalizeDocumentId(subject?.id);
    if (!id) return;
    uniqueSubjects.set(id, {
      id,
      name:
        typeof subject?.name === "string" && subject.name.trim()
          ? subject.name.trim()
          : "Môn học đã chọn",
    });
  });

  const normalizedSubjects = [...uniqueSubjects.values()];
  if (normalizedSubjects.length === 0) return createLibraryContext(null);

  return createLibraryContext({
    subjectIds: normalizedSubjects.map((subject) => subject.id),
    _subjectsMeta: normalizedSubjects,
  });
}

export function filterLibraryDocumentsBySubjects(
  documents,
  selectedSubjectIds,
) {
  const source = Array.isArray(documents) ? documents : [];
  const selectedIds = new Set(
    (Array.isArray(selectedSubjectIds) ? selectedSubjectIds : [])
      .map(normalizeDocumentId)
      .filter(Boolean),
  );
  if (selectedIds.size === 0) return source;
  return source.filter((document) => selectedIds.has(document?.subjectId));
}

export function toggleLibraryDocumentScope(context, document, shouldSelect) {
  const documentId = normalizeDocumentId(document?.id);
  if (!documentId) return context;

  const filters = context?.libraryFilters ?? {};
  const currentIds = Array.isArray(filters.documentIds)
    ? filters.documentIds
    : [];
  const currentMeta = Array.isArray(filters._documentMeta)
    ? filters._documentMeta
    : [];
  const selected = currentIds.includes(documentId);
  const nextSelected = shouldSelect ?? !selected;
  if (
    nextSelected &&
    !selected &&
    currentIds.length >= MAX_LIBRARY_DOCUMENTS
  ) {
    return context;
  }
  const nextIds = nextSelected
    ? [...new Set([...currentIds, documentId])]
    : currentIds.filter((id) => id !== documentId);
  const metaById = new Map(
    currentMeta
      .filter((item) => normalizeDocumentId(item?.id))
      .map((item) => [item.id, item]),
  );

  if (nextSelected) {
    metaById.set(documentId, {
      id: documentId,
      title:
        typeof document?.title === "string" && document.title.trim()
          ? document.title.trim()
          : metaById.get(documentId)?.title || "Tài liệu",
      available: document?.available !== false,
      unavailableReason: document?.unavailableReason ?? null,
    });
  } else {
    metaById.delete(documentId);
  }

  return createLibraryContext(
    nextIds.length > 0
      ? {
          documentIds: nextIds,
          _documentMeta: nextIds.map((id) => metaById.get(id)).filter(Boolean),
        }
      : null,
  );
}

export function getLibraryScopePresentation(context) {
  const filters = context?.libraryFilters;
  const documentIds = Array.isArray(filters?.documentIds)
    ? filters.documentIds
    : [];
  if (documentIds.length > 0) {
    return {
      type: "documents",
      documentIds,
      label: `${documentIds.length} tài liệu đã chọn`,
    };
  }

  const subjectIds = Array.isArray(filters?.subjectIds)
    ? filters.subjectIds
    : [];
  if (subjectIds.length > 0) {
    const subjects = Array.isArray(filters?._subjectsMeta)
      ? filters._subjectsMeta
      : [];
    const subjectName = subjects.find(
      (subject) => subject.id === subjectIds[0],
    )?.name;
    return {
      type: "subjects",
      subjectIds,
      subjects,
      label:
        subjectIds.length === 1
          ? `Môn học: ${subjectName || "Môn học đã chọn"}`
          : `${subjectIds.length} môn học đã chọn`,
    };
  }

  const subjectId = normalizeDocumentId(filters?.subjectId);
  if (subjectId) {
    return {
      type: "subject",
      subjectId,
      subjectName: filters?._subjectMeta?.name || "Môn học đã chọn",
      label: `Môn học: ${filters?._subjectMeta?.name || "Môn học đã chọn"}`,
    };
  }

  return { type: "all", label: "Toàn bộ thư viện" };
}

/**
 * True when libraryFilters contain at least one primary source selection
 * (subjectId, subjectIds, or documentIds). categoryId and fileType are
 * secondary filters and do NOT count as a source selection on their own.
 *
 * @param {LibraryFilters | null | undefined} libraryFilters
 * @returns {boolean}
 */
export function hasSelectedSource(libraryFilters) {
  if (!libraryFilters) return false;
  return Boolean(
    libraryFilters.subjectId ||
      (libraryFilters.subjectIds && libraryFilters.subjectIds.length > 0) ||
      (libraryFilters.documentIds && libraryFilters.documentIds.length > 0),
  );
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
 * @property {{ id: string, name: string } | undefined} [_subjectMeta] - Temporary UI compatibility
 * @property {{ id: string, name: string }[] | undefined} [_subjectsMeta] - Multi-subject display metadata
 * @property {{ id: string, title: string }[] | undefined} [_documentMeta] - Temporary UI compatibility
 */
