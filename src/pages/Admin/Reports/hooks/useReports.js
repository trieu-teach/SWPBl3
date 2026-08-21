import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getUploadStatistics,
  getMostDownloaded,
  getMostSaved,
} from "../../../../api/admin-reports.api.js";
import { getAdminSubscriptionStats } from "../../../../api/admin-subscriptions.api.js";
import { formatDateShort } from "../../utils/admin-formatters.js";

function getDefaultDateRange() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  return {
    from: thirtyDaysAgo.toISOString().split("T")[0],
    to: today.toISOString().split("T")[0],
  };
}

export default function useReports() {
  // === UPLOAD STATS STATE ===
  const [uploadStats, setUploadStats] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(true);
  const [uploadError, setUploadError] = useState("");
  const [uploadRange, setUploadRange] = useState(getDefaultDateRange);
  const [uploadGroupBy, setUploadGroupBy] = useState("day");

  // === TOP DOWNLOADED STATE ===
  const [topDownloaded, setTopDownloaded] = useState([]);
  const [downloadedLoading, setDownloadedLoading] = useState(true);
  const [downloadedError, setDownloadedError] = useState("");
  const [downloadedRange, setDownloadedRange] = useState(getDefaultDateRange);
  const [downloadedLimit, setDownloadedLimit] = useState(10);

  // === TOP SAVED STATE ===
  const [topSaved, setTopSaved] = useState([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [savedError, setSavedError] = useState("");
  const [savedRange, setSavedRange] = useState(getDefaultDateRange);
  const [savedLimit, setSavedLimit] = useState(10);

  // === SUBSCRIPTION STATS STATE ===
  const [subscriptionStats, setSubscriptionStats] = useState({ plans: [], totals: {} });
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState("");
  const [statsRange, setStatsRange] = useState(getDefaultDateRange);

  // === DRAFT STATE (for filter UI) ===
  const [draftRange, setDraftRange] = useState(getDefaultDateRange);
  const [draftGroupBy, setDraftGroupBy] = useState("day");
  const [draftLimit, setDraftLimit] = useState(10);
  const [selectedTarget, setSelectedTarget] = useState("all");

  // === QUERY BUILDERS ===
  const uploadQuery = useMemo(
    () => ({
      from: uploadRange.from || undefined,
      to: uploadRange.to || undefined,
      groupBy: uploadGroupBy,
    }),
    [uploadRange, uploadGroupBy],
  );

  const downloadedQuery = useMemo(
    () => ({
      fromDate: downloadedRange.from || undefined,
      toDate: downloadedRange.to || undefined,
      limit: downloadedLimit,
    }),
    [downloadedRange, downloadedLimit],
  );

  const savedQuery = useMemo(
    () => ({
      fromDate: savedRange.from || undefined,
      toDate: savedRange.to || undefined,
      limit: savedLimit,
    }),
    [savedRange, savedLimit],
  );

  const statsQuery = useMemo(
    () => ({
      from: statsRange.from || undefined,
      to: statsRange.to || undefined,
    }),
    [statsRange],
  );

  // === LOADERS ===
  const loadUploadStats = useCallback(async () => {
    setUploadLoading(true);
    setUploadError("");
    try {
      const response = await getUploadStatistics(uploadQuery);
      const data = response?.data || response?.items || response || [];
      setUploadStats(data);
    } catch (err) {
      setUploadError(err.message || "Không thể tải thống kê upload.");
    } finally {
      setUploadLoading(false);
    }
  }, [uploadQuery]);

  const loadTopDownloaded = useCallback(async () => {
    setDownloadedLoading(true);
    setDownloadedError("");
    try {
      const response = await getMostDownloaded(downloadedQuery);
      const data = response?.data || response?.items || response || [];
      setTopDownloaded(data);
    } catch (err) {
      setDownloadedError(err.message || "Không thể tải top tải xuống.");
    } finally {
      setDownloadedLoading(false);
    }
  }, [downloadedQuery]);

  const loadTopSaved = useCallback(async () => {
    setSavedLoading(true);
    setSavedError("");
    try {
      const response = await getMostSaved(savedQuery);
      const data = response?.data || response?.items || response || [];
      setTopSaved(data);
    } catch (err) {
      setSavedError(err.message || "Không thể tải top được lưu.");
    } finally {
      setSavedLoading(false);
    }
  }, [savedQuery]);

  const loadSubscriptionStats = useCallback(async () => {
    setSubscriptionLoading(true);
    setSubscriptionError("");
    try {
      const response = await getAdminSubscriptionStats(statsQuery);
      const data = response?.data || { plans: [], totals: {} };
      setSubscriptionStats(data);
    } catch (err) {
      setSubscriptionError(err.message || "Không thể tải thống kê subscription.");
    } finally {
      setSubscriptionLoading(false);
    }
  }, [statsQuery]);

  // === INITIAL LOAD ===
  useEffect(() => {
    loadUploadStats();
  }, [loadUploadStats]);

  useEffect(() => {
    loadTopDownloaded();
  }, [loadTopDownloaded]);

  useEffect(() => {
    loadTopSaved();
  }, [loadTopSaved]);

  useEffect(() => {
    loadSubscriptionStats();
  }, [loadSubscriptionStats]);

  // === FILTER ACTIONS (Auto-apply) ===
  
  function updateDraftRange(field, value) {
    setDraftRange((prev) => ({ ...prev, [field]: value }));
    applyFilter(field === "from" || field === "to" ? "date" : "all");
  }

  function setDraftPresetRange(from, to) {
    setDraftRange({ from: from || "", to: to || "" });
    applyFilter("preset");
  }

  function applyFilter(trigger = "manual") {
    switch (selectedTarget) {
      case "all":
        setUploadRange(draftRange);
        setUploadGroupBy(draftGroupBy);
        setDownloadedRange(draftRange);
        setDownloadedLimit(draftLimit);
        setSavedRange(draftRange);
        setSavedLimit(draftLimit);
        setStatsRange(draftRange);
        break;
      case "upload":
        setUploadRange(draftRange);
        setUploadGroupBy(draftGroupBy);
        break;
      case "downloaded":
        setDownloadedRange(draftRange);
        setDownloadedLimit(draftLimit);
        break;
      case "saved":
        setSavedRange(draftRange);
        setSavedLimit(draftLimit);
        break;
      case "stats":
        setStatsRange(draftRange);
        break;
      default:
        break;
    }
  }

  function handleTargetChange(target) {
    setSelectedTarget(target);
    applyFilter("target");
  }

  function handleGroupByChange(value) {
    setDraftGroupBy(value);
    if (selectedTarget === "all" || selectedTarget === "upload") {
      setUploadGroupBy(value);
    }
  }

  function handleLimitChange(value) {
    setDraftLimit(value);
    if (selectedTarget === "all") {
      setDownloadedLimit(value);
      setSavedLimit(value);
    } else if (selectedTarget === "downloaded") {
      setDownloadedLimit(value);
    } else if (selectedTarget === "saved") {
      setSavedLimit(value);
    }
  }

  function reloadAll() {
    loadUploadStats();
    loadTopDownloaded();
    loadTopSaved();
    loadSubscriptionStats();
  }

  // === HELPERS ===
  function getDateCaption(range) {
    if (!range.from && !range.to) return "Tất cả thời gian";
    if (!range.from) return `Đến ${formatDateShort(range.to)}`;
    if (!range.to) return `Từ ${formatDateShort(range.from)}`;
    return `${formatDateShort(range.from)} – ${formatDateShort(range.to)}`;
  }

  return {
    // === DATA ===
    uploadStats,
    uploadLoading,
    uploadError,
    topDownloaded,
    downloadedLoading,
    downloadedError,
    topSaved,
    savedLoading,
    savedError,
    subscriptionStats,
    subscriptionLoading,
    subscriptionError,

    // === RANGES (for captions) ===
    uploadRange,
    downloadedRange,
    savedRange,
    statsRange,

    // === DRAFT STATE ===
    draftRange,
    draftGroupBy,
    draftLimit,
    selectedTarget,

    // === DRAFT ACTIONS ===
    updateDraftRange,
    setDraftPresetRange,
    setDraftGroupBy: handleGroupByChange,
    setDraftLimit: handleLimitChange,
    setSelectedTarget: handleTargetChange,
    applyFilter,
    getDateCaption,

    // === RELOAD ===
    reloadAll,
  };
}
