import { SendMessageResponse } from "@a2a-js/sdk";
import { A2AClient } from "@a2a-js/sdk/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { agentUrl, messageParams }: { agentUrl: string; messageParams: any } =
      await request.json();

    if (!agentUrl || typeof agentUrl !== "string") {
      return NextResponse.json({ error: "Invalid agent URL provided" }, { status: 400 });
    }

    if (!messageParams) {
      return NextResponse.json({ error: "Invalid message parameters provided" }, { status: 400 });
    }

    const client: A2AClient = new A2AClient(agentUrl);
    const response: SendMessageResponse = await client.sendMessage(messageParams);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error sending message:", error);

    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
