import React from "react";

import { A2AClient } from "@/lib/a2a/client/client";
import {
  AgentCard,
  Message,
  SendMessageRequest,
  SendMessageResponse,
  SendMessageSuccessResponse,
  Task,
  TaskState,
} from "@/lib/a2a/types";
import { generateUUID } from "@/lib/a2a/utils";
import { createMessageSendParamsObject } from "@/lib/utils";

export interface ChatContext {
  contextId: string;
  agent: AgentCard;
  tasks: Task[];
  pendingMessage: Message | null;
  messageText: string;
  loading: boolean;
}

interface UseContextManagerProps {
  showToast: (message: string, severity?: "error" | "warning" | "info" | "success") => void;
}

interface UseContextManagerReturn {
  contexts: ChatContext[];
  selectedContextId: string | undefined;
  selectedTaskId: string | undefined;
  selectedArtifactId: string | undefined;
  scrollToTaskId: string | undefined;
  scrollToArtifactId: string | undefined;
  activeContext: ChatContext | undefined;
  activeTask: Task | undefined;
  setSelectedContextId: (contextId: string | undefined) => void;
  setSelectedTaskId: (taskId: string) => void;
  setSelectedArtifactId: (artifactId: string) => void;
  setScrollToTaskId: (taskId: string | undefined) => void;
  setScrollToArtifactId: (artifactId: string | undefined) => void;
  handleNewChat: () => void;
  handleContextSelect: (contextId: string) => void;
  handleTaskSelect: (taskId: string) => void;
  handleArtifactSelect: (artifactId: string) => void;
  handleSendMessage: (messageText: string, agent: AgentCard) => Promise<void>;
  updateMessageText: (contextId: string, messageText: string) => void;
  onScrollComplete: () => void;
}

// Terminal states that should reset tasks
const terminalStates: TaskState[] = [
  TaskState.Completed,
  TaskState.Canceled,
  TaskState.Failed,
  TaskState.Rejected,
  TaskState.Unknown,
];

