import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getUploadStatistics,
  getMostDownloaded,
  getMostSaved,
  getHeaviestDocuments,
  getTopContributors,
  getTopUploaders,
  getTopRatedReport,
  getMostUsefulDocuments,
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

  // === HEAVIEST DOCUMENTS STATE ===
  const [heaviestDocuments, setHeaviestDocuments] = useState([]);
  const [heaviestLoading, setHeaviestLoading] = useState(true);
  const [heaviestError, setHeaviestError] = useState("");
  const [heaviestRange, setHeaviestRange] = useState(getDefaultDateRange);
  const [heaviestLimit, setHeaviestLimit] = useState(10);

  // === TOP CONTRIBUTORS STATE ===
  const [topContributors, setTopContributors] = useState([]);
  const [contributorsLoading, setContributorsLoading] = useState(true);
  const [contributorsError, setContributorsError] = useState("");
  const [contributorsRange, setContributorsRange] = useState(getDefaultDateRange);
  const [contributorsLimit, setContributorsLimit] = useState(10);

  // === TOP UPLOADERS STATE ===
  const [topUploaders, setTopUploaders] = useState([]);
  const [uploadersLoading, setUploadersLoading] = useState(true);
  const [uploadersError, setUploadersError] = useState("");
  const [uploadersRange, setUploadersRange] = useState(getDefaultDateRange);
  const [uploadersLimit, setUploadersLimit] = useState(10);

  // === TOP RATED STATE ===
  const [topRated, setTopRated] = useState([]);
  const [topRatedLoading, setTopRatedLoading] = useState(true);
  const [topRatedError, setTopRatedError] = useState("");
  const [topRatedRange, setTopRatedRange] = useState(getDefaultDateRange);
  const [topRatedLimit, setTopRatedLimit] = useState(10);

  // === MOST USEFUL STATE ===
  const [mostUseful, setMostUseful] = useState([]);
  const [mostUsefulLoading, setMostUsefulLoading] = useState(true);
  const [mostUsefulError, setMostUsefulError] = useState("");
  const [mostUsefulRange, setMostUsefulRange] = useState(getDefaultDateRange);
  const [mostUsefulLimit, setMostUsefulLimit] = useState(10);

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

  const heaviestQuery = useMemo(
    () => ({
      from: heaviestRange.from || undefined,
      to: heaviestRange.to || undefined,
      limit: heaviestLimit,
    }),
    [heaviestRange, heaviestLimit],
  );

  const contributorsQuery = useMemo(
    () => ({
      from: contributorsRange.from || undefined,
      to: contributorsRange.to || undefined,
      limit: contributorsLimit,
    }),
    [contributorsRange, contributorsLimit],
  );

  const uploadersQuery = useMemo(
    () => ({
      from: uploadersRange.from || undefined,
      to: uploadersRange.to || undefined,
      limit: uploadersLimit,
    }),
    [uploadersRange, uploadersLimit],
  );

  const topRatedQuery = useMemo(
    () => ({
      from: topRatedRange.from || undefined,
      to: topRatedRange.to || undefined,
      limit: topRatedLimit,
    }),
    [topRatedRange, topRatedLimit],
  );

  const mostUsefulQuery = useMemo(
    () => ({
      from: mostUsefulRange.from || undefined,
      to: mostUsefulRange.to || undefined,
      limit: mostUsefulLimit,
    }),
    [mostUsefulRange, mostUsefulLimit],
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
      // Interceptor unwraps response: { success: true, data: {...} } → {...}
      const data = response && typeof response === "object" && "plans" in response
        ? response
        : (response?.data || { plans: [], totals: {} });
      setSubscriptionStats(data);
    } catch (err) {
      setSubscriptionError(err.message || "Không thể tải thống kê subscription.");
    } finally {
      setSubscriptionLoading(false);
    }
  }, [statsQuery]);

  const loadHeaviestDocuments = useCallback(async () => {
    setHeaviestLoading(true);
    setHeaviestError("");
    try {
      const response = await getHeaviestDocuments(heaviestQuery);
      const data = response?.data || response?.items || response || [];
      setHeaviestDocuments(data);
    } catch (err) {
      setHeaviestError(err.message || "Không thể tải tài liệu nặng nhất.");
    } finally {
      setHeaviestLoading(false);
    }
  }, [heaviestQuery]);

  const loadTopContributors = useCallback(async () => {
    setContributorsLoading(true);
    setContributorsError("");
    try {
      const response = await getTopContributors(contributorsQuery);
      const data = response?.data || response?.items || response || [];
      setTopContributors(data);
    } catch (err) {
      setContributorsError(err.message || "Không thể tải top người đóng góp.");
    } finally {
      setContributorsLoading(false);
    }
  }, [contributorsQuery]);

  const loadTopUploaders = useCallback(async () => {
    setUploadersLoading(true);
    setUploadersError("");
    try {
      const response = await getTopUploaders(uploadersQuery);
      const data = response?.data || response?.items || response || [];
      setTopUploaders(data);
    } catch (err) {
      setUploadersError(err.message || "Không thể tải top người tải lên.");
    } finally {
      setUploadersLoading(false);
    }
  }, [uploadersQuery]);

  const loadTopRated = useCallback(async () => {
    setTopRatedLoading(true);
    setTopRatedError("");
    try {
      const response = await getTopRatedReport(topRatedQuery);
      const data = response?.data || response?.items || response || [];
      setTopRated(data);
    } catch (err) {
      setTopRatedError(err.message || "Không thể tải top đánh giá cao.");
    } finally {
      setTopRatedLoading(false);
    }
  }, [topRatedQuery]);

  const loadMostUseful = useCallback(async () => {
    setMostUsefulLoading(true);
    setMostUsefulError("");
    try {
      const response = await getMostUsefulDocuments(mostUsefulQuery);
      const data = response?.data || response?.items || response || [];
      setMostUseful(data);
    } catch (err) {
      setMostUsefulError(err.message || "Không thể tải top hữu ích nhất.");
    } finally {
      setMostUsefulLoading(false);
    }
  }, [mostUsefulQuery]);

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

  useEffect(() => {
    loadHeaviestDocuments();
  }, [loadHeaviestDocuments]);

  useEffect(() => {
    loadTopContributors();
  }, [loadTopContributors]);

  useEffect(() => {
    loadTopUploaders();
  }, [loadTopUploaders]);

  useEffect(() => {
    loadTopRated();
  }, [loadTopRated]);

  useEffect(() => {
    loadMostUseful();
  }, [loadMostUseful]);

  // === FILTER ACTIONS (Auto-apply) ===
  
  function updateDraftRange(field, value) {
    const newRange = { ...draftRange, [field]: value };
    setDraftRange(newRange);
    applyFilter(newRange);
  }

  function setDraftPresetRange(from, to) {
    const newRange = { from: from || "", to: to || "" };
    setDraftRange(newRange);
    applyFilter(newRange);
  }

  function applyFilter(newRange = draftRange) {
    switch (selectedTarget) {
      case "all":
        setUploadRange(newRange);
        setUploadGroupBy(draftGroupBy);
        setDownloadedRange(newRange);
        setDownloadedLimit(draftLimit);
        setSavedRange(newRange);
        setSavedLimit(draftLimit);
        setStatsRange(newRange);
        setHeaviestRange(newRange);
        setHeaviestLimit(draftLimit);
        setContributorsRange(newRange);
        setContributorsLimit(draftLimit);
        setUploadersRange(newRange);
        setUploadersLimit(draftLimit);
        setTopRatedRange(newRange);
        setTopRatedLimit(draftLimit);
        setMostUsefulRange(newRange);
        setMostUsefulLimit(draftLimit);
        break;
      case "upload":
        setUploadRange(newRange);
        setUploadGroupBy(draftGroupBy);
        break;
      case "downloaded":
        setDownloadedRange(newRange);
        setDownloadedLimit(draftLimit);
        break;
      case "saved":
        setSavedRange(newRange);
        setSavedLimit(draftLimit);
        break;
      case "stats":
        setStatsRange(newRange);
        break;
      case "heaviest":
        setHeaviestRange(newRange);
        setHeaviestLimit(draftLimit);
        break;
      case "contributors":
        setContributorsRange(newRange);
        setContributorsLimit(draftLimit);
        break;
      case "uploaders":
        setUploadersRange(newRange);
        setUploadersLimit(draftLimit);
        break;
      case "topRated":
        setTopRatedRange(newRange);
        setTopRatedLimit(draftLimit);
        break;
      case "mostUseful":
        setMostUsefulRange(newRange);
        setMostUsefulLimit(draftLimit);
        break;
      default:
        break;
    }
  }

  function handleTargetChange(target) {
    setSelectedTarget(target);
    applyFilter(draftRange);
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
      setHeaviestLimit(value);
      setContributorsLimit(value);
      setUploadersLimit(value);
      setTopRatedLimit(value);
      setMostUsefulLimit(value);
    } else if (selectedTarget === "downloaded") {
      setDownloadedLimit(value);
    } else if (selectedTarget === "saved") {
      setSavedLimit(value);
    } else if (selectedTarget === "heaviest") {
      setHeaviestLimit(value);
    } else if (selectedTarget === "contributors") {
      setContributorsLimit(value);
    } else if (selectedTarget === "uploaders") {
      setUploadersLimit(value);
    } else if (selectedTarget === "topRated") {
      setTopRatedLimit(value);
    } else if (selectedTarget === "mostUseful") {
      setMostUsefulLimit(value);
    }
  }

  function reloadAll() {
    loadUploadStats();
    loadTopDownloaded();
    loadTopSaved();
    loadSubscriptionStats();
    loadHeaviestDocuments();
    loadTopContributors();
    loadTopUploaders();
    loadTopRated();
    loadMostUseful();
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
    heaviestDocuments,
    heaviestLoading,
    heaviestError,
    topContributors,
    contributorsLoading,
    contributorsError,
    topUploaders,
    uploadersLoading,
    uploadersError,
    topRated,
    topRatedLoading,
    topRatedError,
    mostUseful,
    mostUsefulLoading,
    mostUsefulError,

    // === RANGES (for captions) ===
    topRatedRange,
    mostUsefulRange,

    // === DRAFT STATE ===
    uploadRange,
    downloadedRange,
    savedRange,
    statsRange,
    heaviestRange,
    contributorsRange,
    uploadersRange,

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
