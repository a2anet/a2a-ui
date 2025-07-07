import React from "react";
import { v4 as uuidv4 } from "uuid";

import { createTempContext } from "@/lib/chat";
import { AgentCard } from "@/types/agent";
import { ChatContext } from "@/types/chat";

export interface UseChatContextsReturn {
  contexts: { [contextId: string]: ChatContext };
  updateContext: (contextId: string, updates: Partial<ChatContext>) => void;
  createNewContext: (agent: AgentCard) => string;
  removeContext: (contextId: string) => void;
  setContexts: React.Dispatch<React.SetStateAction<{ [contextId: string]: ChatContext }>>;
}

export const useChatContexts = (): UseChatContextsReturn => {
  const [contexts, setContexts] = React.useState<{ [contextId: string]: ChatContext }>({});

  const updateContext = (contextId: string, updates: Partial<ChatContext>): void => {
    setContexts((prev) => ({
      ...prev,
      [contextId]: prev[contextId] ? { ...prev[contextId], ...updates } : prev[contextId],
    }));
  };

  const createNewContext = (agent: AgentCard): string => {
    const contextId = uuidv4();
    const newContext = createTempContext(contextId, agent);
    setContexts((prev) => ({
      ...prev,
      [contextId]: newContext,
    }));

    return contextId;
  };

  const removeContext = (contextId: string): void => {
    setContexts((prev) => {
      const newContexts = { ...prev };
      delete newContexts[contextId];

      return newContexts;
    });
  };

  return {
    contexts,
    updateContext,
    createNewContext,
    removeContext,
    setContexts,
  };
};
