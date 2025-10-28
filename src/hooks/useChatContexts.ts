import { Message, Task } from "@a2a-js/sdk";
import React from "react";

import { ChatContext } from "@/types/chat";

export interface UseChatContextsReturn {
  chatContexts: { [contextId: string]: ChatContext };
  addChatContext: (context: ChatContext) => void;
  removeChatContext: (contextId: string) => void;
  setChatContextLoading: (contextId: string, loading: boolean) => void;
  setChatContextMessageText: (contextId: string, messageText: string) => void;
  setChatContextPendingMessage: (contextId: string, message: Message | null) => void;
  updateMessagesInContext: (contextId: string, messages: Message[]) => void;
  updateTaskInContext: (contextId: string, task: Task) => void;
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
        const messageIndex = newMessagesAndTasks.findIndex(
          (item): item is Message => item.kind === "message" && item.messageId === message.messageId
        );

        if (messageIndex === -1) {
          // If message not found, add it
          newMessagesAndTasks.push(message);
        } else {
          // If message found, update it
          newMessagesAndTasks[messageIndex] = message;
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

  return {
    chatContexts,
    addChatContext,
    removeChatContext,
    setChatContextLoading,
    setChatContextMessageText,
    setChatContextPendingMessage,
    updateMessagesInContext,
    updateTaskInContext,
  };
};
