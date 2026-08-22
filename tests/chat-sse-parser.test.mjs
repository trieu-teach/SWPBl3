import assert from "node:assert/strict";
import test from "node:test";
import {
  extractEvents,
  isValidDoneEvent,
  parseEventChunk,
} from "../src/api/chat.sse-parser.js";

test("parses JSON SSE events", () => {
  assert.deepEqual(parseEventChunk('event: delta\ndata: {"text":"Xin chào"}'), {
    type: "delta",
    data: { text: "Xin chào" },
  });
});

test("keeps an incomplete trailing event in the buffer", () => {
  const result = extractEvents(
    'event: status\ndata: {"phase":"retrieving"}\n\nevent: delta\ndata: {"text":"A"}',
  );
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].type, "status");
  assert.match(result.remaining, /^event: delta/);
});

test("parses each completed delta exactly once", () => {
  const result = extractEvents(
    'event: delta\ndata: {"text":"A"}\n\nevent: delta\ndata: {"text":"B"}\n\n',
  );
  assert.deepEqual(result.events.map((event) => event.data.text), ["A", "B"]);
  assert.equal(result.remaining, "");
});

test("validates terminal done payload identity", () => {
  assert.equal(
    isValidDoneEvent({ answer: "A", sessionId: "session", messageId: "message" }),
    true,
  );
  assert.equal(isValidDoneEvent({ answer: "A", sessionId: "session" }), false);
});
