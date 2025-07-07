import { AgentCard, Message, Task } from "@/types/agent";

export interface ChatContext {
  contextId: string;
  agent: AgentCard;
  tasks: Task[];
  loading: boolean;
  messageText: string;
  pendingMessage: Message | null;
}
