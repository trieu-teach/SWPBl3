import { useCallback, useEffect, useState } from "react";
import {
  createAdminSubscriptionPlan,
  deactivateAdminSubscriptionPlan,
  getAdminSubscriptionPlans,
  updateAdminSubscriptionPlan,
} from "../../../../api/admin-subscription-plans.api.js";
import { useToast } from "../../../../components/Toast/ToastProvider.jsx";

export default function useSubscriptionPlans() {
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingPlan, setEditingPlan] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deactivatingPlan, setDeactivatingPlan] = useState(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminSubscriptionPlans(statusFilter);
      setPlans(response?.items || response?.data || response || []);
    } catch (requestError) {
      setError(requestError.message || "Không thể tải danh sách gói.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  function openCreate() {
    setEditingPlan(null);
    setFormOpen(true);
  }

  function openEdit(plan) {
    setEditingPlan(plan);
    setFormOpen(true);
  }

  async function savePlan(payload) {
    setSaving(true);

    try {
      if (editingPlan) {
        await updateAdminSubscriptionPlan(editingPlan.id, payload);
        toast.success("Đã cập nhật gói dịch vụ.");
      } else {
        await createAdminSubscriptionPlan(payload);
        toast.success("Đã tạo gói dịch vụ.");
      }

      setFormOpen(false);
      setEditingPlan(null);
      await loadPlans();
    } catch (requestError) {
      toast.error(requestError.message || "Không thể lưu gói dịch vụ.");
    } finally {
      setSaving(false);
    }
  }

  async function deactivatePlan() {
    if (!deactivatingPlan) return;
    setSaving(true);

    try {
      await deactivateAdminSubscriptionPlan(deactivatingPlan.id);
      toast.success("Đã ngừng cung cấp gói dịch vụ.");
      setDeactivatingPlan(null);
      await loadPlans();
    } catch (requestError) {
      toast.error(requestError.message || "Không thể ngừng cung cấp gói.");
    } finally {
      setSaving(false);
    }
  }

  return {
    plans,
    statusFilter,
    loading,
    saving,
    error,
    editingPlan,
    formOpen,
    deactivatingPlan,
    setStatusFilter,
    setFormOpen,
    setDeactivatingPlan,
    loadPlans,
    openCreate,
    openEdit,
    savePlan,
    deactivatePlan,
  };
}
