import { apiClient, apiRequest } from "../lib/http";

export function getSubjects() {
  return apiRequest("/subjects");
}

export function createSubject(payload) {
  return apiRequest("/subjects", {
    method: "POST",
    body: payload,
  });
}

export function deleteSubject(id) {
  return apiRequest(`/subjects/${id}`, { method: "DELETE" });
}

export function getCategories(subjectId) {
  const query = subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : "";
  return apiRequest(`/categories${query}`);
}

export function createCategory(payload) {
  return apiRequest("/categories", {
    method: "POST",
    body: payload,
  });
}

export function deleteCategory(id) {
  return apiRequest(`/categories/${id}`, { method: "DELETE" });
}

export function uploadDocument(payload, onProgress) {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("title", payload.title.trim());
  formData.append("subjectId", payload.subjectId);
  formData.append("categoryId", payload.categoryId);
  formData.append("visibility", payload.visibility);
  if (payload.description.trim())
    formData.append("description", payload.description.trim());
  if (payload.tags.length)
    formData.append("tags", JSON.stringify(payload.tags));

  return apiClient.request({
    url: "/documents/upload",
    method: "POST",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress(event) {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
}

export function getDocuments(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return apiRequest(`/documents${query ? `?${query}` : ""}`);
}

export function getDocumentPreview(id) {
  return apiRequest(`/documents/${id}/preview`);
}

export function getDocumentDownload(id) {
  return apiRequest(`/documents/${id}/download`);
}

export function getDocument(id) {
  return apiRequest(`/documents/${id}`);
}

export function updateDocument(id, payload) {
  return apiRequest(`/documents/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function updateDocumentVisibility(id, visibility) {
  return apiRequest(`/documents/${id}/visibility`, {
    method: "PUT",
    body: { visibility },
  });
}

export function deleteDocument(id) {
  return apiRequest(`/documents/${id}`, { method: "DELETE" });
}
