import assert from "node:assert/strict";
import test from "node:test";
import {
  applyChatProgressEvent,
  completeAssistantMessage,
  createConversationScope,
  createMessage,
  createRequestSnapshot,
  parseChatDoneEvent,
  PENDING_CONTENT,
  prependUniqueMessages,
  validateChatProgressEvent,
} from "../src/pages/User/AIChat/chatConversation.model.js";
import {
  CHAT_MODE_DOCUMENT,
  CHAT_MODE_LIBRARY,
  createLibraryContext,
} from "../src/pages/User/AIChat/chatContext.js";

test("creates immutable request snapshots without UI-only library metadata", () => {
  const context = createLibraryContext({
    documentIds: ["document-1", "document-2"],
    _documentMeta: [{ id: "document-1", title: "Document 1" }],
  });
  const snapshot = createRequestSnapshot(
    "Question?",
    context,
    " session-1 ",
    "request-1",
  );

  assert.deepEqual(snapshot, {
    question: "Question?",
    context: {
      mode: CHAT_MODE_LIBRARY,
      libraryFilters: { documentIds: ["document-1", "document-2"] },
    },
    sessionId: "session-1",
    requestId: "request-1",
  });

  context.libraryFilters.documentIds.push("document-3");
  assert.deepEqual(snapshot.context.libraryFilters.documentIds, [
    "document-1",
    "document-2",
  ]);
});

test("creates stable scopes for document and library conversations", () => {
  assert.deepEqual(
    createConversationScope(
      { mode: CHAT_MODE_DOCUMENT, documentId: " document-1 " },
      true,
    ),
    {
      key: JSON.stringify([CHAT_MODE_DOCUMENT, "document-1"]),
      context: { mode: CHAT_MODE_DOCUMENT, documentId: "document-1" },
    },
  );
  assert.equal(
    createConversationScope(
      { mode: CHAT_MODE_LIBRARY, libraryFilters: [] },
      true,
    ),
    null,
  );
  assert.equal(createConversationScope(createLibraryContext(null), false), null);
});

test("applies status, sources, and delta events to an assistant message", () => {
  const pending = createMessage({
    id: "assistant-1",
    role: "assistant",
    content: PENDING_CONTENT,
    status: "loading",
    createdAt: "10:00",
  });
  const generating = applyChatProgressEvent(
    pending,
    validateChatProgressEvent("status", { phase: "generating" }),
  );
  const withSources = applyChatProgressEvent(
    generating,
    validateChatProgressEvent("sources", [{ citationId: "document-1" }]),
  );
  const withDelta = applyChatProgressEvent(
    withSources,
    validateChatProgressEvent("delta", { text: "Answer" }),
  );

  assert.equal(withDelta.content, "Answer");
  assert.equal(withDelta.status, "streaming");
  assert.equal(withDelta.streamPhase, "generating");
  assert.deepEqual(withDelta.sources, [{ citationId: "document-1" }]);
  assert.equal(pending.content, PENDING_CONTENT);
});

test("rejects malformed progress and terminal stream events", () => {
  assert.throws(
    () => validateChatProgressEvent("sources", {}),
    /Danh sách nguồn từ AI không hợp lệ/,
  );
  assert.throws(
    () => validateChatProgressEvent("delta", {}),
    /Dữ liệu phản hồi AI không hợp lệ/,
  );
  assert.throws(
    () =>
      parseChatDoneEvent(
        {
          answer: "Answer",
          sessionId: "session-2",
          messageId: "message-1",
        },
        "session-1",
      ),
    /Phản hồi hoàn tất từ AI không hợp lệ/,
  );
});

test("completes an assistant message from a validated done event", () => {
  const doneEvent = parseChatDoneEvent(
    {
      answer: "Final answer",
      sessionId: "session-1",
      messageId: "message-1",
      sources: [{ citationId: "document-1" }],
      suggestedPrompts: ["Next question"],
      answerStatus: "ANSWERED",
      usage: { remaining: 10 },
    },
    "session-1",
  );
  const completed = completeAssistantMessage(
    { id: "assistant-1", content: "Streamed answer", status: "streaming" },
    doneEvent,
    { receivedDelta: true, createdAt: "10:01" },
  );

  assert.equal(completed.content, "Streamed answer");
  assert.equal(completed.status, "complete");
  assert.equal(completed.streamPhase, "COMPLETED");
  assert.equal(completed.backendMessageId, "message-1");
  assert.equal(completed.sessionId, "session-1");
  assert.deepEqual(completed.sources, [{ citationId: "document-1" }]);
  assert.deepEqual(completed.suggestedPrompts, ["Next question"]);
  assert.equal(completed.answerStatus, "ANSWERED");
  assert.equal(completed.createdAt, "10:01");

  const completedWithoutDelta = completeAssistantMessage(
    { id: "assistant-2", content: PENDING_CONTENT, status: "loading" },
    doneEvent,
    { createdAt: "10:02" },
  );
  assert.equal(completedWithoutDelta.content, "Final answer");
});

test("prepends older history without duplicating message ids", () => {
  assert.deepEqual(
    prependUniqueMessages(
      [
        { id: "message-1" },
        { id: "message-2", content: "older duplicate" },
      ],
      [
        { id: "message-2", content: "current" },
        { id: "message-3" },
      ],
    ),
    [
      { id: "message-1" },
      { id: "message-2", content: "current" },
      { id: "message-3" },
    ],
  );
});
