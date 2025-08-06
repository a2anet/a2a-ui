import React from "react";

import { useToastContext } from "@/contexts/ToastContext";
import { getAgentCard } from "@/lib/api/agent-card";
import { AgentCard } from "@/types/agent";

export interface UseAgentsReturn {
  agents: AgentCard[];
  activeAgent: AgentCard | null;
  addAgentByUrl: (url: string) => Promise<void>;
  setActiveAgent: (agent: AgentCard | null) => void;
}

export const useAgents = (): UseAgentsReturn => {
  const [agents, setAgents] = React.useState<AgentCard[]>([]);
  const [activeAgent, setActiveAgent] = React.useState<AgentCard | null>(null);

  const { showToast } = useToastContext();

  const addAgentByUrl = async (url: string): Promise<void> => {
    if (!url.trim()) {
      return;
    }

    try {
      const agentCard = await getAgentCard(url);

      setAgents((prev) => {
        // Check if agent already exists
        const existingIndex = prev.findIndex(
          (existingAgent) => existingAgent.url === agentCard.url
        );

        const newAgents = [...prev];

        if (existingIndex === -1) {
          // Add the new agent
          newAgents.push(agentCard);
        } else {
          // Replace the existing agent
          newAgents[existingIndex] = agentCard;
        }

        return newAgents;
      });

      setActiveAgent(agentCard);
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
