import { NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Verify request is from same origin to prevent abuse
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const requestUrl = new URL(request.url);
    const allowedOrigin = `${requestUrl.protocol}//${requestUrl.host}`;

    if (origin && origin !== allowedOrigin) {
      return new Response(JSON.stringify({ error: "Unauthorized origin" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!origin && referer) {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      if (refererOrigin !== allowedOrigin) {
        return new Response(JSON.stringify({ error: "Unauthorized origin" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const {
      url,
      method,
      headers: requestHeaders,
      body,
      customHeaders,
    }: {
      url: string;
      method: string;
      headers: Record<string, string>;
      body?: string;
      customHeaders?: Record<string, string>;
    } = await request.json();

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build headers by merging request headers and custom headers
    const headers = new Headers(requestHeaders);
    if (customHeaders && Object.keys(customHeaders).length > 0) {
      Object.entries(customHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    // Forward the request to the target URL
    const fetchOptions: RequestInit = {
      method: method || "POST",
      headers,
    };

    if (body) {
      fetchOptions.body = body;
    }

    const response: Response = await fetch(url, fetchOptions);

    // Hop-by-hop headers that should not be forwarded (per HTTP spec)
    const hopByHopHeaders = new Set([
      "connection",
      "keep-alive",
      "proxy-authenticate",
      "proxy-authorization",
      "te",
      "trailers",
      "transfer-encoding",
      "upgrade",
    ]);

    // Check if the response is a streaming response (SSE)
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("text/event-stream")) {
      // Forward all headers except hop-by-hop headers
      const streamHeaders = new Headers();

      response.headers.forEach((value, key) => {
        if (!hopByHopHeaders.has(key.toLowerCase())) {
          streamHeaders.set(key, value);
        }
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: streamHeaders,
      });
    }

    // For non-streaming responses, read and forward the body
    const responseBody = await response.text();

    // Forward all response headers except hop-by-hop headers
    const responseHeaders = new Headers();

    response.headers.forEach((value, key) => {
      if (!hopByHopHeaders.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error in proxy route:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Proxy request failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
