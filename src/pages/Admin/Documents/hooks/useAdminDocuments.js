import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addKeywordException,
  approveAdminDocument,
  claimAdminDocument,
  getAdminDocument,
  getAdminDocumentPreview,
  getAdminDocuments,
  rejectAdminDocument,
  setAdminDocumentHidden,
} from "../../../../api/admin-documents.api.js";
import { getModerationKeywords } from "../../../../api/moderation-keywords.api.js";
import { updateAdminUserStatus } from "../../../../api/admin-users.api.js";
import { useToast } from "../../../../components/Toast/ToastProvider.jsx";
import {
  buildModerationKeywordIdMap,
  canBanOwnerFromModerationReview,
  canDecideDocumentModeration,
} from "../../../../lib/moderation.js";

const INITIAL_FILTERS = {
  keyword: "",
  visibility: "",
  status: "",
  aiStatus: "",
  moderationStatus: "",
  moderationFlag: "",
  moderationBucket: "",
};

const OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

export default function useAdminDocuments() {
  const toast = useToast();
  const [documents, setDocuments] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ sortBy: "", sortOrder: "" });
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [action, setAction] = useState(null);
  const [acting, setActing] = useState(false);
  const [claimedDocumentId, setClaimedDocumentId] = useState("");
  const [moderationKeywordIds, setModerationKeywordIds] = useState({});
  const [banTarget, setBanTarget] = useState(null);

  const query = useMemo(
    () => ({ ...filters, ...sort, page, limit: 20 }),
    [filters, sort, page],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminDocuments(query);
      setDocuments(response?.items || response?.data || []);
      setMeta(response?.meta || { totalItems: 0, totalPages: 0 });
    } catch (requestError) {
      setError(requestError.message || "Không thể tải danh sách tài liệu.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  function updateFilter(name, value) {
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function search(event) {
    event.preventDefault();
    updateFilter("keyword", searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }

  function toggleSort(field, firstOrder) {
    setPage(1);
    setSort((current) => {
      if (current.sortBy !== field) {
        return { sortBy: field, sortOrder: firstOrder };
      }
      if (current.sortOrder === firstOrder) {
        return {
          sortBy: field,
          sortOrder: firstOrder === "asc" ? "desc" : "asc",
        };
      }
      return { sortBy: "", sortOrder: "" };
    });
  }

  async function openDetail(document) {
    setActing(true);
    setClaimedDocumentId("");
    setModerationKeywordIds({});
    try {
      const [detailResult, keywordResult] = await Promise.allSettled([
        getAdminDocument(document.id),
        getModerationKeywords({ isActive: true }),
      ]);
      if (detailResult.status === "rejected") throw detailResult.reason;

      setDetail(detailResult.value);
      if (keywordResult.status === "fulfilled") {
        setModerationKeywordIds(
          buildModerationKeywordIdMap(keywordResult.value),
        );
      } else if (detailResult.value?.matchedKeywords?.length) {
        toast.warning(
          "Không thể tải mã từ khóa. Bạn vẫn có thể xem nội dung kiểm duyệt.",
        );
      }
    } catch (requestError) {
      toast.error(requestError.message || "Không thể tải chi tiết tài liệu.");
    } finally {
      setActing(false);
    }
  }

  function closeDetail() {
    setDetail(null);
    setClaimedDocumentId("");
    setModerationKeywordIds({});
    setBanTarget(null);
  }

  function requestOwnerBan(ownerReview) {
    if (!canBanOwnerFromModerationReview(ownerReview)) return;
    setBanTarget({
      id: ownerReview.ownerId,
      status: ownerReview.status,
      email: detail?.owner?.email || "tài khoản chủ tài liệu",
      fullName: detail?.owner?.fullName,
    });
  }

  async function banOwner(reason) {
    if (!banTarget?.id) return;
    setActing(true);
    try {
      await updateAdminUserStatus(
        banTarget.id,
        "BLOCKED",
        reason?.trim(),
      );
      const refreshed = detail?.id
        ? await getAdminDocument(detail.id)
        : null;
      if (refreshed) setDetail(refreshed);
      setBanTarget(null);
      await load();
      toast.success("Đã khóa tài khoản chủ tài liệu.");
    } catch (requestError) {
      toast.error(
        requestError.message || "Không thể khóa tài khoản chủ tài liệu.",
      );
    } finally {
      setActing(false);
    }
  }

  async function handleQueueConflict() {
    setAction(null);
    closeDetail();
    await load();
    toast.warning(
      "Tài liệu đang được người khác xem hoặc đã ra khỏi hàng chờ.",
    );
  }

  async function claimDetail(document) {
    if (!document?.id) return;
    setActing(true);
    try {
      const claimed = await claimAdminDocument(document.id);
      setDetail((current) =>
        current?.id === document.id ? { ...current, ...claimed } : current,
      );
      setClaimedDocumentId(document.id);
      toast.success("Đã nhận tài liệu để xử lý trong 30 phút.");
      await load();
    } catch (requestError) {
      if (requestError.status === 409) {
        await handleQueueConflict();
        return;
      }
      toast.error(requestError.message || "Không thể nhận xử lý tài liệu.");
    } finally {
      setActing(false);
    }
  }

  async function exceptKeyword(keywordId) {
    if (!detail?.id || !keywordId) return;
    setActing(true);
    try {
      await addKeywordException(detail.id, keywordId);
      const refreshed = await getAdminDocument(detail.id);
      setDetail(refreshed);
      if (!canDecideDocumentModeration(refreshed)) {
        setClaimedDocumentId("");
      }
      await load();
      toast.success("Đã bỏ qua từ khóa và quét lại tài liệu.");
    } catch (requestError) {
      if (requestError.status === 409) {
        toast.warning("Từ khóa đã được bỏ qua hoặc dữ liệu vừa thay đổi.");
      } else {
        toast.error(requestError.message || "Không thể bỏ qua từ khóa.");
      }
    } finally {
      setActing(false);
    }
  }

  async function openPreview(document) {
    setActing(true);
    try {
      const response = await getAdminDocumentPreview(document.id);
      const url = response?.previewUrl || response?.url;
      const extension = document.fileName?.split(".").pop()?.toLowerCase();

      if (!url) {
        throw new Error("Backend không trả về đường dẫn xem trước.");
      }

      setPreview({
        title: document.title,
        fileName: document.fileName,
        url,
        contentType: response?.contentType || document.mimeType,
        fallbackToOfficeViewer:
          response?.fallbackToOfficeViewer ??
          OFFICE_EXTENSIONS.includes(extension),
      });
    } catch (requestError) {
      toast.error(requestError.message || "Không thể xem tài liệu.");
    } finally {
      setActing(false);
    }
  }

  async function runAction(reason) {
    if (!action) return;
    setActing(true);

    try {
      if (action.type === "approve")
        await approveAdminDocument(action.document.id);
      if (action.type === "reject")
        await rejectAdminDocument(action.document.id, reason.trim());
      if (action.type === "hide")
        await setAdminDocumentHidden(action.document.id, true, reason);
      if (action.type === "unhide")
        await setAdminDocumentHidden(action.document.id, false, reason);

      toast.success(
        {
          approve: "Đã duyệt tài liệu.",
          reject: "Đã từ chối tài liệu.",
          hide: "Đã ẩn tài liệu.",
          unhide: "Đã khôi phục tài liệu.",
        }[action.type],
      );

      setAction(null);
      closeDetail();
      await load();
    } catch (requestError) {
      if (requestError.status === 409) {
        await handleQueueConflict();
        return;
      }

      toast.error(requestError.message || "Không thể cập nhật tài liệu.");
    } finally {
      setActing(false);
    }
  }

  return {
    documents,
    filters,
    searchInput,
    page,
    sort,
    meta,
    loading,
    error,
    detail,
    preview,
    action,
    acting,
    claimedDocumentId,
    moderationKeywordIds,
    banTarget,
    setSearchInput,
    setPage,
    updateFilter,
    search,
    resetFilters,
    toggleSort,
    load,
    openDetail,
    closeDetail,
    claimDetail,
    exceptKeyword,
    requestOwnerBan,
    banOwner,
    openPreview,
    setDetail,
    setPreview,
    setAction,
    setBanTarget,
    runAction,
  };
}