export const useContextManager = ({
  showToast,
}: UseContextManagerProps): UseContextManagerReturn => {
  const [contexts, setContexts] = React.useState<ChatContext[]>([]);
  const [selectedContextId, setSelectedContextId] = React.useState<string | undefined>(undefined);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | undefined>(undefined);
  const [selectedArtifactId, setSelectedArtifactId] = React.useState<string | undefined>(undefined);
  const [scrollToTaskId, setScrollToTaskId] = React.useState<string | undefined>(undefined);
  const [scrollToArtifactId, setScrollToArtifactId] = React.useState<string | undefined>(undefined);

  // Get the active context
  const activeContext: ChatContext | undefined = React.useMemo(() => {
    return contexts.find((context) => context.contextId === selectedContextId);
  }, [contexts, selectedContextId]);

  // Get the active (non-terminal) task from the active context
  const activeTask: Task | undefined = React.useMemo(() => {
    if (!activeContext) return undefined;
    return activeContext.tasks.find((task) => !terminalStates.includes(task.status.state));
  }, [activeContext]);

  const updateContext = (contextId: string, updates: Partial<ChatContext>): void => {
    setContexts((prev) =>
      prev.map((context) =>
        context.contextId === contextId ? { ...context, ...updates } : context
      )
    );
  };

  const handleNewChat = (): void => {
    setSelectedContextId(undefined);
    setSelectedTaskId(undefined);
    setSelectedArtifactId(undefined);
    setScrollToTaskId(undefined);
    setScrollToArtifactId(undefined);
  };

  const handleContextSelect = (contextId: string): void => {
    setSelectedContextId(contextId);
    setSelectedArtifactId(undefined);
    setScrollToTaskId(undefined);
    setScrollToArtifactId(undefined);

    // Find the context and select its most recent task
    const context: ChatContext | undefined = contexts.find((ctx) => ctx.contextId === contextId);

    if (context && context.tasks.length > 0) {
      // Select the most recent task (last in the array)
      const mostRecentTask = context.tasks[context.tasks.length - 1];
      setSelectedTaskId(mostRecentTask.id);
      setSelectedArtifactId(undefined);
    }
  };

  const handleTaskSelect = (taskId: string): void => {
    setSelectedTaskId(taskId);
    setSelectedArtifactId(undefined);
    setScrollToTaskId(taskId);
    setScrollToArtifactId(undefined);
  };

  const handleArtifactSelect = (artifactId: string): void => {
    setSelectedArtifactId(artifactId);
    setScrollToTaskId(undefined);
    setScrollToArtifactId(artifactId);
  };

  const updateMessageText = (contextId: string, messageText: string): void => {
    updateContext(contextId, { messageText });
  };

  const handleSendMessage = async (messageText: string, agent: AgentCard): Promise<void> => {
    if (!agent) {
      showToast("Please add an agent", "warning");
      return;
    }

    const existingTaskId = activeTask?.id;
    let contextId = selectedContextId;
    let taskId: string;
    let isNewTask = false;
    let isTemporaryContext = false;

    // Generate a taskId for new tasks or use existing one
    if (existingTaskId && activeContext) {
      taskId = existingTaskId;
    } else {
      taskId = generateUUID();
      isNewTask = true;
    }

    // Create a temporary context if we don't have one
    if (!activeContext) {
      contextId = generateUUID();
      isTemporaryContext = true;

      const tempContext: ChatContext = {
        contextId: contextId,
        agent: agent,
        tasks: [],
        pendingMessage: null,
        messageText: "",
        loading: true,
      };

      setContexts((prev) => [...prev, tempContext]);
      setSelectedContextId(contextId);
    } else {
      // Update existing context loading state and clear message text
      updateContext(activeContext.contextId, { loading: true, messageText: "" });
    }

    try {
      const client: A2AClient = new A2AClient({ agentCard: agent });
      const messageSendParams = createMessageSendParamsObject(messageText, taskId, contextId);

      // Create a temporary task if this is a new task
      if (isNewTask) {
        const tempTask: Task = {
          id: taskId,
          contextId: contextId!,
          status: {
            state: TaskState.Submitted,
            timestamp: new Date().toISOString(),
          },
          history: [messageSendParams.message],
          artifacts: [],
          metadata: {},
          kind: "task",
        };

        // Add the temporary task to the context
        updateContext(contextId!, {
          tasks: activeContext ? [...(activeContext.tasks || []), tempTask] : [tempTask],
          pendingMessage: null,
        });

        // Select the new task
        setSelectedTaskId(taskId);
      } else {
        // For existing tasks, just add the pending message
        updateContext(contextId!, { pendingMessage: messageSendParams.message });
      }

      const request: SendMessageRequest = {
        jsonrpc: "2.0",
        method: "message/send",
        params: messageSendParams,
      };

      const response: SendMessageResponse = await client.sendMessage(request);

      if ("result" in response) {
        const successResponse: SendMessageSuccessResponse = response as SendMessageSuccessResponse;
        const task: Task = successResponse.result as Task;

        // Update context and task
        setContexts((prev) => {
          const existingContextIndex = prev.findIndex(
            (context) => context.contextId === task.contextId
          );

          const newContexts = [...prev];
          let existingContext: ChatContext;

          if (existingContextIndex === -1) {
            // Create new context with the task's contextId
            existingContext = {
              contextId: task.contextId,
              agent: agent,
              tasks: [],
              pendingMessage: null,
              messageText: "",
              loading: false,
            };
            newContexts.push(existingContext);
          } else {
            // Use existing context
            existingContext = { ...newContexts[existingContextIndex] };
            newContexts[existingContextIndex] = existingContext;
          }

          // Update the context ID if different (temporary UUID -> real context ID)
          if (existingContext.contextId !== task.contextId) {
            existingContext.contextId = task.contextId;
            setSelectedContextId(task.contextId);
          }

          // Find and update or add the task
          const tempTaskIndex = existingContext.tasks.findIndex(
            (existingTask) => existingTask.id === taskId
          );

          if (tempTaskIndex !== -1) {
            // Replace the temporary task with the real one
            const newTasks = [...existingContext.tasks];
            newTasks[tempTaskIndex] = task;
            existingContext.tasks = newTasks;
          } else {
            // Add new task or update existing one
            const existingTaskIndex = existingContext.tasks.findIndex(
              (existingTask) => existingTask.id === task.id
            );

            if (existingTaskIndex === -1) {
              existingContext.tasks = [...existingContext.tasks, task];
            } else {
              const newTasks = [...existingContext.tasks];
              newTasks[existingTaskIndex] = task;
              existingContext.tasks = newTasks;
            }
          }

          // Clear pending message and loading state
          existingContext.pendingMessage = null;
          existingContext.loading = false;

          return newContexts;
        });
      } else {
        console.error("Error response from A2A agent:", response);

        if (isTemporaryContext) {
          // Remove the temporary context if it failed
          setContexts((prev) => prev.filter((ctx) => ctx.contextId !== contextId));
          setSelectedContextId(undefined);
        } else {
          // For existing contexts, restore the message text and clear loading
          updateContext(contextId!, {
            pendingMessage: null,
            messageText: messageText,
            loading: false,
          });
        }

        if (isNewTask) {
          setSelectedTaskId(undefined);
          setSelectedArtifactId(undefined);
        }

        showToast("Something went wrong processing your message. Please try again.", "error");
        throw new Error("Message processing failed");
      }
    } catch (error) {
      console.error("Error sending message:", error);

      if (isTemporaryContext) {
        // Remove the temporary context if it failed
        setContexts((prev) => prev.filter((ctx) => ctx.contextId !== contextId));
        setSelectedContextId(undefined);
      } else {
        // For existing contexts, restore the message text and clear loading
        updateContext(contextId!, {
          pendingMessage: null,
          messageText: messageText,
          loading: false,
        });
      }

      if (isNewTask) {
        setSelectedTaskId(undefined);
        setSelectedArtifactId(undefined);
      }

      showToast("Something went wrong sending your message. Please try again.", "error");
      throw error; // Re-throw to allow main page to handle
    }
  };

  const onScrollComplete = (): void => {
    setScrollToTaskId(undefined);
    setScrollToArtifactId(undefined);
  };

  return {
    contexts,
    selectedContextId,
    selectedTaskId,
    selectedArtifactId,
    scrollToTaskId,
    scrollToArtifactId,
    activeContext,
    activeTask,
    setSelectedContextId,
    setSelectedTaskId,
    setSelectedArtifactId,
    setScrollToTaskId,
    setScrollToArtifactId,
    handleNewChat,
    handleContextSelect,
    handleTaskSelect,
    handleArtifactSelect,
    handleSendMessage,
    updateMessageText,
    onScrollComplete,
  };
};
