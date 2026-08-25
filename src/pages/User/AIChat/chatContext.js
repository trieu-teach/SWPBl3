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

  const subjectIds = [
    normalizeDocumentId(filters.subjectId),
    ...(Array.isArray(filters.subjectIds)
      ? filters.subjectIds.map(normalizeDocumentId)
      : []),
  ].filter(Boolean);
  const uniqueSubjectIds = [...new Set(subjectIds)];
  const documentIds = Array.isArray(filters.documentIds)
    ? [...new Set(filters.documentIds.map(normalizeDocumentId).filter(Boolean))]
    : [];

  if (uniqueSubjectIds.length > 0) normalized.subjectIds = uniqueSubjectIds;
  if (documentIds.length > 0) {
    normalized.documentIds = documentIds;
  }

  const subjectMetadata = [
    ...(Array.isArray(filters._subjectsMeta) ? filters._subjectsMeta : []),
    ...(filters._subjectMeta ? [filters._subjectMeta] : []),
  ];
  const subjectMetadataById = new Map(
    subjectMetadata
      .filter((subject) => normalizeDocumentId(subject?.id))
      .map((subject) => [normalizeDocumentId(subject.id), subject]),
  );
  if (normalized.subjectIds) {
    normalized._subjectsMeta = normalized.subjectIds.map((id) => {
      const subject = subjectMetadataById.get(id);
      return {
        id,
        name:
          typeof subject?.name === "string" && subject.name.trim()
            ? subject.name.trim()
            : "Môn học đã chọn",
      };
    });
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
      subjectId: normalizeDocumentId(document.subjectId),
      accessType: document.accessType,
      visibility: document.visibility,
      aiUsable: document.aiUsable === true,
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
  const source = Array.isArray(subjects) ? subjects : [];
  const subjectsById = new Map();
  source.forEach((subject) => {
    const id = normalizeDocumentId(subject?.id);
    if (!id || subjectsById.has(id)) return;
    subjectsById.set(id, {
      id,
      name:
        typeof subject?.name === "string" && subject.name.trim()
          ? subject.name.trim()
          : "Môn học đã chọn",
    });
  });
  const normalizedSubjects = [...subjectsById.values()];
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
  const subjectIds = Array.isArray(selectedSubjectIds)
    ? [...new Set(selectedSubjectIds.map(normalizeDocumentId).filter(Boolean))]
    : [];
  if (subjectIds.length === 0) return source;
  const selected = new Set(subjectIds);
  return source.filter((document) => selected.has(document?.subjectId));
}

export function toggleLibraryDocumentScope(context, document, shouldSelect) {
  const documentId = normalizeDocumentId(document?.id);
  const subjectIds = Array.isArray(context?.libraryFilters?.subjectIds)
    ? context.libraryFilters.subjectIds
        .map(normalizeDocumentId)
        .filter(Boolean)
    : [];
  const documentSubjectId = normalizeDocumentId(document?.subjectId);
  if (
    !documentId ||
    (subjectIds.length > 0 && !subjectIds.includes(documentSubjectId))
  ) {
    return context;
  }

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
      subjectId: documentSubjectId,
      accessType: document?.accessType,
      visibility: document?.visibility,
      aiUsable: document?.aiUsable === true,
      available: document?.available !== false,
      unavailableReason: document?.unavailableReason ?? null,
    });
  } else {
    metaById.delete(documentId);
  }

  return createLibraryContext({
    ...(subjectIds.length > 0
      ? { subjectIds, _subjectsMeta: filters._subjectsMeta }
      : {}),
    ...(nextIds.length > 0
      ? {
          documentIds: nextIds,
          _documentMeta: nextIds.map((id) => metaById.get(id)).filter(Boolean),
        }
      : {}),
  });
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
    ? filters.subjectIds.map(normalizeDocumentId).filter(Boolean)
    : [];
  if (subjectIds.length > 0) {
    const subjects = Array.isArray(filters?._subjectsMeta)
      ? filters._subjectsMeta.filter((subject) => subjectIds.includes(subject?.id))
      : [];
    const subjectName =
      subjects.find((subject) => subject.id === subjectIds[0])?.name ||
      "Môn học đã chọn";
    return {
      type: "subjects",
      subjectIds,
      subjects,
      label:
        subjectIds.length === 1
          ? `${subjectName} · Toàn bộ tài liệu`
          : `${subjectIds.length} môn học · Toàn bộ tài liệu`,
    };
  }

  return { type: "all", label: "Toàn bộ thư viện" };
}

function getPrimaryLibrarySourceKey(context) {
  const filters = context?.libraryFilters;
  const documentIds = Array.isArray(filters?.documentIds)
    ? filters.documentIds.map(normalizeDocumentId).filter(Boolean).sort()
    : [];
  if (documentIds.length > 0) {
    return JSON.stringify(["documents", ...documentIds]);
  }

  const subjectIds = Array.isArray(filters?.subjectIds)
    ? filters.subjectIds.map(normalizeDocumentId).filter(Boolean).sort()
    : [];
  return JSON.stringify(["subjects", ...subjectIds]);
}

export function hasSameLibrarySource(currentContext, nextContext) {
  return (
    getPrimaryLibrarySourceKey(currentContext) ===
    getPrimaryLibrarySourceKey(nextContext)
  );
}

export function hasStartedLibraryConversation({
  sessionId,
  messages,
} = {}) {
  return Boolean(
    normalizeDocumentId(sessionId) ||
      (Array.isArray(messages) && messages.length > 0),
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
 * Empty filters (null) means the whole eligible library.
 * Non-null filters narrow the retrieval scope without changing the mode.
 *
 * Subject and explicit document selection are both optional.
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
 * @property {string[] | undefined} [subjectIds]
 * @property {string | undefined} [categoryId]
 * @property {string | undefined} [fileType]
 * @property {string[] | undefined} [documentIds]
 * @property {{ id: string, name: string }[] | undefined} [_subjectsMeta] - Temporary UI compatibility
 * @property {{ id: string, title: string, subjectId?: string }[] | undefined} [_documentMeta] - Temporary UI compatibility
 */
