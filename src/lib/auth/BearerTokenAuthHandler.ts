import { AuthenticationHandler, HttpHeaders } from "@a2a-js/sdk/client";

/**
 * Simple Bearer token authentication handler for A2A clients.
 * This handler adds a Bearer token to the Authorization header of HTTP requests.
 */
export class BearerTokenAuthHandler implements AuthenticationHandler {
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  async headers(): Promise<HttpHeaders> {
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  async shouldRetryWithHeaders(req: RequestInit, res: Response): Promise<HttpHeaders | undefined> {
    // For a simple Bearer token, we don't implement retry logic
    // The token is provided upfront and used for all requests
    return undefined;
  }
}
