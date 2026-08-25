import test from "node:test";
import assert from "node:assert/strict";
import {
  getChatCreditPresentation,
  getRequiredChatCredits,
  normalizeChatCredits,
} from "../src/pages/User/AIChat/chatCredits.js";
import {
  CHAT_MODE_DOCUMENT,
  CHAT_MODE_LIBRARY,
} from "../src/pages/User/AIChat/chatContext.js";

test("uses one credit for document chat and two for library chat", () => {
  assert.equal(getRequiredChatCredits(CHAT_MODE_DOCUMENT), 1);
  assert.equal(getRequiredChatCredits(CHAT_MODE_LIBRARY), 2);
});

test("normalizes canonical subscription credit fields", () => {
  assert.deepEqual(
    normalizeChatCredits({
      aiCreditLimit: 100,
      aiCreditsUsed: 25,
      aiCreditsRemaining: 75,
      aiUsagePercent: 25,
    }),
    {
      limit: 100,
      used: 25,
      remaining: 75,
      percent: 25,
      unlimited: false,
    },
  );
});

test("updates the balance from a completed chat usage payload", () => {
  const previous = {
    limit: 10,
    used: 4,
    remaining: 6,
    percent: 40,
    unlimited: false,
  };

  assert.deepEqual(
    normalizeChatCredits(
      { creditsUsed: 6, creditsRemaining: 4, usagePercent: 60 },
      previous,
    ),
    {
      limit: 10,
      used: 6,
      remaining: 4,
      percent: 60,
      unlimited: false,
    },
  );
});

test("blocks a library question when fewer than two credits remain", () => {
  const presentation = getChatCreditPresentation(
    { limit: 10, used: 9, remaining: 1, percent: 90, unlimited: false },
    CHAT_MODE_LIBRARY,
  );

  assert.equal(presentation.required, 2);
  assert.equal(presentation.blocked, true);
  assert.equal(presentation.color, "error");
});

test("does not block unlimited subscriptions", () => {
  const presentation = getChatCreditPresentation(
    { limit: null, used: 20, remaining: null, percent: 0, unlimited: true },
    CHAT_MODE_LIBRARY,
  );

  assert.equal(presentation.blocked, false);
  assert.match(presentation.label, /không giới hạn/i);
});
