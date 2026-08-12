import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteDocument,
  getCategories,
  getDocument,
  getDocumentDownload,
  getDocumentPreview,
  getSubjects,
  updateDocument,
  updateDocumentVisibility,
} from "../../../../api/documents.api.js";

export default function useDocumentDetails() {
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
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState(null);

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

  async function save(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.subjectId || !form.categoryId) {
      return setError("Vui lòng nhập đủ tiêu đề, môn học và danh mục.");
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
    } catch (saveError) {
      setError(saveError.message || "Không thể cập nhật tài liệu.");
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
    } catch (requestError) {
      setError(requestError.message || "Không thể đổi quyền riêng tư.");
    } finally {
      setSaving(false);
    }
  }

  async function openFile(mode) {
    setError("");
    try {
      const response =
        mode === "preview"
          ? await getDocumentPreview(id)
          : await getDocumentDownload(id);
      if (!response?.url) throw new Error("Không nhận được đường dẫn tệp.");
      if (mode === "preview") {
        setPreview({
          title: document.title,
          fileName: document.fileName,
          url: response.url,
        });
      } else window.open(response.url, "_blank", "noopener,noreferrer");
    } catch (requestError) {
      setError(requestError.message || "Không thể mở tệp.");
    }
  }

  async function remove() {
    setDeleting(true);
    setError("");
    try {
      await deleteDocument(id);
      navigate("/documents", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Không thể xóa tài liệu.");
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
    deleting,
    error,
    success,
    preview,
    updateField,
    save,
    changeVisibility,
    openFile,
    remove,
    reload: load,
    closePreview: () => setPreview(null),
  };
}
