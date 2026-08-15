export const MAX_FILE_SIZE = 80 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
];

export function validateFile(file) {
  if (!file) return "Vui lòng chọn một tệp.";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return "Chỉ hỗ trợ PDF, Word, Excel và PowerPoint.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Dung lượng tệp không được vượt quá 80 MB.";
  }
  return "";
}

export function formatFileSize(bytes) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function getTitleFromFileName(fileName) {
  return fileName.replace(/\.[^.]+$/, "");
}
