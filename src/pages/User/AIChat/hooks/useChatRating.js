import { useCallback, useState } from "react";
import { rateChatMessage } from "../../../../api/chat-ratings.api.js";

export function useChatRating({ messageId, initialRating = null }) {
  const [rating, setRating] = useState(initialRating);
  const [isRating, setIsRating] = useState(false);
  const [error, setError] = useState(null);

  const submitRating = useCallback(async (isHelpful) => {
    if (!messageId) {
      throw new Error("messageId is required");
    }

    if (isRating) return null;

    const previousRating = rating;
    setRating(isHelpful);
    setIsRating(true);
    setError(null);

    try {
      const response = await rateChatMessage(messageId, isHelpful);
      return response;
    } catch (requestError) {
      setRating(previousRating);

      const message =
        requestError?.message ||
        "Không thể gửi đánh giá tin nhắn. Vui lòng thử lại.";
      setError(message);
      throw requestError;
    } finally {
      setIsRating(false);
    }
  }, [isRating, messageId, rating]);

  return {
    rating,
    isRating,
    error,
    submitRating,
  };
}
