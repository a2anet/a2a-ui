import { AgentCard } from "@a2a-js/sdk";

/**
 * Extended agent type that includes optional authentication token
 */
export interface AgentWithAuth {
  agentCard: AgentCard;
  authToken?: string;
}
