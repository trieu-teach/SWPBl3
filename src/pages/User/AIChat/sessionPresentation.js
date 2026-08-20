export function getSessionLabel(session) {
  if (session.title?.trim()) return session.title.trim();
  const preview = session.lastMessage?.content?.trim();
  if (preview) {
    return preview.length > 52 ? `${preview.slice(0, 52)}…` : preview;
  }
  return "Cuộc trò chuyện mới";
}
