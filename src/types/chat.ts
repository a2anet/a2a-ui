import { AgentCard, Message, Task } from "@a2a-js/sdk";

export interface ChatContext {
  contextId: string;
  agent: AgentCard;
  tasks: Task[];
  loading: boolean;
  messageText: string;
  pendingMessage: Message | null;
}
