import { AgentCard, MessageSendParams, SendMessageResponse } from "@a2a-js/sdk";
import { A2AClient, createAuthenticatingFetchWithRetry } from "@a2a-js/sdk/client";
import { NextRequest, NextResponse } from "next/server";
import { BearerTokenAuthHandler } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const {
      agentCard,
      authToken,
      messageParams,
    }: { agentCard: AgentCard; authToken?: string; messageParams: MessageSendParams } =
      (await request.json()) as {
        agentCard: AgentCard;
        authToken?: string;
        messageParams: MessageSendParams;
      };

    if (!agentCard) {
      return NextResponse.json({ error: "Invalid agent card provided" }, { status: 400 });
    }

    if (!messageParams) {
      return NextResponse.json({ error: "Invalid message parameters provided" }, { status: 400 });
    }

    let client: A2AClient;

    if (authToken) {
      // Create auth handler and authenticated fetch
      const authHandler = new BearerTokenAuthHandler(authToken);
      const authenticatedFetch = createAuthenticatingFetchWithRetry(fetch, authHandler);

      // Create client with authenticated fetch
      client = new A2AClient(agentCard, {
        fetchImpl: authenticatedFetch,
      });
    } else {
      // Create client without authentication
      client = new A2AClient(agentCard);
    }
    const response: SendMessageResponse = await client.sendMessage(messageParams);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error sending message:", error);

    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
