import { AgentCard, MessageSendParams, SendMessageResponse } from "@a2a-js/sdk";
import { A2AClient } from "@a2a-js/sdk/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      agentCard,
      messageParams,
      customHeaders,
    }: {
      agentCard: AgentCard;
      messageParams: MessageSendParams;
      customHeaders?: Record<string, string>;
    } = (await request.json()) as {
      agentCard: AgentCard;
      messageParams: MessageSendParams;
      customHeaders?: Record<string, string>;
    };

    if (!agentCard) {
      return NextResponse.json({ error: "Invalid agent card provided" }, { status: 400 });
    }

    if (!messageParams) {
      return NextResponse.json({ error: "Invalid message parameters provided" }, { status: 400 });
    }

    let client: A2AClient;

    if (customHeaders && Object.keys(customHeaders).length > 0) {
      const fetchWithCustomHeaders: typeof fetch = async (url, init) => {
        const headers = new Headers(init?.headers);
        Object.entries(customHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
        const newInit = { ...init, headers };

        return fetch(url, newInit);
      };

      client = new A2AClient(agentCard, { fetchImpl: fetchWithCustomHeaders });
    } else {
      client = new A2AClient(agentCard);
    }

    const response: SendMessageResponse = await client.sendMessage(messageParams);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error sending message:", error);

    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
