import AdminLayout from "../Layout/AdminLayout.jsx";
import DeactivatePlanDialog from "./components/DeactivatePlanDialog.jsx";
import SubscriptionPlanFormDialog from "./components/SubscriptionPlanFormDialog.jsx";
import SubscriptionPlansGrid from "./components/SubscriptionPlansGrid.jsx";
import SubscriptionPlansHeader from "./components/SubscriptionPlansHeader.jsx";
import useSubscriptionPlans from "./hooks/useSubscriptionPlans.js";

export default function SubscriptionPlans() {
  const admin = useSubscriptionPlans();

  return (
    <AdminLayout>
      <SubscriptionPlansHeader onCreate={admin.openCreate} />
      <SubscriptionPlansGrid admin={admin} />
      <SubscriptionPlanFormDialog
        open={admin.formOpen}
        plan={admin.editingPlan}
        loading={admin.saving}
        onClose={() => admin.setFormOpen(false)}
        onSubmit={admin.savePlan}
      />
      <DeactivatePlanDialog
        plan={admin.deactivatingPlan}
        loading={admin.saving}
        onClose={() => admin.setDeactivatingPlan(null)}
        onConfirm={admin.deactivatePlan}
      />
    </AdminLayout>
  );
}
