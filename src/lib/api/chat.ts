import { MessageSendParams, SendMessageResponse } from "@a2a-js/sdk";
import { AgentWithAuth } from "@/types/agent";

export const sendMessageToAgent = async (
  agent: AgentWithAuth,
  messageParams: MessageSendParams,
): Promise<SendMessageResponse> => {
  const apiResponse: Response = await fetch("/api/send-message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agentCard: agent.agentCard,
      authToken: agent.authToken,
      messageParams,
    }),
  });

  if (!apiResponse.ok) {
    const errorData = await apiResponse.json();
    throw new Error(errorData.error || "Failed to send message");
  }

  const { response }: { response: SendMessageResponse } = await apiResponse.json();

  return response;
};
