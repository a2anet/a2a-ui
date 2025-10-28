import { AgentCard, Message, Task } from "@a2a-js/sdk";

export interface ChatContext {
  contextId: string;
  agent: AgentCard;
  messagesAndTasks: (Message | Task)[];
  loading: boolean;
  messageText: string;
  pendingMessage: Message | null;
}
