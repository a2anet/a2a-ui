import { AgentCard } from "@a2a-js/sdk";
import { A2AClient } from "@a2a-js/sdk/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url }: { url: string } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
    }

    const client: A2AClient = await A2AClient.fromCardUrl(url);
    const agentCard: AgentCard = await client.getAgentCard();

    return NextResponse.json({ agentCard });
  } catch (error) {
    console.error("Error fetching agent card:", error);

    return NextResponse.json({ error: "Failed to fetch agent card" }, { status: 500 });
  }
}
