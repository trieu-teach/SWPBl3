import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getChatSession } from "../../../../api/chat.api.js";
import {
  CHAT_MODE_DOCUMENT,
  CHAT_MODE_LIBRARY,
} from "../chatContext.js";

const UNAVAILABLE_ERROR = "Cuộc hội thoại không khả dụng.";
const VALIDATION_ERROR =
  "Không thể xác minh cuộc hội thoại. Vui lòng thử lại.";
const INVALID_SESSION_STATUSES = new Set([400, 403, 404]);

function normalizeId(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

function createRouteScope({ mode, documentId, basePath, enabled }) {
  if (!enabled) return null;

  const normalizedBasePath =
    typeof basePath === "string" ? basePath.trim() : "";
  if (!normalizedBasePath) return null;

  if (mode === CHAT_MODE_LIBRARY) {
    return {
      key: JSON.stringify([CHAT_MODE_LIBRARY, normalizedBasePath]),
      mode: CHAT_MODE_LIBRARY,
      documentId: null,
      basePath: normalizedBasePath,
    };
  }

  if (mode === CHAT_MODE_DOCUMENT) {
    const normalizedDocumentId = normalizeId(documentId);
    if (!normalizedDocumentId) return null;

    return {
      key: JSON.stringify([
        CHAT_MODE_DOCUMENT,
        normalizedDocumentId,
        normalizedBasePath,
      ]),
      mode: CHAT_MODE_DOCUMENT,
      documentId: normalizedDocumentId,
      basePath: normalizedBasePath,
    };
  }

  return null;
}

function sessionMatchesScope(session, sessionId, scope) {
  if (normalizeId(session?.id) !== sessionId || session?.mode !== scope.mode) {
    return false;
  }

  const sessionDocumentId = normalizeId(session.documentId);
  const nestedDocumentId = normalizeId(session.document?.id);

  if (scope.mode === CHAT_MODE_LIBRARY) {
    return sessionDocumentId === null && nestedDocumentId === null;
  }

  return (
    sessionDocumentId === scope.documentId &&
    (nestedDocumentId === null || nestedDocumentId === scope.documentId)
  );
}

function createRouteKey(scope, sessionId) {
  if (!scope) return null;
  return JSON.stringify([scope.key, sessionId]);
}

function createSessionUrl(basePath, sessionId) {
  const searchParams = new URLSearchParams();
  searchParams.set("session", sessionId);
  return `${basePath}?${searchParams.toString()}`;
}

function createRouteState(routeKey, overrides = {}) {
  return {
    routeKey,
    validatedSessionId: null,
    validatedSession: null,
    isValidating: false,
    error: "",
    ...overrides,
  };
}

export function useRouteChatSession({
  mode,
  documentId,
  basePath,
  enabled = true,
} = {}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasSessionQuery = searchParams.has("session");
  const requestedSessionId = normalizeId(searchParams.get("session"));
  const scope = useMemo(
    () => createRouteScope({ mode, documentId, basePath, enabled }),
    [mode, documentId, basePath, enabled],
  );
  const routeKey = createRouteKey(scope, requestedSessionId);

  const [routeState, setRouteState] = useState(() =>
    createRouteState(null),
  );
  const [retryGeneration, setRetryGeneration] = useState(0);

  const generationRef = useRef(0);
  const activeScopeRef = useRef(null);
  const requestRef = useRef(null);
  const acceptedNavigationRef = useRef(null);
  const canonicalErrorRef = useRef(null);

  const invalidateValidation = useCallback(() => {
    generationRef.current += 1;
    requestRef.current = null;
  }, []);

  const validateCandidate = useCallback(async (validationScope, sessionId) => {
    const request = {
      generation: ++generationRef.current,
      scopeKey: validationScope.key,
      sessionId,
    };
    requestRef.current = request;

    const isCurrentRequest = () =>
      requestRef.current === request &&
      generationRef.current === request.generation &&
      activeScopeRef.current?.key === request.scopeKey;

    try {
      const session = await getChatSession(sessionId);

      if (!isCurrentRequest()) {
        return { type: "stale", generation: request.generation };
      }

      return sessionMatchesScope(session, sessionId, validationScope)
        ? { type: "valid", session, generation: request.generation }
        : { type: "invalid", generation: request.generation };
    } catch (error) {
      if (!isCurrentRequest()) {
        return { type: "stale", generation: request.generation };
      }

      return INVALID_SESSION_STATUSES.has(error?.status)
        ? { type: "unavailable", generation: request.generation }
        : { type: "transient", generation: request.generation };
    } finally {
      if (requestRef.current === request) {
        requestRef.current = null;
      }
    }
  }, []);

  const resultBelongsToScope = useCallback(
    (result, validationScope) =>
      result.type !== "stale" &&
      generationRef.current === result.generation &&
      activeScopeRef.current?.key === validationScope.key,
    [],
  );

  useEffect(() => {
    invalidateValidation();
    activeScopeRef.current = scope;

    if (!scope) {
      acceptedNavigationRef.current = null;
      canonicalErrorRef.current = null;
      setRouteState(createRouteState(null));
      return () => {
        invalidateValidation();
        activeScopeRef.current = null;
      };
    }

    if (acceptedNavigationRef.current?.scopeKey !== scope.key) {
      acceptedNavigationRef.current = null;
    }
    if (canonicalErrorRef.current?.scopeKey !== scope.key) {
      canonicalErrorRef.current = null;
    }

    if (!requestedSessionId) {
      const canonicalError = canonicalErrorRef.current;
      const preservedError =
        canonicalError?.scopeKey === scope.key ? canonicalError.error : "";

      if (canonicalError?.scopeKey === scope.key) {
        canonicalErrorRef.current = null;
      }

      setRouteState(
        createRouteState(routeKey, { error: preservedError }),
      );

      if (hasSessionQuery) {
        canonicalErrorRef.current = {
          scopeKey: scope.key,
          error: UNAVAILABLE_ERROR,
        };
        setRouteState(
          createRouteState(routeKey, { error: UNAVAILABLE_ERROR }),
        );
        navigate(scope.basePath, { replace: true });
      }

      return () => {
        invalidateValidation();
        if (activeScopeRef.current === scope) {
          activeScopeRef.current = null;
        }
      };
    }

    canonicalErrorRef.current = null;
    const acceptedNavigation = acceptedNavigationRef.current;
    if (
      acceptedNavigation?.scopeKey === scope.key &&
      acceptedNavigation.sessionId === requestedSessionId
    ) {
      acceptedNavigationRef.current = null;
      setRouteState(
        createRouteState(routeKey, {
          validatedSessionId: requestedSessionId,
          validatedSession: acceptedNavigation.session,
        }),
      );

      return () => {
        invalidateValidation();
        if (activeScopeRef.current === scope) {
          activeScopeRef.current = null;
        }
      };
    }
    acceptedNavigationRef.current = null;

    setRouteState(createRouteState(routeKey, { isValidating: true }));

    void (async () => {
      const result = await validateCandidate(scope, requestedSessionId);
      if (!resultBelongsToScope(result, scope)) return;

      if (result.type === "valid") {
        setRouteState(
          createRouteState(routeKey, {
            validatedSessionId: requestedSessionId,
            validatedSession: result.session,
          }),
        );
        return;
      }

      if (result.type === "invalid" || result.type === "unavailable") {
        canonicalErrorRef.current = {
          scopeKey: scope.key,
          error: UNAVAILABLE_ERROR,
        };
        setRouteState(
          createRouteState(routeKey, { error: UNAVAILABLE_ERROR }),
        );
        navigate(scope.basePath, { replace: true });
        return;
      }

      setRouteState(
        createRouteState(routeKey, { error: VALIDATION_ERROR }),
      );
    })();

    return () => {
      invalidateValidation();
      if (activeScopeRef.current === scope) {
        activeScopeRef.current = null;
      }
    };
  }, [
    scope,
    routeKey,
    requestedSessionId,
    hasSessionQuery,
    retryGeneration,
    navigate,
    invalidateValidation,
    validateCandidate,
    resultBelongsToScope,
  ]);

  const selectSession = useCallback(
    async (candidateSessionId) => {
      const sessionId = normalizeId(candidateSessionId);
      if (!scope) return false;

      if (!sessionId) {
        setRouteState((current) =>
          current.routeKey === routeKey
            ? { ...current, isValidating: false, error: UNAVAILABLE_ERROR }
            : current,
        );
        return false;
      }

      acceptedNavigationRef.current = null;
      canonicalErrorRef.current = null;
      activeScopeRef.current = scope;
      setRouteState((current) =>
        current.routeKey === routeKey
          ? { ...current, isValidating: true, error: "" }
          : createRouteState(routeKey, { isValidating: true }),
      );

      const result = await validateCandidate(scope, sessionId);
      if (!resultBelongsToScope(result, scope)) return false;

      if (result.type === "valid") {
        const targetRouteKey = createRouteKey(scope, sessionId);
        acceptedNavigationRef.current = {
          scopeKey: scope.key,
          sessionId,
          session: result.session,
        };
        setRouteState(
          createRouteState(targetRouteKey, {
            validatedSessionId: sessionId,
            validatedSession: result.session,
          }),
        );
        navigate(createSessionUrl(scope.basePath, sessionId));
        return true;
      }

      const error =
        result.type === "invalid" || result.type === "unavailable"
          ? UNAVAILABLE_ERROR
          : VALIDATION_ERROR;
      setRouteState((current) =>
        current.routeKey === routeKey
          ? { ...current, isValidating: false, error }
          : current,
      );
      return false;
    },
    [scope, routeKey, navigate, validateCandidate, resultBelongsToScope],
  );

  const startNewChat = useCallback(() => {
    if (!scope) return false;

    invalidateValidation();
    activeScopeRef.current = scope;
    acceptedNavigationRef.current = null;
    canonicalErrorRef.current = null;
    setRouteState(createRouteState(createRouteKey(scope, null)));
    navigate(scope.basePath);
    return true;
  }, [scope, navigate, invalidateValidation]);

  const acceptCreatedSession = useCallback(
    (createdSessionId, createdSession = null) => {
      const sessionId = normalizeId(createdSessionId);
      if (!scope || !sessionId) return false;

      const acceptedSession = sessionMatchesScope(
        createdSession,
        sessionId,
        scope,
      )
        ? createdSession
        : null;

      invalidateValidation();
      activeScopeRef.current = scope;
      canonicalErrorRef.current = null;
      acceptedNavigationRef.current = {
        scopeKey: scope.key,
        sessionId,
        session: acceptedSession,
      };
      setRouteState(
        createRouteState(createRouteKey(scope, sessionId), {
          validatedSessionId: sessionId,
          validatedSession: acceptedSession,
        }),
      );
      navigate(createSessionUrl(scope.basePath, sessionId), { replace: true });
      return true;
    },
    [scope, navigate, invalidateValidation],
  );

  const replaceValidatedSession = useCallback(
    (nextSession) => {
      const sessionId = normalizeId(nextSession?.id);
      if (
        !scope ||
        !sessionId ||
        !sessionMatchesScope(nextSession, sessionId, scope) ||
        createRouteKey(scope, sessionId) !== routeKey
      ) {
        return false;
      }

      setRouteState((current) => {
        if (
          current.routeKey !== routeKey ||
          current.validatedSessionId !== sessionId
        ) {
          return current;
        }
        return { ...current, validatedSession: nextSession, error: "" };
      });
      return true;
    },
    [routeKey, scope],
  );

  const retryValidation = useCallback(() => {
    if (!scope || !requestedSessionId) return false;

    invalidateValidation();
    setRouteState(createRouteState(routeKey, { isValidating: true }));
    setRetryGeneration((current) => current + 1);
    return true;
  }, [scope, routeKey, requestedSessionId, invalidateValidation]);

  const stateMatchesRoute = Boolean(scope && routeState.routeKey === routeKey);

  return {
    requestedSessionId,
    validatedSessionId: stateMatchesRoute
      ? routeState.validatedSessionId
      : null,
    validatedSession: stateMatchesRoute ? routeState.validatedSession : null,
    isValidating: stateMatchesRoute
      ? routeState.isValidating
      : Boolean(scope && requestedSessionId),
    error: stateMatchesRoute ? routeState.error : "",
    selectSession,
    startNewChat,
    acceptCreatedSession,
    replaceValidatedSession,
    retryValidation,
  };
}
