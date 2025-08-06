import { MessageSendParams, SendMessageResponse } from "@a2a-js/sdk";

export const sendMessageToAgent = async (
  agentUrl: string,
  messageParams: MessageSendParams
): Promise<SendMessageResponse> => {
  const apiResponse: Response = await fetch("/api/send-message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agentUrl,
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
