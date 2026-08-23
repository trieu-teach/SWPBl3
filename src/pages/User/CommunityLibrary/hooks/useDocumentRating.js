import { useCallback, useState } from "react";
import { rateDocument } from "../../../../api/document-ratings.api.js";

const TOP_RATED_INVALIDATE_EVENT = "top-rated-documents:invalidate";

function invalidateTopRatedDocuments() {
  window.dispatchEvent(new Event(TOP_RATED_INVALIDATE_EVENT));
}

export default function useDocumentRating() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentRatings, setDocumentRatings] = useState({});

  const submitRating = useCallback(async ({ documentId, isHelpful }) => {
    if (!documentId) {
      throw new Error("documentId is required");
    }

    let previousRating;
    setDocumentRatings((current) => {
      previousRating = current[documentId];
      return { ...current, [documentId]: isHelpful };
    });
    setLoading(true);
    setError(null);

    try {
      const result = await rateDocument(documentId, isHelpful);
      invalidateTopRatedDocuments();
      return result;
    } catch (requestError) {
      setDocumentRatings((current) => {
        const next = { ...current };
        if (previousRating === undefined) delete next[documentId];
        else next[documentId] = previousRating;
        return next;
      });

      let message = "Không thể gửi đánh giá tài liệu.";
      if (requestError?.status === 404) {
        message =
          "Tài liệu không tồn tại, đã bị xóa hoặc không còn được công khai.";
      } else if (requestError?.message) {
        message = requestError.message;
      }

      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    submitRating,
    loading,
    error,
    documentRatings,
    getDocumentRating: (documentId) =>
      documentRatings[documentId] ?? null,
  };
}

export { TOP_RATED_INVALIDATE_EVENT };
