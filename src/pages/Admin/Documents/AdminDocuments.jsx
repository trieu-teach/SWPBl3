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
      <AdminDocumentsHeader admin={admin} />
      <AdminDocumentsFilters admin={admin} />
      <AdminDocumentsTable admin={admin} />
      <AdminDocumentDetailDialog
        document={admin.detail}
        onClose={() => admin.setDetail(null)}
        onPreview={admin.openPreview}
        onAction={admin.setAction}
        onClaim={admin.claimDetail}
        claimed={admin.claimedDocumentId === admin.detail?.id}
        loading={admin.acting}
        keywordCatalog={admin.moderationKeywords}
        onAddKeywordException={admin.createKeywordException}
        onBlockOwner={admin.blockDocumentOwner}
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
