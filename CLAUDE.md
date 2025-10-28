# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A2A UI is a web application that provides a user interface for the Agent2Agent (A2A) Protocol. It enables users to communicate with A2A-compatible agents built in any framework. The A2A protocol standardizes agent communication with concepts like A2A Client, A2A Server, Agent Card, Message, Task, Part, and Artifact.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server
- **Build**: `npm run build` - Creates production build
- **Production server**: `npm start` - Runs production server
- **Linting**: `npm run lint` - Runs ESLint

## Tech Stack

- **Framework**: Next.js v15 (App Router, not Pages Router)
- **UI Library**: MUI v7
- **Styling**: Emotion (via MUI)
- **Language**: TypeScript (strict mode enabled)
- **A2A SDK**: `@a2a-js/sdk` for A2A protocol integration

## Code Architecture

### State Management Pattern

The application uses a **composition-based state management** approach centered around custom hooks:

1. **useChat (src/hooks/useChat.ts)** - The central orchestrator that composes all other hooks:
   - `useAgents` - Manages agent cards and active agent selection
   - `useChatContexts` - Manages all chat contexts (sessions) and their tasks
   - `useSelected` - Tracks currently selected context, task, and artifact
   - `useScrolling` - Manages scroll-to behavior for tasks and artifacts
   - `useSettings` - Manages custom headers and other settings

2. **ChatPage component** (src/components/ChatPage.tsx) consumes `useChat` and distributes state to child components (AppBar, Sidebar, Chat).

### A2A Protocol Integration

The A2A protocol communication happens through:

1. **Client-side API calls** (src/lib/api/):
   - `sendMessageToAgent()` - Sends messages via `/api/send-message` endpoint
   - `getAgentCard()` - Fetches agent cards via `/api/get-agent-card` endpoint

2. **Server-side API routes** (src/app/api/):
   - `/api/send-message/route.ts` - Instantiates `A2AClient` and sends messages to A2A servers
   - `/api/get-agent-card/route.ts` - Fetches agent cards from A2A server URLs

The A2A SDK is only used server-side to avoid CORS issues. Custom headers (for authentication) are injected via a custom `fetchImpl` passed to `A2AClient`.

### Data Flow

1. User sends message → `useChat.handleSendMessage()`
2. Creates temp context if new, sets loading state, stores pending message
3. Calls `sendMessageToAgent()` → hits `/api/send-message` endpoint
4. Server creates `A2AClient`, sends message, returns `Task` with status updates and artifacts
5. `Task` is stored in context via `useChatContexts.updateTaskInContext()`
6. UI re-renders to display messages and artifacts

### Key Concepts

- **ChatContext**: A chat session with a single agent. Contains `contextId`, `agent`, `tasks[]`, `loading`, `messageText`, `pendingMessage`.
- **Task**: A unit of work within a context. Contains messages, artifacts, and status from the A2A protocol.
- **Terminal states**: Tasks in states `completed`, `canceled`, `failed`, `rejected`, `unknown` are considered finished.
- **Active task**: The first non-terminal task in a context. New messages are sent with the active task's ID.

### Component Organization

- **src/app/**: Next.js App Router pages and API routes
- **src/components/**: React components organized by feature:
  - `appbar/` - Top bar with agent selector, settings, new chat button
  - `sidebar/` - Context/task/artifact navigation
  - `chat/` - Message display, text field, loading states
- **src/hooks/**: Custom React hooks for state management
- **src/lib/**: Utility functions and API client functions
- **src/types/**: TypeScript type definitions
- **src/contexts/**: React contexts (e.g., ToastContext)

### Tool Calls Support

Tool calls are rendered outside the A2A protocol spec using message metadata:

- **Tool call**: Message with `metadata: { type: "tool-call", toolCallId, toolCallName }`
- **Tool call result**: Message with `metadata: { type: "tool-call-result", toolCallId, toolCallName }`

Both should have a single `DataPart` containing arguments or results.

## Coding Standards

- Use TypeScript with full type annotations for all constants, variables, function parameters, and return types
- Create small, reusable components with single responsibility
- Use Next.js App Router (`app/`) not Pages Router (`pages/`)
- Use MUI v7 syntax: `<Grid size={{ xs: 6, md: 8 }}>` instead of `<Grid item xs={6} md={8}>`
- Minimize styling - avoid adding `sx` props unless necessary
- Keep comments minimal and focused on "why" not "what"
- Use path alias `@/` for imports from `src/`

## Important Notes

- Each ChatContext is associated with a **single agent**. Multi-agent conversations are on the roadmap.
- A2A servers must respond with `TaskStatusUpdateEvent` and `TaskArtifactUpdateEvent` objects only. Independent `Message` objects are not currently supported.
- For best UX, A2A agents should use the `contextId` to access chat history across requests.
