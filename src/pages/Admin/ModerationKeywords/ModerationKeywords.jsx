import AdminLayout from "../Layout/AdminLayout.jsx";
import DeleteModerationKeywordDialog from "./components/DeleteModerationKeywordDialog.jsx";
import ModerationKeywordFormDialog from "./components/ModerationKeywordFormDialog.jsx";
import ModerationKeywordsFilters from "./components/ModerationKeywordsFilters.jsx";
import ModerationKeywordsHeader from "./components/ModerationKeywordsHeader.jsx";
import ModerationKeywordsTable from "./components/ModerationKeywordsTable.jsx";
import useModerationKeywords from "./hooks/useModerationKeywords.js";

export default function ModerationKeywords() {
  const admin = useModerationKeywords();

  return (
    <AdminLayout>
      <ModerationKeywordsHeader onCreate={admin.openCreate} />
      <ModerationKeywordsFilters admin={admin} />
      <ModerationKeywordsTable admin={admin} />
      <ModerationKeywordFormDialog
        open={admin.formOpen}
        keyword={admin.editingKeyword}
        loading={admin.saving}
        onClose={admin.closeForm}
        onSubmit={admin.saveKeyword}
      />
      <DeleteModerationKeywordDialog
        keyword={admin.deletingKeyword}
        loading={admin.saving}
        onClose={() => admin.setDeletingKeyword(null)}
        onConfirm={admin.deleteKeyword}
      />
    </AdminLayout>
  );
}
