import { createTextMessageObject } from "@/lib/a2a/client/utils";
import { Message, MessageSendParams } from "@/types";

/**
 * Create a MessageSendParams object.
 *
 * @param text - The text of the message.
 * @param taskId - The task ID. Optional.
 * @param contextId - The context ID. Optional.
 * @returns A MessageSendParams object.
 */
export function createMessageSendParamsObject(
  text: string,
  taskId?: string,
  contextId?: string
): MessageSendParams {
  const message: Message = createTextMessageObject("user", text);

  if (taskId) {
    message.taskId = taskId;
  }

  if (contextId) {
    message.contextId = contextId;
  }

  return { message };
}
