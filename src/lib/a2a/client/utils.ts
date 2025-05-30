/**
 * Helper functions for the A2A client.
 */

import { Message, TextPart } from "../../../types";
import { generateUUID } from "../utils";

/**
 * Create a Message object containing a single TextPart.
 *
 * @param role - The role of the message sender (user or agent). Defaults to 'user'.
 * @param content - The text content of the message. Defaults to an empty string.
 * @returns A `Message` object with a new UUID messageId.
 */
export function createTextMessageObject(
  role: "user" | "agent" = "user",
  content: string = ""
): Message {
  const textPart: TextPart = {
    kind: "text",
    text: content,
  };

  return {
    role,
    parts: [textPart],
    messageId: generateUUID(),
    kind: "message",
  };
}
