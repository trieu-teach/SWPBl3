import { useCallback, useEffect, useRef, useState } from "react";
import { getChatSessions } from "../../../../api/chat.api.js";

const SESSIONS_LIMIT = 20;

/**
 * Manages the session list from GET /chat/sessions.
 * Provides: sessions[], loading, error, hasMore, loadMore(), refresh()
 */
export function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const loadingRef = useRef(false);

  const load = useCallback(async (targetPage, replace = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError("");
    try {
      const response = await getChatSessions({ page: targetPage, limit: SESSIONS_LIMIT });
      const items = Array.isArray(response?.items) ? response.items : [];
      const meta = response?.meta || {};
      const more = meta.hasNext ?? (items.length === SESSIONS_LIMIT);

      setSessions((current) => (replace ? items : [...current, ...items]));
      setHasMore(more);
      setPage(targetPage);
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách hội thoại.");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    load(1, true);
  }, [load]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingRef.current) return;
    load(page + 1, false);
  }, [hasMore, load, page]);

  const refresh = useCallback(() => {
    load(1, true);
  }, [load]);

  return { sessions, loading, error, hasMore, loadMore, refresh };
}
