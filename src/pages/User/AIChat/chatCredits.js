import { CHAT_MODE_DOCUMENT } from "./chatContext.js";

function hasOwn(value, key) {
  return Boolean(
    value &&
      typeof value === "object" &&
      Object.prototype.hasOwnProperty.call(value, key),
  );
}

function finiteNumber(...values) {
  for (const value of values) {
    const parsed = Number(value);
    if (value !== null && value !== undefined && Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

export function getRequiredChatCredits(mode) {
  return mode === CHAT_MODE_DOCUMENT ? 1 : 2;
}

export function normalizeChatCredits(value, previous = null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return previous;
  }

  const hasCreditData = [
    "aiCreditLimit",
    "aiChatLimit",
    "aiCreditsUsed",
    "aiChatsUsed",
    "aiCreditsRemaining",
    "creditsUsed",
    "creditsRemaining",
  ].some((key) => hasOwn(value, key));
  if (!hasCreditData) return previous;

  const hasExplicitLimit =
    hasOwn(value, "aiCreditLimit") || hasOwn(value, "aiChatLimit");
  const explicitLimit = value.aiCreditLimit ?? value.aiChatLimit;
  const used = finiteNumber(
    value.aiCreditsUsed,
    value.aiChatsUsed,
    value.creditsUsed,
    previous?.used,
  );
  const remaining = finiteNumber(
    value.aiCreditsRemaining,
    value.creditsRemaining,
    previous?.remaining,
  );
  let limit = hasExplicitLimit
    ? explicitLimit === null
      ? null
      : finiteNumber(explicitLimit)
    : previous?.limit;

  if (limit === undefined && used !== null && remaining !== null) {
    limit = used + remaining;
  }

  const unlimited = limit === null && (hasExplicitLimit || previous?.unlimited);
  const normalizedUsed = Math.max(0, used ?? 0);
  const normalizedRemaining = unlimited
    ? null
    : Math.max(
        0,
        remaining ??
          (Number.isFinite(limit) ? Number(limit) - normalizedUsed : 0),
      );
  const percent = finiteNumber(
    value.aiUsagePercent,
    value.usagePercent,
    Number.isFinite(limit) && Number(limit) > 0
      ? (normalizedUsed / Number(limit)) * 100
      : 0,
  );

  return {
    limit: unlimited ? null : Number.isFinite(limit) ? Number(limit) : null,
    used: normalizedUsed,
    remaining: normalizedRemaining,
    percent: Math.min(100, Math.max(0, percent ?? 0)),
    unlimited,
  };
}

export function getChatCreditPresentation(
  credits,
  mode,
  { loading = false, error = "" } = {},
) {
  const required = getRequiredChatCredits(mode);
  if (!credits) {
    return {
      required,
      blocked: false,
      low: false,
      label: loading
        ? "Đang tải AI Credits"
        : error
          ? "Không tải được AI Credits"
          : "AI Credits chưa khả dụng",
      color: "default",
      error,
    };
  }

  if (credits.unlimited) {
    return {
      required,
      blocked: false,
      low: false,
      label: "AI Credits: Không giới hạn",
      color: "success",
    };
  }

  const remaining = Math.max(0, Number(credits.remaining) || 0);
  const limit = Math.max(0, Number(credits.limit) || 0);
  const blocked = remaining < required;
  const low = !blocked && (credits.percent >= 80 || remaining <= required * 2);

  return {
    required,
    remaining,
    limit,
    blocked,
    low,
    label: `Còn ${remaining.toLocaleString("vi-VN")}/${limit.toLocaleString("vi-VN")} credits`,
    color: blocked ? "error" : low ? "warning" : "primary",
  };
}
