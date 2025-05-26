/**
 * Custom exceptions for the A2A client.
 */

/**
 * Base exception for A2A Client errors.
 */
export class A2AClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "A2AClientError";
  }
}

/**
 * Client exception for HTTP errors received from the server.
 */
export class A2AClientHTTPError extends A2AClientError {
  public readonly statusCode: number;
  public readonly message: string;

  /**
   * Initializes the A2AClientHTTPError.
   *
   * @param statusCode - The HTTP status code of the response.
   * @param message - A descriptive error message.
   */
  constructor(statusCode: number, message: string) {
    super(`HTTP Error ${statusCode}: ${message}`);
    this.name = "A2AClientHTTPError";
    this.statusCode = statusCode;
    this.message = message;
  }
}

/**
 * Client exception for JSON errors during response parsing or validation.
 */
export class A2AClientJSONError extends A2AClientError {
  public readonly message: string;

  /**
   * Initializes the A2AClientJSONError.
   *
   * @param message - A descriptive error message.
   */
  constructor(message: string) {
    super(`JSON Error: ${message}`);
    this.name = "A2AClientJSONError";
    this.message = message;
  }
}
