import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getCommunityContributorProfile,
  getCommunityDocuments,
} from "../../../../api/community.api.js";
import { useAuth } from "../../../../features/auth/AuthProvider.jsx";

const EMPTY_META = {
  page: 1,
  limit: 6,
  totalItems: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
};

export default function useContributorProfile() {
  const { user } = useAuth();
  const requestIdRef = useRef(0);
  const [contributorUserId, setContributorUserId] = useState("");
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(EMPTY_META);
  const [loading, setLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const isOpen = Boolean(contributorUserId);
  const isSelf = useMemo(
    () =>
      Boolean(
        contributorUserId &&
          user?.id &&
          String(user.id) === String(contributorUserId),
      ),
    [contributorUserId, user?.id],
  );

  useEffect(() => {
    if (!contributorUserId) return undefined;

    const requestId = ++requestIdRef.current;
    const isInitialPage = page === 1;

    async function loadContributor() {
      if (isInitialPage) setLoading(true);
      else setDocumentsLoading(true);
      setError("");

      try {
        const profileRequest = isInitialPage
          ? getCommunityContributorProfile(contributorUserId)
          : Promise.resolve(null);
        const documentsRequest = getCommunityDocuments({
          ownerId: contributorUserId,
          page,
          limit: EMPTY_META.limit,
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        const [profileResponse, documentsResponse] = await Promise.all([
          profileRequest,
          documentsRequest,
        ]);

        if (requestId !== requestIdRef.current) return;

        if (profileResponse) setProfile(profileResponse?.data || profileResponse);
        const nextDocuments =
          documentsResponse?.items || documentsResponse?.data || [];
        setDocuments(nextDocuments);
        setMeta(
          documentsResponse?.meta || {
            ...EMPTY_META,
            page,
            totalItems: nextDocuments.length,
          },
        );
      } catch (requestError) {
        if (requestId !== requestIdRef.current) return;

        setError(
          requestError?.status === 404
            ? "Không tìm thấy người chia sẻ này."
            : requestError?.message ||
                "Không thể tải hồ sơ người chia sẻ.",
        );
        if (isInitialPage) setProfile(null);
        setDocuments([]);
        setMeta({ ...EMPTY_META, page });
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setDocumentsLoading(false);
        }
      }
    }

    void loadContributor();
    return undefined;
  }, [contributorUserId, page, reloadKey]);

  const openContributor = useCallback((ownerId) => {
    if (!ownerId) return;

    requestIdRef.current += 1;
    setContributorUserId(String(ownerId));
    setProfile(null);
    setDocuments([]);
    setPage(1);
    setMeta(EMPTY_META);
    setError("");
    setReloadKey((current) => current + 1);
  }, []);

  const closeContributor = useCallback(() => {
    requestIdRef.current += 1;
    setContributorUserId("");
    setProfile(null);
    setDocuments([]);
    setPage(1);
    setMeta(EMPTY_META);
    setError("");
    setLoading(false);
    setDocumentsLoading(false);
  }, []);

  const changePage = useCallback((nextPage) => {
    setPage(Math.max(1, Number(nextPage) || 1));
  }, []);

  const reload = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  return {
    contributorUserId,
    profile,
    documents,
    page,
    meta,
    loading,
    documentsLoading,
    error,
    isOpen,
    isSelf,
    openContributor,
    closeContributor,
    changePage,
    reload,
  };
}
