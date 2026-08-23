export function parseEventChunk(eventChunk) {
  const lines = eventChunk.split(/\r?\n/);
  let eventType = "message";
  const dataLines = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventType = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).replace(/^ /, ""));
    }
  }

  if (dataLines.length === 0) return null;
  const eventData = dataLines.join("\n");
  try {
    return { type: eventType, data: JSON.parse(eventData) };
  } catch {
    return { type: eventType, data: eventData };
  }
}

export function extractEvents(buffer) {
  const events = [];
  let remaining = buffer;
  let boundary = remaining.match(/\r?\n\r?\n/);

  while (boundary?.index !== undefined) {
    const eventChunk = remaining.slice(0, boundary.index);
    remaining = remaining.slice(boundary.index + boundary[0].length);
    const event = parseEventChunk(eventChunk);
    if (event) events.push(event);
    boundary = remaining.match(/\r?\n\r?\n/);
  }

  return { events, remaining };
}

export function isValidDoneEvent(data) {
  return (
    data !== null &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    typeof data.answer === "string" &&
    typeof data.sessionId === "string" &&
    data.sessionId.trim().length > 0 &&
    typeof data.messageId === "string" &&
    data.messageId.trim().length > 0
  );
}
