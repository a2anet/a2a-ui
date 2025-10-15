import { AgentCard } from "@a2a-js/sdk";

export const getAgentCard = async (url: string, authToken?: string): Promise<AgentCard> => {
  const response: Response = await fetch("/api/get-agent-card", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: url.trim(), authToken }),
  });

  if (!response.ok) {
    const errorData: { error: string } = await response.json();
    throw new Error(errorData.error || "Failed to fetch agent card");
  }

  const { agentCard }: { agentCard: AgentCard } = await response.json();

  return agentCard;
};
