import test from "node:test";
import assert from "node:assert/strict";
import {
  addChatSessionDocuments,
  removeChatSessionDocument,
} from "../src/api/chat.api.js";
import { apiClient } from "../src/lib/http.js";
import { MAX_LIBRARY_DOCUMENTS } from "../src/api/chat.constants.js";

function installRequestRecorder() {
  const requests = [];
  apiClient.defaults.adapter = async (config) => {
    requests.push(config);
    return {
      data: {
        id: "session-1",
        mode: "ASK_MY_LIBRARY",
        documentId: null,
        documents: [],
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };
  return requests;
}

test("adds normalized document ids to an existing library session", async () => {
  const requests = installRequestRecorder();

  await addChatSessionDocuments("session-1", [
    " document-1 ",
    "document-1",
    "document-2",
  ]);

  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "post");
  assert.equal(requests[0].url, "/chat/sessions/session-1/documents");
  assert.deepEqual(JSON.parse(requests[0].data), {
    documentIds: ["document-1", "document-2"],
  });
});

test("rejects empty or over-limit session document additions", () => {
  assert.throws(
    () => addChatSessionDocuments("session-1", []),
    /documentIds is required/,
  );
  assert.throws(
    () =>
      addChatSessionDocuments(
        "session-1",
        Array.from(
          { length: MAX_LIBRARY_DOCUMENTS + 1 },
          (_, index) => `document-${index + 1}`,
        ),
      ),
    RangeError,
  );
});

test("removes one encoded document id from an existing library session", async () => {
  const requests = installRequestRecorder();

  await removeChatSessionDocument("session-1", "document/with slash");

  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "delete");
  assert.equal(
    requests[0].url,
    "/chat/sessions/session-1/documents/document%2Fwith%20slash",
  );
});
