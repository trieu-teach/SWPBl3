import assert from "node:assert/strict";
import test from "node:test";
import {
  createChatRequestId,
  resolveChatRequestId,
} from "../src/api/chat.request-id.js";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test("creates a UUID v4 request id for every new question", () => {
  const first = createChatRequestId();
  const second = createChatRequestId();
  assert.match(first, UUID_V4_PATTERN);
  assert.match(second, UUID_V4_PATTERN);
  assert.notEqual(first, second);
});

test("preserves an existing request id for an idempotent retry", () => {
  const requestId = "44444444-4444-4444-8444-444444444444";
  assert.equal(resolveChatRequestId(`  ${requestId}  `), requestId);
});

test("creates a request id when the caller omits one", () => {
  assert.match(resolveChatRequestId(), UUID_V4_PATTERN);
});
