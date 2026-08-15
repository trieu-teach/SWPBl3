import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getUploadStatistics,
  getMostDownloaded,
  getMostSaved,
} from "../../../../api/admin-reports.api.js";

export default function useReports() {
  const [uploadStats, setUploadStats] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(true);
  const [uploadError, setUploadError] = useState("");

  const [topDownloaded, setTopDownloaded] = useState([]);
  const [downloadedLoading, setDownloadedLoading] = useState(true);
  const [downloadedError, setDownloadedError] = useState("");

  const [topSaved, setTopSaved] = useState([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [savedError, setSavedError] = useState("");

  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [groupBy, setGroupBy] = useState("day");
  const [chartLimit, setChartLimit] = useState(10);

  const uploadQuery = useMemo(
    () => ({
      from: dateRange.from || undefined,
      to: dateRange.to || undefined,
      groupBy,
    }),
    [dateRange, groupBy],
  );

  const reportQuery = useMemo(
    () => ({
      fromDate: dateRange.from || undefined,
      toDate: dateRange.to || undefined,
      limit: chartLimit,
    }),
    [dateRange, chartLimit],
  );

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
      const response = await getMostDownloaded(reportQuery);
      const data = response?.data || response?.items || response || [];
      setTopDownloaded(data);
    } catch (err) {
      setDownloadedError(err.message || "Không thể tải top tải xuống.");
    } finally {
      setDownloadedLoading(false);
    }
  }, [reportQuery]);

  const loadTopSaved = useCallback(async () => {
    setSavedLoading(true);
    setSavedError("");
    try {
      const response = await getMostSaved(reportQuery);
      const data = response?.data || response?.items || response || [];
      setTopSaved(data);
    } catch (err) {
      setSavedError(err.message || "Không thể tải top được lưu.");
    } finally {
      setSavedLoading(false);
    }
  }, [reportQuery]);

  useEffect(() => {
    loadUploadStats();
  }, [loadUploadStats]);

  useEffect(() => {
    loadTopDownloaded();
  }, [loadTopDownloaded]);

  useEffect(() => {
    loadTopSaved();
  }, [loadTopSaved]);

  function updateDateRange(field, value) {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  }

  function setPresetRange(from, to) {
    setDateRange({ from: from || "", to: to || "" });
  }

  return {
    // Upload stats
    uploadStats,
    uploadLoading,
    uploadError,
    // Top downloaded
    topDownloaded,
    downloadedLoading,
    downloadedError,
    // Top saved
    topSaved,
    savedLoading,
    savedError,
    // Filters
    dateRange,
    groupBy,
    chartLimit,
    // Actions
    updateDateRange,
    setGroupBy,
    setChartLimit,
    setPresetRange,
    reload: () => {
      loadUploadStats();
      loadTopDownloaded();
      loadTopSaved();
    },
  };
}
