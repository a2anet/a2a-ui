/**
 * Creates an A2A protocol proxy fetch function that routes all requests through our Next.js proxy
 * endpoint. This allows us to inject custom headers while using the A2AClient directly on the
 * client side.
 *
 * @param customHeaders - Optional headers to inject into all proxied requests (e.g., authentication)
 * @returns A fetch-compatible function that routes through /api/proxy
 */
export const createA2AProxyFetch = (customHeaders?: Record<string, string>): typeof fetch => {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Extract URL from input
    const url: string =
      typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    // Extract headers from init
    const headers: Record<string, string> = {};
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, init.headers);
      }
    }

    // Extract body
    let body: string | undefined;
    if (init?.body) {
      if (typeof init.body === "string") {
        body = init.body;
      } else {
        // For other body types, try to convert to string
        body = await new Response(init.body).text();
      }
    }

    // Send the request through our proxy endpoint
    const proxyResponse = await fetch("/api/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        method: init?.method || "POST",
        headers,
        body,
        customHeaders,
      }),
    });

    if (!proxyResponse.ok) {
      // If the proxy itself failed, throw an error
      const contentType = proxyResponse.headers.get("Content-Type") || "";
      let errorMessage = "Proxy request failed";

      try {
        if (contentType.includes("application/json")) {
          const errorData = await proxyResponse.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          errorMessage = await proxyResponse.text();
        }
      } catch {
        // If parsing fails, use default message
      }

      throw new Error(errorMessage);
    }

    // Return the proxied response
    // The response body and headers are already set correctly by the proxy
    return proxyResponse;
  };
};
