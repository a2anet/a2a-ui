import { AgentCard } from "@a2a-js/sdk";
import React from "react";

import { useToastContext } from "@/contexts/ToastContext";
import { getAgentCard } from "@/lib/api/agent-card";
import { AgentWithAuth } from "@/types/agent";

export interface UseAgentsReturn {
  agents: AgentWithAuth[];
  activeAgent: AgentWithAuth | null;
  addAgentByUrl: (url: string, authToken?: string) => Promise<void>;
  setActiveAgent: (agent: AgentWithAuth | null) => void;
}

export const useAgents = (): UseAgentsReturn => {
  const [agents, setAgents] = React.useState<AgentWithAuth[]>([]);
  const [activeAgent, setActiveAgent] = React.useState<AgentWithAuth | null>(null);

  const { showToast } = useToastContext();

  const addAgentByUrl = async (url: string, authToken?: string): Promise<void> => {
    if (!url.trim()) {
      return;
    }

    try {
      const agentCard = await getAgentCard(url, authToken);
      const agentWithAuth: AgentWithAuth = { agentCard, authToken };

      setAgents((prev) => {
        // Check if agent already exists
        const existingIndex = prev.findIndex(
          (existingAgent) => existingAgent.agentCard.url === agentCard.url,
        );

        const newAgents = [...prev];

        if (existingIndex === -1) {
          // Add the new agent
          newAgents.push(agentWithAuth);
        } else {
          // Replace the existing agent
          newAgents[existingIndex] = agentWithAuth;
        }

        return newAgents;
      });

      setActiveAgent(agentWithAuth);
      showToast(`Added ${agentCard.name}`, "success");
    } catch (error) {
      console.error("Error adding agent:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      showToast(`Failed to fetch agent card: ${errorMessage}`, "error");
      throw error; // Re-throw so the component can handle loading states
    }
  };

  return {
    agents,
    activeAgent,
    addAgentByUrl,
    setActiveAgent,
  };
};
