import { AgentCard, Message, Task } from "@/types/agent";

export interface ChatContext {
  contextId: string;
  agent: AgentCard;
  tasks: Task[];
  pendingMessage: Message | null;
  messageText: string;
  loading: boolean;
}
