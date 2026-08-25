import assert from "node:assert/strict";
import test from "node:test";
import {
  applyChatProgressEvent,
  CANCELLED_CONTENT,
  cancelAssistantMessage,
  completeAssistantMessage,
  createConversationScope,
  createMessage,
  createRequestSnapshot,
  getChatRetryPolicy,
  parseChatDoneEvent,
  PENDING_CONTENT,
  prepareRetryRequestSnapshot,
  prependUniqueMessages,
  RETRY_DISABLED,
  RETRY_REQUEST_ID_RENEW,
  RETRY_REQUEST_ID_REUSE,
  validateChatProgressEvent,
} from "../src/pages/User/AIChat/chatConversation.model.js";
import {
  CHAT_MODE_DOCUMENT,
  CHAT_MODE_LIBRARY,
  createLibraryContext,
} from "../src/pages/User/AIChat/chatContext.js";

test("creates immutable request snapshots without UI-only library metadata", () => {
  const context = createLibraryContext({
    subjectIds: ["subject-1", "subject-2"],
    _subjectsMeta: [
      { id: "subject-1", name: "Công nghệ phần mềm" },
      { id: "subject-2", name: "Toán cao cấp" },
    ],
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
      libraryFilters: {
        subjectIds: ["subject-1", "subject-2"],
        documentIds: ["document-1", "document-2"],
      },
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

test("reuses request ids only for recoverable transport interruptions", () => {
  assert.deepEqual(
    getChatRetryPolicy(
      { name: "TypeError", message: "Failed to fetch" },
      { retryable: true },
    ),
    {
      retryable: true,
      requestIdStrategy: RETRY_REQUEST_ID_REUSE,
    },
  );
  assert.deepEqual(
    getChatRetryPolicy(
      { name: "ChatStreamError", message: "Stream incomplete" },
      {},
    ),
    {
      retryable: true,
      requestIdStrategy: RETRY_REQUEST_ID_REUSE,
    },
  );
});

test("renews request ids after confirmed server-side failures", () => {
  for (const error of [
    { code: "STREAM_REQUEST_FAILED", retryable: true },
    { status: 500 },
  ]) {
    assert.deepEqual(getChatRetryPolicy(error, { retryable: true }), {
      retryable: true,
      requestIdStrategy: RETRY_REQUEST_ID_RENEW,
    });
  }

  const original = createRequestSnapshot(
    "Question?",
    createLibraryContext({ documentIds: ["document-1"] }),
    "session-1",
    "request-old",
  );
  const renewed = prepareRetryRequestSnapshot(
    original,
    RETRY_REQUEST_ID_RENEW,
    "request-new",
  );
  assert.equal(renewed.requestId, "request-new");
  assert.equal(original.requestId, "request-old");
});

test("disables retry for requests that are still pending", () => {
  assert.deepEqual(
    getChatRetryPolicy(
      { code: "REQUEST_IN_PROGRESS", status: 409 },
      { retryable: false },
    ),
    {
      retryable: false,
      requestIdStrategy: RETRY_DISABLED,
    },
  );
});

test("marks aborted output as display-only cancellation without retry", () => {
  const pending = cancelAssistantMessage(
    { content: PENDING_CONTENT, status: "loading" },
    { createdAt: "10:03" },
  );
  assert.equal(pending.content, CANCELLED_CONTENT);
  assert.equal(pending.status, "cancelled");
  assert.equal(pending.streamRetryable, false);
  assert.equal(pending.retryRequestIdStrategy, RETRY_DISABLED);

  const partial = cancelAssistantMessage(
    { content: "Partial answer", status: "streaming" },
    { createdAt: "10:04" },
  );
  assert.match(partial.content, /^Partial answer/);
  assert.match(partial.content, /AI có thể vẫn hoàn tất/);
});
