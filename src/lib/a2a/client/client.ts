import {
  AgentCard,
  CancelTaskRequest,
  CancelTaskResponse,
  GetTaskPushNotificationConfigRequest,
  GetTaskPushNotificationConfigResponse,
  GetTaskRequest,
  GetTaskResponse,
  SendMessageRequest,
  SendMessageResponse,
  SendStreamingMessageRequest,
  SendStreamingMessageResponse,
  SetTaskPushNotificationConfigRequest,
  SetTaskPushNotificationConfigResponse,
} from "../types";
import { generateUUID } from "../utils";
import { A2AClientHTTPError, A2AClientJSONError } from "./errors";

/**
 * Agent Card resolver.
 */
export class A2ACardResolver {
  private baseUrl: string;
  private agentCardPath: string;

  /**
   * Initializes the A2ACardResolver.
   *
   * @param baseUrl - The base URL of the agent's host.
   * @param agentCardPath - The path to the agent card endpoint, relative to the base URL.
   */
  constructor(baseUrl: string, agentCardPath: string = "/.well-known/agent.json") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.agentCardPath = agentCardPath.replace(/^\//, "");
  }

  /**
   * Fetches the agent card from the specified URL.
   *
   * @param httpOptions - Optional fetch options to pass to the underlying fetch request.
   * @returns An `AgentCard` object representing the agent's capabilities.
   * @throws A2AClientHTTPError - If an HTTP error occurs during the request.
   * @throws A2AClientJSONError - If the response body cannot be decoded as JSON or validated against the AgentCard schema.
   */
  async getAgentCard(httpOptions?: RequestInit): Promise<AgentCard> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.agentCardPath}`, httpOptions);

      if (!response.ok) {
        throw new A2AClientHTTPError(
          response.status,
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      // In a real implementation, you might want to validate the data against the AgentCard schema
      return data as AgentCard;
    } catch (error) {
      if (error instanceof A2AClientHTTPError) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new A2AClientJSONError(`Invalid JSON response: ${error.message}`);
      }
      throw new A2AClientHTTPError(
        503,
        `Network communication error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * A2A Client for interacting with an A2A agent.
 */
export class A2AClient {
  private url: string;

  /**
   * Initializes the A2AClient.
   *
   * Requires either an `AgentCard` or a direct `url` to the agent's RPC endpoint.
   *
   * @param options - Configuration options for the client.
   * @param options.agentCard - The agent card object. If provided, `url` is taken from `agentCard.url`.
   * @param options.url - The direct URL to the agent's A2A RPC endpoint. Required if `agentCard` is not provided.
   * @throws Error - If neither `agentCard` nor `url` is provided.
   */
  constructor(options: { agentCard?: AgentCard; url?: string }) {
    if (options.agentCard) {
      this.url = options.agentCard.url;
    } else if (options.url) {
      this.url = options.url;
    } else {
      throw new Error("Must provide either agentCard or url");
    }
  }

  /**
   * Fetches the AgentCard and initializes an A2A client.
   *
   * @param baseUrl - The base URL of the agent's host.
   * @param agentCardPath - The path to the agent card endpoint, relative to the base URL.
   * @param httpOptions - Optional fetch options to pass to the underlying fetch request when fetching the agent card.
   * @returns An initialized `A2AClient` instance.
   * @throws A2AClientHTTPError - If an HTTP error occurs fetching the agent card.
   * @throws A2AClientJSONError - If the agent card response is invalid.
   */
  static async getClientFromAgentCardUrl(
    baseUrl: string,
    agentCardPath: string = "/.well-known/agent.json",
    httpOptions?: RequestInit
  ): Promise<A2AClient> {
    const agentCard = await new A2ACardResolver(baseUrl, agentCardPath).getAgentCard(httpOptions);
    return new A2AClient({ agentCard });
  }

  /**
   * Sends a non-streaming message request to the agent.
   *
   * @param request - The `SendMessageRequest` object containing the message and configuration.
   * @param httpOptions - Optional fetch options to pass to the underlying fetch request.
   * @returns A `SendMessageResponse` object containing the agent's response (Task or Message) or an error.
   * @throws A2AClientHTTPError - If an HTTP error occurs during the request.
   * @throws A2AClientJSONError - If the response body cannot be decoded as JSON or validated.
   */
  async sendMessage(
    request: SendMessageRequest,
    httpOptions?: RequestInit
  ): Promise<SendMessageResponse> {
    if (!request.id) {
      request.id = generateUUID();
    }

    const response = await this._sendRequest(this._serializeRequest(request), httpOptions);

    return response as SendMessageResponse;
  }

