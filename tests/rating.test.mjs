import assert from "node:assert/strict";
import test from "node:test";
import {
  rateChatMessage,
  rateDocument,
} from "../src/api/rating.api.js";

test("rateChatMessage validates messageId requirement", async () => {
  await assert.rejects(
    async () => {
      await rateChatMessage("", true);
    },
    {
      message: "messageId is required to rate chat message",
    },
  );
});

test("rateDocument validates documentId requirement", async () => {
  await assert.rejects(
    async () => {
      await rateDocument("", true);
    },
    {
      message: "documentId is required to rate document",
    },
  );
});
