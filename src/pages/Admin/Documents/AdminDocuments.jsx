import DocumentPreviewDialog from "../../User/DocumentLibrary/components/DocumentPreviewDialog.jsx";
import ModeratorLayout from "../../Moderator/Layout/ModeratorLayout.jsx";
import AdminLayout from "../Layout/AdminLayout.jsx";
import AdminDocumentDetailDialog from "./components/AdminDocumentDetailDialog.jsx";
import AdminDocumentsFilters from "./components/AdminDocumentsFilters.jsx";
import AdminDocumentsHeader from "./components/AdminDocumentsHeader.jsx";
import AdminDocumentsTable from "./components/AdminDocumentsTable.jsx";
import ModerationDialog from "./components/ModerationDialog.jsx";
import useAdminDocuments from "./hooks/useAdminDocuments.js";

export default function AdminDocuments({ role = "ADMIN" }) {
  const admin = useAdminDocuments();
  const Layout = role === "MODERATOR" ? ModeratorLayout : AdminLayout;

  return (
    <Layout>
      <AdminDocumentsHeader />
      <AdminDocumentsFilters admin={admin} />
      <AdminDocumentsTable admin={admin} />
      <AdminDocumentDetailDialog
        document={admin.detail}
        onClose={admin.closeDetail}
        onPreview={admin.openPreview}
        onAction={admin.setAction}
      />
      <ModerationDialog
        action={admin.action}
        loading={admin.acting}
        onClose={() => admin.setAction(null)}
        onConfirm={admin.runAction}
      />
      <DocumentPreviewDialog
        preview={admin.preview}
        onClose={admin.closePreview}
      />
    </Layout>
  );
}
