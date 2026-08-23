import assert from "node:assert/strict";
import test from "node:test";
import { getChatErrorPresentation } from "../src/api/chat.errors.js";

test("maps credit exhaustion to an explicit pricing action", () => {
  assert.deepEqual(
    getChatErrorPresentation({ code: "AI_CREDIT_LIMIT_EXCEEDED" }),
    {
      code: "AI_CREDIT_LIMIT_EXCEEDED",
      details: undefined,
      message: "Bạn đã dùng hết AI Credits tháng này.",
      actionLabel: "Xem bảng giá",
      actionPath: "/bang-gia",
      retryable: false,
    },
  );
});

test("does not offer retry for business conflicts", () => {
  assert.equal(
    getChatErrorPresentation({ code: "REQUEST_IN_PROGRESS" }).retryable,
    false,
  );
  assert.equal(
    getChatErrorPresentation({ code: "DOCUMENT_NOT_READY" }).retryable,
    false,
  );
});

test("allows a user-controlled retry for network failures", () => {
  assert.equal(getChatErrorPresentation({ status: 0 }).retryable, true);
});
