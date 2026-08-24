import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteCategory,
  deleteDocument,
  deleteSubject,
  getCategories,
  getDocument,
  getDocumentDownload,
  getDocumentPreview,
  getSubjects,
  updateDocument,
  updateDocumentVisibility,
} from "../../../../api/documents.api.js";
import { createDocumentAppeal } from "../../../../api/document-appeals.api.js";
import { useToast } from "../../../../components/Toast/ToastProvider.jsx";

export default function useDocumentDetails() {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subjectId: "",
    categoryId: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appealing, setAppealing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingTaxonomy, setDeletingTaxonomy] = useState(false);
  const [deleteTaxonomyError, setDeleteTaxonomyError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [item, subjectData] = await Promise.all([
        getDocument(id),
        getSubjects(),
      ]);
      setDocument(item);
      setSubjects(subjectData?.items || subjectData || []);
      setForm({
        title: item.title || "",
        description: item.description || "",
        subjectId: item.subject?.id || item.subjectId || "",
        categoryId: item.category?.id || item.categoryId || "",
      });
    } catch (requestError) {
      setError(requestError.message || "Không thể tải thông tin tài liệu.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!form.subjectId) return setCategories([]);
    getCategories(form.subjectId)
      .then((data) => setCategories(data?.items || data || []))
      .catch(() => setCategories([]));
  }, [form.subjectId]);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "subjectId" ? { categoryId: "" } : {}),
    }));
  }

  function openDeleteDialog(type, item) {
    setDeleteTaxonomyError(null);
    setDeleteTarget({ type, item });
  }

  function closeDeleteDialog() {
    if (deletingTaxonomy) return;
    setDeleteTarget(null);
    setDeleteTaxonomyError(null);
  }

  async function confirmDeleteTaxonomy() {
    if (!deleteTarget) return;
    setDeletingTaxonomy(true);
    setDeleteTaxonomyError(null);
    try {
      if (deleteTarget.type === "subject") {
        await deleteSubject(deleteTarget.item.id);
        setSubjects((current) =>
          current.filter((item) => item.id !== deleteTarget.item.id),
        );
        if (form.subjectId === deleteTarget.item.id) {
          updateField("subjectId", "");
        }
      } else {
        await deleteCategory(deleteTarget.item.id);
        setCategories((current) =>
          current.filter((item) => item.id !== deleteTarget.item.id),
        );
        if (form.categoryId === deleteTarget.item.id) {
          updateField("categoryId", "");
        }
      }
      toast.success(
        `Đã xóa ${deleteTarget.type === "subject" ? "môn học" : "danh mục"}.`,
      );
      setDeleteTarget(null);
    } catch (requestError) {
      setDeleteTaxonomyError(requestError);
    } finally {
      setDeletingTaxonomy(false);
    }
  }

  async function save(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.subjectId || !form.categoryId) {
      const message = "Vui lòng nhập đủ tiêu đề, môn học và danh mục.";
      setError(message);
      toast.warning(message);
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateDocument(id, {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
      });
      setDocument(updated);
      setSuccess("Đã cập nhật thông tin tài liệu.");
      toast.success("Đã cập nhật thông tin tài liệu.");
    } catch (saveError) {
      const message = saveError.message || "Không thể cập nhật tài liệu.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function changeVisibility(value) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateDocumentVisibility(id, value);
      setDocument(updated);
      setSuccess(
        value === "PUBLIC"
          ? "Tài liệu đã được gửi duyệt công khai."
          : "Tài liệu đã chuyển sang riêng tư.",
      );
      toast.success(
        value === "PUBLIC"
          ? "Đã gửi tài liệu để duyệt công khai."
          : "Đã chuyển tài liệu sang riêng tư.",
      );
    } catch (requestError) {
      const message = requestError.message || "Không thể đổi quyền riêng tư.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function submitAppeal(reason, description) {
    setAppealing(true);
    setError("");
    setSuccess("");

    try {
      await createDocumentAppeal(id, reason, description);
      const updated = await getDocument(id);
      setDocument(updated);
      setSuccess("Khiếu nại đã được gửi và đang chờ xem xét.");
      toast.success("Đã gửi khiếu nại tài liệu.");
      return true;
    } catch (requestError) {
      let message = requestError.message || "Không thể gửi khiếu nại.";

      if (requestError.status === 409) {
        message = "Tài liệu này đã có khiếu nại và không thể gửi thêm.";
      } else if (
        requestError.status === 400 &&
        requestError.message?.toLowerCase().includes("appeal window")
      ) {
        message = "Đã hết thời hạn gửi khiếu nại cho tài liệu này.";
      }

      setError(message);
      toast.error(message);
      return false;
    } finally {
      setAppealing(false);
    }
  }

  async function openFile(mode) {
    setError("");
    try {
      const response =
        mode === "preview"
          ? await getDocumentPreview(id)
          : await getDocumentDownload(id);
      const fileUrl =
        mode === "preview"
          ? response?.previewUrl || response?.url
          : response?.url;
      if (!fileUrl) throw new Error("Không nhận được đường dẫn tệp.");
      if (mode === "preview") {
        setPreview({
          title: document.title,
          fileName: document.fileName,
          url: fileUrl,
          contentType: response.contentType,
          fallbackToOfficeViewer: response.fallbackToOfficeViewer,
        });
      } else window.open(fileUrl, "_blank", "noopener,noreferrer");
    } catch (requestError) {
      const message = requestError.message || "Không thể mở tệp.";
      setError(message);
      toast.error(message);
    }
  }

  async function remove() {
    setDeleting(true);
    setError("");
    try {
      await deleteDocument(id);
      toast.success("Đã xóa tài liệu khỏi thư viện.");
      navigate("/documents", { replace: true });
    } catch (requestError) {
      const message = requestError.message || "Không thể xóa tài liệu.";
      setError(message);
      toast.error(message);
      setDeleting(false);
    }
  }

  return {
    document,
    subjects,
    categories,
    form,
    loading,
    saving,
    appealing,
    deleting,
    error,
    success,
    preview,
    deleteTarget,
    deletingTaxonomy,
    deleteTaxonomyError,
    updateField,
    save,
    changeVisibility,
    submitAppeal,
    openFile,
    remove,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDeleteTaxonomy,
    reload: load,
    closePreview: () => setPreview(null),
  };
}
