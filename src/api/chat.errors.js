const DEFAULT_CHAT_ERROR = "Đã xảy ra lỗi khi xử lý yêu cầu AI.";

const ERROR_PRESENTATIONS = {
  AI_CREDIT_LIMIT_EXCEEDED: {
    message: "Bạn đã dùng hết AI Credits tháng này.",
    actionLabel: "Xem bảng giá",
    actionPath: "/bang-gia",
    retryable: false,
  },
  DOCUMENT_ACCESS_REVOKED: {
    message: "Tài liệu này không còn được chia sẻ công khai.",
    retryable: false,
  },
  DOCUMENT_NOT_READY: {
    message: "Tài liệu chưa sẵn sàng để sử dụng với AI.",
    retryable: false,
  },
  REQUEST_IN_PROGRESS: {
    message: "Câu hỏi này đang được xử lý. Vui lòng chờ phản hồi.",
    retryable: false,
  },
  NOT_FOUND: {
    message: "Không tìm thấy phiên chat hoặc tài liệu.",
    resetSession: true,
    retryable: false,
  },
  FORBIDDEN: {
    message: "Bạn không có quyền truy cập nội dung này.",
    retryable: false,
  },
};

export function getChatErrorPresentation(error) {
  const configured = error?.code ? ERROR_PRESENTATIONS[error.code] : null;
  if (configured) {
    return {
      ...configured,
      code: error.code,
      details: error.details,
      message: configured.message,
    };
  }

  if (error?.status === 400) {
    return { message: "Câu hỏi chưa hợp lệ. Vui lòng kiểm tra lại nội dung.", retryable: false };
  }
  if (error?.status === 401) {
    return { message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", retryable: false };
  }
  if (error?.status === 403) {
    return { message: "Bạn không có quyền thực hiện thao tác này.", retryable: false };
  }
  if (error?.status === 404) {
    return { message: "Không tìm thấy phiên chat hoặc tài liệu.", resetSession: true, retryable: false };
  }
  if (error?.status === 409) {
    return { message: "Yêu cầu đang xung đột với trạng thái hiện tại.", retryable: false };
  }
  if (error?.status === 0) {
    return {
      message: "Không thể kết nối tới AI Study Hub. Vui lòng kiểm tra mạng và thử lại.",
      retryable: true,
    };
  }
  if (error?.status >= 500) {
    return { message: "Máy chủ AI đang gặp sự cố. Vui lòng thử lại sau.", retryable: true };
  }

  return {
    message: error?.message?.trim() || DEFAULT_CHAT_ERROR,
    retryable: typeof error?.retryable === "boolean" ? error.retryable : false,
  };
}

export function getChatErrorMessage(error) {
  return getChatErrorPresentation(error).message;
}

export function getHistoryErrorMessage(error) {
  return getChatErrorPresentation(error).message || "Không thể tải lịch sử hội thoại.";
}
