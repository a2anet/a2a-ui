import { AgentCard } from "@a2a-js/sdk";
import { A2AClient } from "@a2a-js/sdk/client";
import React from "react";

import { useToastContext } from "@/contexts/ToastContext";
import { createA2AProxyFetch } from "@/lib/api/proxy-fetch";

export interface UseAgentsReturn {
  agents: AgentCard[];
  activeAgent: AgentCard | null;
  addAgentByUrl: (url: string) => Promise<void>;
  setActiveAgent: (agent: AgentCard | null) => void;
}

interface UseAgentsParams {
  customHeaders?: Record<string, string>;
}

export const useAgents = (params?: UseAgentsParams): UseAgentsReturn => {
  const [agents, setAgents] = React.useState<AgentCard[]>([]);
  const [activeAgent, setActiveAgent] = React.useState<AgentCard | null>(null);

  const { showToast } = useToastContext();

  const addAgentByUrl = async (url: string, startupLoad: boolean = false): Promise<void> => {
    if (!url.trim()) {
      return;
    }

    try {
      const A2AProxyFetch: typeof fetch = createA2AProxyFetch(params?.customHeaders);
      const client: A2AClient = await A2AClient.fromCardUrl(url.trim(), {
        fetchImpl: A2AProxyFetch,
      });
      const agentCard: AgentCard = await client.getAgentCard();

      setAgents((prev) => {
        const newAgents = [...prev];

        // Add the new agent
        newAgents.push(agentCard);

        return newAgents;
      });

      if (!startupLoad) {
        // Set active agent and show toast when user adds agent
        setActiveAgent(agentCard);
        showToast(`Added ${agentCard.name}`, "success");
      }
    } catch (error) {
      if (startupLoad) {
        // Don't show startup load errors
        return;
      }

      console.error("Error adding agent:", error);
      const errorMessage: string =
        error instanceof Error ? error.message : "Unknown error occurred";
      showToast(`Failed to fetch agent card: ${errorMessage}`, "error");
      throw error; // Re-throw so the component can handle loading states
    }
  };

  // Load Agent Cards from URL on startup
  React.useEffect(() => {
    const agentCardsUrl: string | undefined = process.env.NEXT_PUBLIC_DEFAULT_AGENT_CARDS_URL;

    if (!agentCardsUrl) {
      return;
    }

    const A2AProxyFetch: typeof fetch = createA2AProxyFetch();

    A2AProxyFetch(agentCardsUrl)
      .then((response: Response) => response.json())
      .then((urls: string[]) => {
        for (const url of urls) {
          addAgentByUrl(url, true);
        }
      });
  }, []);

  return {
    agents,
    activeAgent,
    addAgentByUrl,
    setActiveAgent,
  };
};
