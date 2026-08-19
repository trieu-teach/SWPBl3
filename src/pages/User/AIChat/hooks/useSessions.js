import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getChatSessions } from "../../../../api/chat.api.js";
import {
  CHAT_MODE_DOCUMENT,
  CHAT_MODE_LIBRARY,
} from "../chatContext.js";

const SESSIONS_LIMIT = 20;
const LEGACY_SCOPE_KEY = "ALL_SESSIONS";
const LEGACY_SESSION_OPTIONS = Object.freeze({});

function createSessionScope({ mode, documentId, enabled, legacy }) {
  if (!enabled) return null;

  if (legacy) {
    return {
      key: LEGACY_SCOPE_KEY,
      mode: undefined,
      documentId: undefined,
    };
  }

  if (mode === CHAT_MODE_LIBRARY) {
    return {
      key: CHAT_MODE_LIBRARY,
      mode: CHAT_MODE_LIBRARY,
      documentId: undefined,
    };
  }

  if (mode === CHAT_MODE_DOCUMENT) {
    const normalizedDocumentId =
      typeof documentId === "string" ? documentId.trim() : "";

    if (!normalizedDocumentId) return null;

    return {
      key: JSON.stringify([CHAT_MODE_DOCUMENT, normalizedDocumentId]),
      mode: CHAT_MODE_DOCUMENT,
      documentId: normalizedDocumentId,
    };
  }

  return null;
}

function mergeUniqueSessions(current, incoming) {
  const seenIds = new Set();

  return [...current, ...incoming].filter((session) => {
    const id = session?.id;

    if (!id) return true;
    if (seenIds.has(id)) return false;

    seenIds.add(id);
    return true;
  });
}

export function useSessions(options = LEGACY_SESSION_OPTIONS) {
  const legacy = options === LEGACY_SESSION_OPTIONS;
  const { mode, documentId, enabled = true } = options ?? {};
  const scope = useMemo(
    () => createSessionScope({ mode, documentId, enabled, legacy }),
    [mode, documentId, enabled, legacy],
  );

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [dataScopeKey, setDataScopeKey] = useState(null);

  const generationRef = useRef(0);
  const activeScopeRef = useRef(null);
  const requestRef = useRef(null);

  const fetchPage = useCallback(
    async (requestScope, targetPage, { replace, type }) => {
      const request = {
        generation: ++generationRef.current,
        scopeKey: requestScope.key,
        type,
      };
      const isLoadMore = type === "more";
      requestRef.current = request;

      if (isLoadMore) {
        setLoadingMore(true);
        setLoadMoreError("");
        setError("");
      } else {
        setLoading(true);
        setLoadingMore(false);
        setError("");
        setLoadMoreError("");
      }

      const isCurrentRequest = () =>
        requestRef.current === request &&
        activeScopeRef.current?.key === request.scopeKey &&
        generationRef.current === request.generation;

      try {
        const response = await getChatSessions({
          mode: requestScope.mode,
          documentId: requestScope.documentId,
          page: targetPage,
          limit: SESSIONS_LIMIT,
        });

        if (!isCurrentRequest()) return;

        const items = Array.isArray(response?.items) ? response.items : [];
        const responseHasMore =
          response?.meta?.hasNext ?? items.length === SESSIONS_LIMIT;

        setSessions((current) =>
          replace
            ? mergeUniqueSessions([], items)
            : mergeUniqueSessions(current, items),
        );
        setPage(targetPage);
        setHasMore(Boolean(responseHasMore));
      } catch (err) {
        if (!isCurrentRequest()) return;

        const message =
          err?.message || "Không thể tải danh sách hội thoại.";

        if (isLoadMore) {
          setLoadMoreError(message);
        }
        setError(message);
      } finally {
        if (isCurrentRequest()) {
          if (isLoadMore) {
            setLoadingMore(false);
          } else {
            setLoading(false);
          }
          requestRef.current = null;
        }
      }
    },
    [],
  );

  useEffect(() => {
    generationRef.current += 1;
    requestRef.current = null;
    activeScopeRef.current = scope;

    setSessions([]);
    setLoading(false);
    setLoadingMore(false);
    setError("");
    setLoadMoreError("");
    setPage(1);
    setHasMore(false);

    if (scope) {
      setDataScopeKey(scope.key);
      void fetchPage(scope, 1, { replace: true, type: "initial" });
    } else {
      setDataScopeKey(null);
    }

    return () => {
      generationRef.current += 1;
      requestRef.current = null;

      if (activeScopeRef.current === scope) {
        activeScopeRef.current = null;
      }
    };
  }, [scope, fetchPage]);

  const loadMore = useCallback(() => {
    if (
      !scope ||
      dataScopeKey !== scope.key ||
      !hasMore ||
      requestRef.current
    ) {
      return Promise.resolve();
    }

    return fetchPage(scope, page + 1, { replace: false, type: "more" });
  }, [scope, dataScopeKey, hasMore, page, fetchPage]);

  const refresh = useCallback(() => {
    if (!scope || activeScopeRef.current?.key !== scope.key) {
      return Promise.resolve();
    }

    return fetchPage(scope, 1, { replace: true, type: "refresh" });
  }, [scope, fetchPage]);

  const scopeMatches = Boolean(scope && dataScopeKey === scope.key);

  return {
    sessions: scopeMatches ? sessions : [],
    loading: scope ? !scopeMatches || loading || loadingMore : false,
    loadingMore: scopeMatches ? loadingMore : false,
    error: scopeMatches ? error : "",
    loadMoreError: scopeMatches ? loadMoreError : "",
    hasMore: scopeMatches ? hasMore : false,
    loadMore,
    refresh,
  };
}
