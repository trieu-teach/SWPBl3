import { useEffect, useState } from "react";
import {
  createCategory,
  createSubject,
  deleteCategory,
  deleteSubject,
  getCategories,
  getSubjects,
  uploadDocument,
} from "../../../../api/documents.api.js";
import {
  getTitleFromFileName,
  validateFile,
} from "../utils/upload-validation.js";
import { useToast } from "../../../../components/Toast/ToastProvider.jsx";

const INITIAL_FORM = {
  title: "",
  description: "",
  subjectId: "",
  categoryId: "",
  visibility: "PRIVATE",
};

export default function useDocumentUpload() {
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);
  const [acceptedUploadTerms, setAcceptedUploadTerms] = useState(false);
  const [taxonomyDialog, setTaxonomyDialog] = useState(null);
  const [creatingTaxonomy, setCreatingTaxonomy] = useState(false);
  const [taxonomyError, setTaxonomyError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingTaxonomy, setDeletingTaxonomy] = useState(false);
  const [deleteTaxonomyError, setDeleteTaxonomyError] = useState(null);

  useEffect(() => {
    let active = true;
    getSubjects()
      .then((data) => active && setSubjects(data?.items || data || []))
      .catch(
        () =>
          active &&
          setOptionsError(
            "Không thể tải môn học. Hãy kiểm tra kết nối backend.",
          ),
      )
      .finally(() => active && setLoadingOptions(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setCategories([]);
    if (form.subjectId) {
      getCategories(form.subjectId)
        .then((data) => active && setCategories(data?.items || data || []))
        .catch(() => active && setOptionsError("Không thể tải danh mục."));
    }
    return () => {
      active = false;
    };
  }, [form.subjectId]);

  function updateField(name, value) {
    setSubmitError("");
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "subjectId" ? { categoryId: "" } : {}),
    }));
  }

  function updateAcceptedUploadTerms(value) {
    setSubmitError("");
    setAcceptedUploadTerms(value);
  }

  function openTaxonomyDialog(type) {
    setTaxonomyError("");
    setTaxonomyDialog(type);
  }

  function closeTaxonomyDialog() {
    if (creatingTaxonomy) return;
    setTaxonomyDialog(null);
    setTaxonomyError("");
  }

  async function submitTaxonomy(payload) {
    setCreatingTaxonomy(true);
    setTaxonomyError("");
    try {
      if (taxonomyDialog === "subject") {
        const subject = await createSubject(payload);
        setSubjects((current) => [
          ...current.filter((item) => item.id !== subject.id),
          subject,
        ]);
        updateField("subjectId", subject.id);
        toast.success("Đã tạo và chọn môn học mới.");
      } else {
        const category = await createCategory({
          ...payload,
          subjectId: form.subjectId,
        });
        setCategories((current) => [
          ...current.filter((item) => item.id !== category.id),
          category,
        ]);
        updateField("categoryId", category.id);
        toast.success("Đã tạo và chọn danh mục mới.");
      }
      setTaxonomyDialog(null);
    } catch (error) {
      setTaxonomyError(error.message || "Không thể tạo dữ liệu mới.");
    } finally {
      setCreatingTaxonomy(false);
    }
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
    } catch (error) {
      setDeleteTaxonomyError(error);
    } finally {
      setDeletingTaxonomy(false);
    }
  }

  function selectFile(nextFile) {
    setSubmitError("");
    const error = validateFile(nextFile);
    setFileError(error);
    if (error) return;
    setFile(nextFile);
    if (!form.title) updateField("title", getTitleFromFileName(nextFile.name));
  }

  function removeFile() {
    setFile(null);
    setFileError("");
    setSubmitError("");
  }

  function addTag() {
    const nextTag = tagInput.trim();
    if (!nextTag || tags.includes(nextTag) || tags.length >= 10) return;
    setTags((current) => [...current, nextTag]);
    setTagInput("");
  }

  function removeTag(tag) {
    setTags((current) => current.filter((item) => item !== tag));
  }

  async function submit(event) {
    event.preventDefault();
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      return;
    }
    if (!form.title.trim() || !form.subjectId || !form.categoryId) {
      setSubmitError("Vui lòng nhập tiêu đề, chọn môn học và danh mục.");
      return;
    }
    if (!acceptedUploadTerms) {
      const message = "Bạn cần xác nhận quyền tải lên tài liệu này.";
      setSubmitError(message);
      toast.warning(message);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    setProgress(0);
    try {
      const document = await uploadDocument(
        { file, ...form, tags },
        setProgress,
      );
      setProgress(100);
      setResult(document);
      toast.success("Tải tài liệu thành công. Hệ thống đang xử lý nội dung.");
    } catch (uploadError) {
      const message = uploadError.message || "Không thể tải tài liệu lên.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setFile(null);
    setFileError("");
    setForm(INITIAL_FORM);
    setTagInput("");
    setTags([]);
    setProgress(0);
    setSubmitError("");
    setResult(null);
    setAcceptedUploadTerms(false);
  }

  return {
    ...form,
    subjects,
    categories,
    loadingOptions,
    optionsError,
    file,
    fileError,
    tagInput,
    tags,
    submitting,
    progress,
    submitError,
    result,
    acceptedUploadTerms,
    taxonomyDialog,
    creatingTaxonomy,
    taxonomyError,
    deleteTarget,
    deletingTaxonomy,
    deleteTaxonomyError,
    updateField,
    selectFile,
    removeFile,
    setTagInput,
    addTag,
    removeTag,
    setAcceptedUploadTerms: updateAcceptedUploadTerms,
    openTaxonomyDialog,
    closeTaxonomyDialog,
    submitTaxonomy,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDeleteTaxonomy,
    submit,
    reset,
  };
}