  /**
   * Sends a streaming message request to the agent and yields responses as they arrive.
   *
   * This method uses Server-Sent Events (SSE) to receive a stream of updates from the agent.
   *
   * @param request - The `SendStreamingMessageRequest` object containing the message and configuration.
   * @param httpOptions - Optional fetch options to pass to the underlying fetch request.
   * @returns An async generator that yields `SendStreamingMessageResponse` objects as they are received in the SSE stream.
   * @throws A2AClientHTTPError - If an HTTP or SSE protocol error occurs during the request.
   * @throws A2AClientJSONError - If an SSE event data cannot be decoded as JSON or validated.
   */
  async *sendMessageStreaming(
    request: SendStreamingMessageRequest,
    httpOptions?: RequestInit
  ): AsyncGenerator<SendStreamingMessageResponse> {
    if (!request.id) {
      request.id = generateUUID();
    }

    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...httpOptions?.headers,
      },
      body: JSON.stringify(this._serializeRequest(request)),
      ...httpOptions,
    };

    try {
      const response = await fetch(this.url, requestOptions);

      if (!response.ok) {
        throw new A2AClientHTTPError(
          response.status,
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      if (!response.body) {
        throw new A2AClientHTTPError(500, "No response body received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                return;
              }
              try {
                const event = JSON.parse(data);
                yield event as SendStreamingMessageResponse;
              } catch (error) {
                throw new A2AClientJSONError(
                  `Invalid JSON in SSE data: ${
                    error instanceof Error ? error.message : String(error)
                  }`
                );
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof A2AClientHTTPError || error instanceof A2AClientJSONError) {
        throw error;
      }
      throw new A2AClientHTTPError(
        503,
        `Network communication error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Retrieves the current state and history of a specific task.
   *
   * @param request - The `GetTaskRequest` object specifying the task ID and history length.
   * @param httpOptions - Optional fetch options to pass to the underlying fetch request.
   * @returns A `GetTaskResponse` object containing the Task or an error.
   * @throws A2AClientHTTPError - If an HTTP error occurs during the request.
   * @throws A2AClientJSONError - If the response body cannot be decoded as JSON or validated.
   */
  async getTask(request: GetTaskRequest, httpOptions?: RequestInit): Promise<GetTaskResponse> {
    if (!request.id) {
      request.id = generateUUID();
    }

    const response = await this._sendRequest(this._serializeRequest(request), httpOptions);

    return response as GetTaskResponse;
  }

  /**
   * Requests the agent to cancel a specific task.
   *
   * @param request - The `CancelTaskRequest` object specifying the task ID.
   * @param httpOptions - Optional fetch options to pass to the underlying fetch request.
   * @returns A `CancelTaskResponse` object containing the updated Task with canceled status or an error.
   * @throws A2AClientHTTPError - If an HTTP error occurs during the request.
   * @throws A2AClientJSONError - If the response body cannot be decoded as JSON or validated.
   */
  async cancelTask(
    request: CancelTaskRequest,
    httpOptions?: RequestInit
  ): Promise<CancelTaskResponse> {
    if (!request.id) {
      request.id = generateUUID();
    }

    const response = await this._sendRequest(this._serializeRequest(request), httpOptions);

    return response as CancelTaskResponse;
  }

  /**
   * Sets or updates the push notification configuration for a specific task.
   *
   * @param request - The `SetTaskPushNotificationConfigRequest` object specifying the task ID and configuration.
   * @param httpOptions - Optional fetch options to pass to the underlying fetch request.
   * @returns A `SetTaskPushNotificationConfigResponse` object containing the confirmation or an error.
   * @throws A2AClientHTTPError - If an HTTP error occurs during the request.
   * @throws A2AClientJSONError - If the response body cannot be decoded as JSON or validated.
   */
  async setTaskCallback(
    request: SetTaskPushNotificationConfigRequest,
    httpOptions?: RequestInit
  ): Promise<SetTaskPushNotificationConfigResponse> {
    if (!request.id) {
      request.id = generateUUID();
    }

    const response = await this._sendRequest(this._serializeRequest(request), httpOptions);

    return response as SetTaskPushNotificationConfigResponse;
  }

  /**
   * Retrieves the push notification configuration for a specific task.
   *
   * @param request - The `GetTaskPushNotificationConfigRequest` object specifying the task ID.
   * @param httpOptions - Optional fetch options to pass to the underlying fetch request.
   * @returns A `GetTaskPushNotificationConfigResponse` object containing the configuration or an error.
   * @throws A2AClientHTTPError - If an HTTP error occurs during the request.
   * @throws A2AClientJSONError - If the response body cannot be decoded as JSON or validated.
   */
  async getTaskCallback(
    request: GetTaskPushNotificationConfigRequest,
    httpOptions?: RequestInit
  ): Promise<GetTaskPushNotificationConfigResponse> {
    if (!request.id) {
      request.id = generateUUID();
    }

    const response = await this._sendRequest(this._serializeRequest(request), httpOptions);

    return response as GetTaskPushNotificationConfigResponse;
  }

  /**
   * Sends a non-streaming JSON-RPC request to the agent.
   *
   * @param rpcRequestPayload - JSON RPC payload for sending the request.
   * @param httpOptions - Optional fetch options to pass to the underlying fetch request.
   * @returns The JSON response payload as an object.
   * @throws A2AClientHTTPError - If an HTTP error occurs during the request.
   * @throws A2AClientJSONError - If the response body cannot be decoded as JSON.
   */
  private async _sendRequest(
    rpcRequestPayload: Record<string, any>,
    httpOptions?: RequestInit
  ): Promise<Record<string, any>> {
    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...httpOptions?.headers,
      },
      body: JSON.stringify(rpcRequestPayload),
      ...httpOptions,
    };

    try {
      const response = await fetch(this.url, requestOptions);

      if (!response.ok) {
        throw new A2AClientHTTPError(
          response.status,
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof A2AClientHTTPError) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new A2AClientJSONError(`Invalid JSON response: ${error.message}`);
      }
      throw new A2AClientHTTPError(
        503,
        `Network communication error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Serializes a request object to a plain object, excluding undefined/null values.
   *
   * @param request - The request object to serialize.
   * @returns A plain object representation of the request.
   */
  private _serializeRequest(request: Record<string, any>): Record<string, any> {
    const serialized: Record<string, any> = {};

    for (const [key, value] of Object.entries(request)) {
      if (value !== undefined && value !== null) {
        serialized[key] = value;
      }
    }

    return serialized;
  }
}
