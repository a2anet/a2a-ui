# A2A TypeScript Client

This directory contains the TypeScript client library for interacting with A2A (Agent-to-Agent) services.

## Files

- **`client.ts`** - Main client classes (`A2AClient` and `A2ACardResolver`)
- **`errors.ts`** - Custom error classes for the client
- **`utils.ts`** - Helper functions for creating messages
- **`index.ts`** - Main exports for the library

## Usage

### Basic Example

```typescript
import { A2AClient, createTextMessageObject } from "@/lib/client";

// Create a client from an agent card URL
const client = await A2AClient.getClientFromAgentCardUrl("https://example-agent.com");

// Create a text message
const message = createTextMessageObject("user", "Hello, agent!");

// Send a message
const request = {
  method: "message/send" as const,
  params: {
    message,
    configuration: {
      acceptedOutputModes: ["text/plain"],
    },
  },
  jsonrpc: "2.0" as const,
};

const response = await client.sendMessage(request);
console.log(response);
```

### Streaming Example

```typescript
import { A2AClient } from "@/lib/client";

const client = new A2AClient({ url: "https://example-agent.com/rpc" });

const streamingRequest = {
  method: "message/stream" as const,
  params: {
    message: createTextMessageObject("user", "Generate a long response"),
    configuration: {
      acceptedOutputModes: ["text/plain"],
    },
  },
  jsonrpc: "2.0" as const,
};

// Use async generator to handle streaming responses
for await (const response of client.sendMessageStreaming(streamingRequest)) {
  console.log("Received:", response);
}
```

### Task Management

```typescript
// Get task information
const taskRequest = {
  method: "tasks/get" as const,
  params: {
    id: "task-id-here",
    historyLength: 10,
  },
  jsonrpc: "2.0" as const,
};

const taskResponse = await client.getTask(taskRequest);

// Cancel a task
const cancelRequest = {
  method: "tasks/cancel" as const,
  params: {
    id: "task-id-here",
  },
  jsonrpc: "2.0" as const,
};

const cancelResponse = await client.cancelTask(cancelRequest);
```

## Error Handling

The client provides specific error types for different failure scenarios:

```typescript
import { A2AClientHTTPError, A2AClientJSONError } from "@/lib/client";

try {
  const response = await client.sendMessage(request);
} catch (error) {
  if (error instanceof A2AClientHTTPError) {
    console.error(`HTTP Error ${error.statusCode}: ${error.message}`);
  } else if (error instanceof A2AClientJSONError) {
    console.error(`JSON Error: ${error.message}`);
  } else {
    console.error("Unknown error:", error);
  }
}
```

## Features

- ✅ Full TypeScript support with type safety
- ✅ Agent card resolution and validation
- ✅ Non-streaming and streaming message support
- ✅ Task management (get, cancel)
- ✅ Push notification configuration
- ✅ Comprehensive error handling
- ✅ Native fetch API (no external HTTP dependencies)
- ✅ Server-Sent Events (SSE) support for streaming
