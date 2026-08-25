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
      actionLabel: "Xem gói & thanh toán",
      actionPath: "/subscription",
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
  assert.deepEqual(
    getChatErrorPresentation({
      name: "TypeError",
      message: "Failed to fetch",
    }),
    {
      message:
        "Không thể kết nối tới AI Study Hub. Vui lòng kiểm tra mạng và thử lại.",
      retryable: true,
    },
  );
});

test("maps deployed backend and stream error codes", () => {
  assert.equal(
    getChatErrorPresentation({ code: "BAD_REQUEST" }).retryable,
    false,
  );
  assert.equal(
    getChatErrorPresentation({ code: "CONFLICT" }).retryable,
    false,
  );
  assert.deepEqual(
    getChatErrorPresentation({ code: "STREAM_REQUEST_FAILED" }),
    {
      code: "STREAM_REQUEST_FAILED",
      details: undefined,
      message: "AI không thể hoàn tất yêu cầu. Vui lòng thử lại.",
      retryable: true,
    },
  );
});
