import { v4 as uuidv4 } from "uuid";

import {
  AgentCard,
  Message,
  MessageSendParams,
  SendMessageResponse,
  Task,
  TaskState,
} from "@/types/agent";
import { ChatContext } from "@/types/chat";

// Terminal states that should reset tasks
export const terminalStates: TaskState[] = [
  "completed",
  "canceled",
  "failed",
  "rejected",
  "unknown",
];

export const sendMessageToAgent = async (
  agentUrl: string,
  messageParams: MessageSendParams
): Promise<SendMessageResponse> => {
  const apiResponse: Response = await fetch("/api/send-message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agentUrl,
      messageParams,
    }),
  });

  if (!apiResponse.ok) {
    const errorData = await apiResponse.json();
    throw new Error(errorData.error || "Failed to send message");
  }

  const { response }: { response: SendMessageResponse } = await apiResponse.json();

  return response;
};

export const createMessageSendParams = (
  messageText: string,
  contextId: string,
  taskId: string
): MessageSendParams => ({
  message: {
    contextId,
    kind: "message",
    messageId: uuidv4(),
    parts: [{ kind: "text", text: messageText }],
    role: "user",
    taskId,
  },
});

export const createTempContext = (contextId: string, agent: AgentCard): ChatContext => ({
  contextId,
  agent,
  tasks: [],
  pendingMessage: null,
  messageText: "",
  loading: true,
});

export const createTempTask = (taskId: string, contextId: string, message: Message): Task => ({
  id: taskId,
  contextId,
  status: {
    state: "submitted",
    timestamp: new Date().toISOString(),
  },
  history: [message],
  artifacts: [],
  metadata: {},
  kind: "task",
});
