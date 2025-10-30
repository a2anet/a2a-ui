import {
  Artifact,
  Message,
  Task,
  TaskArtifactUpdateEvent,
  TaskStatusUpdateEvent,
} from "@a2a-js/sdk";
import React from "react";

import { ChatContext } from "@/types/chat";

// Union type of all possible streaming events from the A2A protocol
export type StreamEvent = Message | Task | TaskStatusUpdateEvent | TaskArtifactUpdateEvent;

export interface UseChatContextsReturn {
  chatContexts: { [contextId: string]: ChatContext };
  addChatContext: (context: ChatContext) => void;
  removeChatContext: (contextId: string) => void;
  setChatContextLoading: (contextId: string, loading: boolean) => void;
  setChatContextMessageText: (contextId: string, messageText: string) => void;
  setChatContextPendingMessage: (contextId: string, message: Message | null) => void;
  updateMessagesInContext: (contextId: string, messages: Message[]) => void;
  updateTaskInContext: (contextId: string, task: Task) => void;
  handleStreamEvent: (contextId: string, event: StreamEvent) => void;
}

export const useChatContexts = (): UseChatContextsReturn => {
  const [chatContexts, setChatContexts] = React.useState<{ [contextId: string]: ChatContext }>({});

  const addChatContext = (context: ChatContext): void => {
    setChatContexts((prev) => ({
      ...prev,
      [context.contextId]: context,
    }));
  };

  const updateChatContext = (contextId: string, updates: Partial<ChatContext>): void => {
    setChatContexts((prev) => ({
      ...prev,
      [contextId]: prev[contextId] ? { ...prev[contextId], ...updates } : prev[contextId],
    }));
  };

  const removeChatContext = (contextId: string): void => {
    setChatContexts((prev) => {
      const newChatContexts = { ...prev };
      delete newChatContexts[contextId];

      return newChatContexts;
    });
  };

  const setChatContextLoading = (contextId: string, loading: boolean): void => {
    updateChatContext(contextId, { loading });
  };

  const setChatContextMessageText = (contextId: string, messageText: string): void => {
    updateChatContext(contextId, { messageText });
  };

  const setChatContextPendingMessage = (contextId: string, message: Message | null): void => {
    updateChatContext(contextId, { pendingMessage: message });
  };

  const updateMessagesInContext = (contextId: string, messages: Message[]): void => {
    setChatContexts((prev) => {
      const context = prev[contextId];
      if (!context) return prev;

      const newMessagesAndTasks = [...context.messagesAndTasks];

      for (const message of messages) {
        if (!message.taskId) {
          // Message doesn't have a `taskId`
          const messageIndex = newMessagesAndTasks.findIndex(
            (item): item is Message =>
              item.kind === "message" && item.messageId === message.messageId
          );

          if (messageIndex === -1) {
            // Message not found, add it
            newMessagesAndTasks.push(message);
          } else {
            // Message found, update it
            newMessagesAndTasks[messageIndex] = message;
          }
        } else {
          // Message has a `taskId`
          const taskIndex = newMessagesAndTasks.findIndex(
            (item): item is Task => item.kind === "task" && item.id === message.taskId
          );

          if (taskIndex !== -1) {
            const task = newMessagesAndTasks[taskIndex] as Task;
            const history = task.history || [];

            // Check if message already exists in history
            const historyIndex = history.findIndex(
              (msg: Message) => msg.messageId === message.messageId
            );

            let updatedHistory: Message[];
            if (historyIndex === -1) {
              // Message not found in history, add it
              updatedHistory = [...history, message];
            } else {
              // Message found in history, update it
              updatedHistory = [...history];
              updatedHistory[historyIndex] = message;
            }

            newMessagesAndTasks[taskIndex] = {
              ...task,
              history: updatedHistory,
            };
          }
        }
      }

      return {
        ...prev,
        [contextId]: {
          ...context,
          messagesAndTasks: newMessagesAndTasks,
        },
      };
    });
  };

  const updateTaskInContext = (contextId: string, task: Task): void => {
    setChatContexts((prev) => {
      const context = prev[contextId];
      if (!context) return prev;

      const taskIndex = context.messagesAndTasks.findIndex(
        (item): item is Task => item.kind === "task" && item.id === task.id
      );

      if (taskIndex === -1) {
        // If task not found, add it
        return {
          ...prev,
          [contextId]: {
            ...context,
            messagesAndTasks: [...context.messagesAndTasks, task],
          },
        };
      }

      const newMessagesAndTasks = [...context.messagesAndTasks];
      newMessagesAndTasks[taskIndex] = task;

      return {
        ...prev,
        [contextId]: {
          ...context,
          messagesAndTasks: newMessagesAndTasks,
        },
      };
    });
  };

  const handleStreamEvent = (contextId: string, event: StreamEvent): void => {
    if (event.kind === "task") {
      updateTaskInContext(contextId, event as Task);
    } else if (event.kind === "message") {
      updateMessagesInContext(contextId, [event as Message]);
    } else if (event.kind === "status-update") {
      handleTaskStatusUpdateEvent(contextId, event as TaskStatusUpdateEvent);
    } else if (event.kind === "artifact-update") {
      handleTaskArtifactUpdateEvent(contextId, event as TaskArtifactUpdateEvent);
    }
  };

  const handleTaskStatusUpdateEvent = (
    contextId: string,
    statusEvent: TaskStatusUpdateEvent
  ): void => {
    setChatContexts((prev) => {
      const context = prev[contextId];
      if (!context) return prev;

      const taskIndex = context.messagesAndTasks.findIndex(
        (item): item is Task => item.kind === "task" && item.id === statusEvent.taskId
      );

      if (taskIndex === -1) return prev;

      const task = context.messagesAndTasks[taskIndex] as Task;
      const updatedHistory: Message[] = [...(task.history || [])];

      // If the old status has a message, move it to history before replacing status
      if (task.status.message) {
        const messageExists = updatedHistory.some(
          (msg: Message) => msg.messageId === task.status.message?.messageId
        );
        if (!messageExists) {
          updatedHistory.push(task.status.message);
        }
      }

      const updatedTask: Task = {
        ...task,
        status: statusEvent.status,
        history: updatedHistory,
      };

      const newMessagesAndTasks = [...context.messagesAndTasks];
      newMessagesAndTasks[taskIndex] = updatedTask;

      return {
        ...prev,
        [contextId]: {
          ...context,
          messagesAndTasks: newMessagesAndTasks,
        },
      };
    });
  };

  const handleTaskArtifactUpdateEvent = (
    contextId: string,
    artifactEvent: TaskArtifactUpdateEvent
  ): void => {
    setChatContexts((prev) => {
      const context = prev[contextId];
      if (!context) return prev;

      const taskIndex = context.messagesAndTasks.findIndex(
        (item): item is Task => item.kind === "task" && item.id === artifactEvent.taskId
      );

      if (taskIndex === -1) return prev;

      const task = context.messagesAndTasks[taskIndex] as Task;
      const artifacts = task.artifacts || [];

      // Find if artifact already exists
      const artifactIndex = artifacts.findIndex(
        (a: Artifact) => a.artifactId === artifactEvent.artifact.artifactId
      );

      let updatedArtifacts: Artifact[];
      if (artifactIndex === -1) {
        // Add new artifact
        updatedArtifacts = [...artifacts, artifactEvent.artifact];
      } else {
        // Update existing artifact
        updatedArtifacts = [...artifacts];
        updatedArtifacts[artifactIndex] = artifactEvent.artifact;
      }

      const updatedTask: Task = {
        ...task,
        artifacts: updatedArtifacts,
      };

      const newMessagesAndTasks = [...context.messagesAndTasks];
      newMessagesAndTasks[taskIndex] = updatedTask;

      return {
        ...prev,
        [contextId]: {
          ...context,
          messagesAndTasks: newMessagesAndTasks,
        },
      };
    });
  };

  return {
    chatContexts,
    addChatContext,
    removeChatContext,
    setChatContextLoading,
    setChatContextMessageText,
    setChatContextPendingMessage,
    updateMessagesInContext,
    updateTaskInContext,
    handleStreamEvent,
  };
};
