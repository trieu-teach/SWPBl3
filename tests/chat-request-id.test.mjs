import assert from "node:assert/strict";
import test from "node:test";
import { createChatRequestId } from "../src/api/chat.request-id.js";

test("creates a UUID v4 request id for every new question", () => {
  const first = createChatRequestId();
  const second = createChatRequestId();
  const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  assert.match(first, uuidV4);
  assert.match(second, uuidV4);
  assert.notEqual(first, second);
});
