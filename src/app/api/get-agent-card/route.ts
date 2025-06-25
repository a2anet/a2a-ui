import { A2AClient, AgentCard } from "@a2a-js/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url }: { url: string } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
    }

    // Fetch the agent card using the A2A SDK on the server side
    const client: A2AClient = new A2AClient(url);
    const agentCard: AgentCard = await client.getAgentCard();

    return NextResponse.json({ agentCard });
  } catch (error) {
    console.error("Error fetching agent card:", error);

    return NextResponse.json({ error: "Failed to fetch agent card" }, { status: 500 });
  }
}
