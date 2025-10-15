import { AgentCard } from "@a2a-js/sdk";
import { A2AClient, createAuthenticatingFetchWithRetry } from "@a2a-js/sdk/client";
import { NextRequest, NextResponse } from "next/server";
import { BearerTokenAuthHandler } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { url, authToken }: { url: string; authToken?: string } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
    }

    let client: A2AClient;

    if (authToken) {
      // Create auth handler and authenticated fetch
      const authHandler = new BearerTokenAuthHandler(authToken);
      const authenticatedFetch = createAuthenticatingFetchWithRetry(fetch, authHandler);

      // Create client with authenticated fetch
      client = await A2AClient.fromCardUrl(url, {
        fetchImpl: authenticatedFetch,
      });
    } else {
      // Create client without authentication
      client = await A2AClient.fromCardUrl(url);
    }

    const agentCard: AgentCard = await client.getAgentCard();

    return NextResponse.json({ agentCard });
  } catch (error) {
    console.error("Error fetching agent card:", error);

    return NextResponse.json({ error: "Failed to fetch agent card" }, { status: 500 });
  }
}
