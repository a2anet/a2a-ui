import React from "react";

import { AgentCard } from "@/lib/a2a/types";

interface UseAgentManagerProps {
  showToast: (message: string, severity?: "error" | "warning" | "info" | "success") => void;
}

interface UseAgentManagerReturn {
  agents: AgentCard[];
  activeAgent: AgentCard | null;
  setActiveAgent: (agent: AgentCard | null) => void;
  handleAgentAdded: (agent: AgentCard) => void;
  handleAgentSelect: (agent: AgentCard) => void;
}

export const useAgentManager = ({ showToast }: UseAgentManagerProps): UseAgentManagerReturn => {
  const [agents, setAgents] = React.useState<AgentCard[]>([]);
  const [activeAgent, setActiveAgent] = React.useState<AgentCard | null>(null);
  const [lastAddedAgent, setLastAddedAgent] = React.useState<AgentCard | null>(null);

  // Show toast when a new agent is added
  React.useEffect(() => {
    if (lastAddedAgent) {
      showToast(`Added ${lastAddedAgent.name}`, "success");
      setLastAddedAgent(null);
    }
  }, [lastAddedAgent, showToast]);

  const handleAgentAdded = (agent: AgentCard): void => {
    setAgents((prev) => {
      // Check if agent already exists
      const existingIndex = prev.findIndex((existingAgent) => existingAgent.url === agent.url);

      if (existingIndex !== -1) {
        // Replace the existing agent
        const newAgents = [...prev];
        newAgents[existingIndex] = agent;

        // Update active agent if we're replacing the currently active one
        if (activeAgent?.url === agent.url) {
          setActiveAgent(agent);
        }

        return newAgents;
      } else {
        const newAgents = [...prev, agent];

        // Set as active agent if it's the first one
        if (prev.length === 0) {
          setActiveAgent(agent);
        }

        // Mark this agent as newly added to trigger toast
        setLastAddedAgent(agent);

        return newAgents;
      }
    });
  };

  const handleAgentSelect = (agent: AgentCard): void => {
    setActiveAgent(agent);
  };

  return {
    agents,
    activeAgent,
    setActiveAgent,
    handleAgentAdded,
    handleAgentSelect,
  };
};
