import { apiClient, apiRequest } from "../lib/http";

export function getSubjects() {
  return apiRequest("/subjects");
}

export function getCategories(subjectId) {
  const query = subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : "";
  return apiRequest(`/categories${query}`);
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
