import React from "react";

import { Message, Task } from "@/types/agent";
import { ChatContext } from "@/types/chat";

export interface UseChatContextsReturn {
  chatContexts: { [contextId: string]: ChatContext };
  addChatContext: (context: ChatContext) => void;
  removeChatContext: (contextId: string) => void;
  setChatContextLoading: (contextId: string, loading: boolean) => void;
  setChatContextMessageText: (contextId: string, messageText: string) => void;
  setChatContextPendingMessage: (contextId: string, message: Message | null) => void;
  addTaskToContext: (contextId: string, task: Task) => void;
  updateTaskInContext: (contextId: string, newTask: Task) => void;
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

  const addTaskToContext = (contextId: string, task: Task): void => {
    setChatContexts((prev) => {
      const context = prev[contextId];
      if (!context) return prev;

      return {
        ...prev,
        [contextId]: {
          ...context,
          tasks: [...context.tasks, task],
        },
      };
    });
  };

  const updateTaskInContext = (contextId: string, newTask: Task): void => {
    setChatContexts((prev) => {
      const context = prev[contextId];
      if (!context) return prev;

      const taskIndex = context.tasks.findIndex((task) => task.id === newTask.id);

      if (taskIndex === -1) {
        // If task not found, add it
        return {
          ...prev,
          [contextId]: {
            ...context,
            tasks: [...context.tasks, newTask],
          },
        };
      }

      const newTasks = [...context.tasks];
      newTasks[taskIndex] = newTask;

      return {
        ...prev,
        [contextId]: {
          ...context,
          tasks: newTasks,
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
    addTaskToContext,
    updateTaskInContext,
  };
};
