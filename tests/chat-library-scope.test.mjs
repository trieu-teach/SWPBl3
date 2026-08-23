import test from "node:test";
import assert from "node:assert/strict";
import {
  createLibraryContext,
  filterLibraryDocumentsBySubjects,
  getLibraryScopePresentation,
  setLibrarySubjectScopes,
  toggleLibraryDocumentScope,
} from "../src/pages/User/AIChat/chatContext.js";

test("selecting a document replaces the multi-subject AI scope", () => {
  const subjectContext = setLibrarySubjectScopes([
    { id: "subject-1", name: "Công nghệ phần mềm" },
    { id: "subject-2", name: "Toán cao cấp" },
  ]);
  const documentContext = toggleLibraryDocumentScope(subjectContext, {
    id: "document-1",
    title: "Software Requirements",
  });

  assert.equal(documentContext.libraryFilters.subjectIds, undefined);
  assert.deepEqual(documentContext.libraryFilters.documentIds, ["document-1"]);
  assert.equal(getLibraryScopePresentation(documentContext).label, "1 tài liệu đã chọn");
});

test("creates and presents a multi-subject scope", () => {
  const subjectContext = setLibrarySubjectScopes([
    { id: "subject-1", name: "Công nghệ phần mềm" },
    { id: "subject-2", name: "Toán cao cấp" },
  ]);

  assert.equal(subjectContext.libraryFilters.documentIds, undefined);
  assert.deepEqual(subjectContext.libraryFilters.subjectIds, [
    "subject-1",
    "subject-2",
  ]);
  assert.equal(getLibraryScopePresentation(subjectContext).label, "2 môn học đã chọn");
});

test("explicit documents take precedence over subject filters", () => {
  const context = createLibraryContext({
    subjectIds: ["subject-1", "subject-2"],
    documentIds: ["document-1"],
  });

  assert.equal(context.libraryFilters.subjectIds, undefined);
  assert.deepEqual(context.libraryFilters.documentIds, ["document-1"]);
});

test("filters the sidebar documents by every selected subject", () => {
  const documents = [
    { id: "document-1", subjectId: "subject-1" },
    { id: "document-2", subjectId: "subject-2" },
    { id: "document-3", subjectId: "subject-3" },
  ];

  assert.deepEqual(
    filterLibraryDocumentsBySubjects(documents, ["subject-1", "subject-2"]),
    documents.slice(0, 2),
  );
  assert.deepEqual(filterLibraryDocumentsBySubjects(documents, []), documents);
});

test("empty filters present the whole library scope", () => {
  assert.deepEqual(getLibraryScopePresentation(createLibraryContext(null)), {
    type: "all",
    label: "Toàn bộ thư viện",
  });
});
