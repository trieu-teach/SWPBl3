export const mockChatMessages = [
  {
    id: "msg-001",
    role: "user",
    content: "Tóm tắt giúp mình cách học hiệu quả trước kỳ thi.",
    createdAt: "09:12",
  },
  {
    id: "msg-002",
    role: "assistant",
    content:
      "Bạn nên bắt đầu bằng việc chia nhỏ nội dung theo mức độ ưu tiên. Hãy xác định phần nào thường xuất hiện trong đề, phần nào bạn còn yếu, sau đó phân bổ thời gian ôn tập theo thứ tự đó. Mỗi phiên học nên có mục tiêu rõ ràng, ví dụ hoàn thành một chương, làm lại một dạng bài, hoặc tự giải thích được một khái niệm.",
    createdAt: "09:13",
  },
  {
    id: "msg-003",
    role: "user",
    content:
      "Mình thường bị mất tập trung khi đọc tài liệu dài, nhất là các môn có nhiều định nghĩa và thuật ngữ. Có cách nào giúp mình ghi nhớ tốt hơn mà không phải học thuộc từng câu không?",
    createdAt: "09:16",
  },
  {
    id: "msg-004",
    role: "assistant",
    content:
      "Có. Với tài liệu nhiều định nghĩa, bạn không nên đọc tuyến tính từ đầu đến cuối quá lâu. Cách hiệu quả hơn là đọc theo vòng: vòng đầu lấy ý chính, vòng hai đánh dấu khái niệm quan trọng, vòng ba tự diễn giải bằng lời của bạn. Khi bạn tự giải thích lại một thuật ngữ mà không nhìn tài liệu, não sẽ buộc phải tổ chức lại thông tin, nhờ vậy nhớ lâu hơn so với việc chỉ đọc lặp lại.\n\nBạn cũng có thể biến mỗi định nghĩa thành một câu hỏi ngắn. Ví dụ thay vì học thuộc “khái niệm X là gì”, hãy hỏi “X dùng để giải quyết vấn đề nào?”, “X khác Y ở điểm nào?”, “trong bài tập thì dấu hiệu nhận biết X là gì?”. Kiểu câu hỏi này giúp bạn hiểu ngữ cảnh sử dụng, không chỉ nhớ mặt chữ.\n\nCuối cùng, hãy xen kẽ giữa đọc và kiểm tra nhanh. Sau khoảng 20 đến 25 phút, đóng tài liệu lại và viết ra 3 đến 5 ý bạn còn nhớ. Những chỗ bị quên chính là phần cần ôn tiếp, thay vì ôn lại toàn bộ từ đầu.",
    createdAt: "09:17",
  },
  {
    id: "msg-005",
    role: "user",
    content: "Cho mình một checklist ngắn cho buổi tự học tối nay.",
    createdAt: "09:21",
  },
  {
    id: "msg-006",
    role: "assistant",
    content:
      "Checklist gợi ý:\n- Chọn một chủ đề chính cần hoàn thành.\n- Đọc lướt mục lục hoặc heading để nắm cấu trúc.\n- Ghi lại 5 khái niệm quan trọng nhất.\n- Làm ít nhất 3 câu hỏi hoặc bài tập áp dụng.\n- Kết thúc bằng phần tự tóm tắt trong 5 phút.",
    createdAt: "09:22",
  },
  {
    id: "msg-007",
    role: "assistant",
    content:
      "Nếu bạn muốn, hãy bắt đầu bằng một câu hỏi cụ thể về tài liệu đang học. Mình có thể giúp bạn giải thích khái niệm, lập dàn ý ôn tập, hoặc biến nội dung dài thành các điểm chính dễ nhớ.",
    createdAt: "09:23",
  },
];

export const mockEmptyChatSuggestions = [
  "Tóm tắt nội dung chính của một chương học",
  "Gợi ý kế hoạch ôn tập trong 7 ngày",
  "Giải thích một khái niệm khó hiểu",
];
