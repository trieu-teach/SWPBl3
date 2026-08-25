import test from "node:test";
import assert from "node:assert/strict";
import {
  createLibraryContext,
  filterLibraryDocumentsBySubjects,
  getLibraryScopePresentation,
  hasSameLibrarySource,
  setLibrarySubjectScope,
  setLibrarySubjectScopes,
  hasStartedLibraryConversation,
  toggleLibraryDocumentScope,
} from "../src/pages/User/AIChat/chatContext.js";
import { MAX_LIBRARY_DOCUMENTS } from "../src/api/chat.constants.js";

const subject = { id: "subject-1", name: "Công nghệ phần mềm" };

test("creates and presents one subject scope without requiring files", () => {
  const context = setLibrarySubjectScope(subject);

  assert.deepEqual(context.libraryFilters.subjectIds, ["subject-1"]);
  assert.equal(context.libraryFilters.documentIds, undefined);
  assert.equal(
    getLibraryScopePresentation(context).label,
    "Công nghệ phần mềm · Toàn bộ tài liệu",
  );
});

test("selecting a file preserves its subject and narrows the scope", () => {
  const subjectContext = setLibrarySubjectScope(subject);
  const documentContext = toggleLibraryDocumentScope(subjectContext, {
    id: "document-1",
    title: "Software Requirements",
    subjectId: "subject-1",
    aiUsable: true,
  });

  assert.deepEqual(documentContext.libraryFilters.subjectIds, ["subject-1"]);
  assert.deepEqual(documentContext.libraryFilters.documentIds, ["document-1"]);
  assert.equal(
    getLibraryScopePresentation(documentContext).label,
    "1 tài liệu đã chọn",
  );
});

test("does not select a file from another subject", () => {
  const subjectContext = setLibrarySubjectScope(subject);
  const unchanged = toggleLibraryDocumentScope(subjectContext, {
    id: "document-2",
    title: "Calculus",
    subjectId: "subject-2",
  });

  assert.equal(unchanged, subjectContext);
});

test("selects files from different subjects when no subject filter is active", () => {
  let context = createLibraryContext(null);
  context = toggleLibraryDocumentScope(context, {
    id: "document-1",
    title: "Software Requirements",
    subjectId: "subject-1",
  });
  context = toggleLibraryDocumentScope(context, {
    id: "document-2",
    title: "Calculus",
    subjectId: "subject-2",
  });

  assert.equal(context.libraryFilters.subjectIds, undefined);
  assert.deepEqual(context.libraryFilters.documentIds, [
    "document-1",
    "document-2",
  ]);
  assert.equal(
    getLibraryScopePresentation(context).label,
    "2 tài liệu đã chọn",
  );
});

test("creates a union scope for multiple selected subjects", () => {
  const context = setLibrarySubjectScopes([
    subject,
    { id: "subject-2", name: "Toán cao cấp" },
  ]);

  assert.deepEqual(context.libraryFilters.subjectIds, [
    "subject-1",
    "subject-2",
  ]);
  assert.equal(
    getLibraryScopePresentation(context).label,
    "2 môn học · Toàn bộ tài liệu",
  );
});

test("does not allow selecting a sixth explicit document", () => {
  let context = setLibrarySubjectScope(subject);
  for (let index = 0; index < MAX_LIBRARY_DOCUMENTS; index += 1) {
    context = toggleLibraryDocumentScope(context, {
      id: `document-${index + 1}`,
      title: `Document ${index + 1}`,
      subjectId: "subject-1",
    });
  }

  const unchanged = toggleLibraryDocumentScope(context, {
    id: "document-6",
    title: "Document 6",
    subjectId: "subject-1",
  });

  assert.equal(unchanged, context);
  assert.equal(unchanged.libraryFilters.documentIds.length, MAX_LIBRARY_DOCUMENTS);
});

test("filters sidebar documents by the union of selected subjects", () => {
  const documents = [
    { id: "document-1", subjectId: "subject-1" },
    { id: "document-2", subjectId: "subject-2" },
    { id: "document-3", subjectId: "subject-1" },
  ];

  assert.deepEqual(
    filterLibraryDocumentsBySubjects(documents, ["subject-1", "subject-2"]),
    documents,
  );
  assert.deepEqual(
    filterLibraryDocumentsBySubjects(documents, ["subject-1"]),
    [documents[0], documents[2]],
  );
  assert.deepEqual(filterLibraryDocumentsBySubjects(documents, []), documents);
});

test("empty filters present the whole eligible library", () => {
  assert.deepEqual(getLibraryScopePresentation(createLibraryContext(null)), {
    type: "all",
    label: "Toàn bộ thư viện",
  });
});

test("compares library sources without depending on document order or metadata", () => {
  const current = createLibraryContext({
    subjectIds: ["subject-2", "subject-1"],
    documentIds: ["document-2", "document-1"],
    _documentMeta: [{ id: "document-2", title: "Old title" }],
  });
  const sameSource = createLibraryContext({
    subjectIds: ["subject-1", "subject-2"],
    documentIds: ["document-1", "document-2"],
    _documentMeta: [{ id: "document-1", title: "New title" }],
  });
  const differentSource = createLibraryContext({
    subjectIds: ["subject-1"],
    documentIds: ["document-3"],
  });

  assert.equal(hasSameLibrarySource(current, sameSource), true);
  assert.equal(hasSameLibrarySource(current, differentSource), false);
});

test("locks the library source after a conversation has started", () => {
  assert.equal(
    hasStartedLibraryConversation({ sessionId: "session-1" }),
    true,
  );
  assert.equal(
    hasStartedLibraryConversation({
      messages: [{ id: "pending-message" }],
    }),
    true,
  );
  assert.equal(
    hasStartedLibraryConversation({ sessionId: " ", messages: [] }),
    false,
  );
  assert.equal(hasStartedLibraryConversation(), false);
});
