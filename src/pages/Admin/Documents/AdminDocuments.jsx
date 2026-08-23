import DocumentPreviewDialog from "../../User/DocumentLibrary/components/DocumentPreviewDialog.jsx";
import AdminLayout from "../Layout/AdminLayout.jsx";
import AdminDocumentDetailDialog from "./components/AdminDocumentDetailDialog.jsx";
import AdminDocumentsFilters from "./components/AdminDocumentsFilters.jsx";
import AdminDocumentsHeader from "./components/AdminDocumentsHeader.jsx";
import AdminDocumentsTable from "./components/AdminDocumentsTable.jsx";
import ModerationDialog from "./components/ModerationDialog.jsx";
import useAdminDocuments from "./hooks/useAdminDocuments.js";

export default function AdminDocuments() {
  const admin = useAdminDocuments();

  return (
    <AdminLayout>
      <AdminDocumentsHeader />
      <AdminDocumentsFilters admin={admin} />
      <AdminDocumentsTable admin={admin} />
      <AdminDocumentDetailDialog
        document={admin.detail}
        acting={admin.acting}
        claimed={admin.claimedDocumentId === admin.detail?.id}
        moderationKeywordIds={admin.moderationKeywordIds}
        onClose={admin.closeDetail}
        onPreview={admin.openPreview}
        onAction={admin.setAction}
        onClaim={admin.claimDetail}
        onExceptKeyword={admin.exceptKeyword}
      />
      <ModerationDialog
        action={admin.action}
        loading={admin.acting}
        onClose={() => admin.setAction(null)}
        onConfirm={admin.runAction}
      />
      <DocumentPreviewDialog
        preview={admin.preview}
        onClose={() => admin.setPreview(null)}
      />
    </AdminLayout>
  );
}
