import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDashboardOverview,
  getDashboardStatistics,
  getDashboardUploadStatistics,
} from "../../../../api/admin-dashboard.api.js";

const dateOnly = (date) => date.toISOString().slice(0, 10);

export default function useAdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 29);
    try {
      const [overviewData, statisticsData, uploadData] = await Promise.all([
        getDashboardOverview(),
        getDashboardStatistics(),
        getDashboardUploadStatistics({
          from: dateOnly(from),
          to: dateOnly(to),
          groupBy: "day",
        }),
      ]);
      setOverview(overviewData);
      setStatistics(statisticsData);
      setUploads(
        Array.isArray(uploadData) ? uploadData : uploadData?.data || [],
      );
    } catch (requestError) {
      setError(requestError.message || "Không thể tải dữ liệu tổng quan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibility = useMemo(
    () =>
      (statistics?.documents?.byVisibility || []).map((item) => ({
        name: item.visibility === "PUBLIC" ? "Công khai" : "Riêng tư",
        value: item.count,
      })),
    [statistics],
  );

  return { overview, statistics, uploads, visibility, loading, error, load };
}
