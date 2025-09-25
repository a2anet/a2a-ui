import { AgentCard, MessageSendParams, SendMessageResponse, Task } from "@a2a-js/sdk";
import React from "react";
import { v4 as uuidv4 } from "uuid";

import { useToastContext } from "@/contexts/ToastContext";
import { useAgents, UseAgentsReturn } from "@/hooks/useAgents";
import { useChatContexts, UseChatContextsReturn } from "@/hooks/useChatContexts";
import { useScrolling, UseScrollingReturn } from "@/hooks/useScrolling";
import { useSelected, UseSelectedReturn } from "@/hooks/useSelected";
import { sendMessageToAgent } from "@/lib/api/chat";
import { createMessageSendParams, createTempChatContext, terminalStates } from "@/lib/chat";
import { ChatContext } from "@/types/chat";

interface UseChatReturn {
  agents: UseAgentsReturn;
  chatContexts: UseChatContextsReturn;
  selected: UseSelectedReturn;
  scrolling: UseScrollingReturn;
  activeChatContext: ChatContext | undefined;
  activeTask: Task | undefined;
  currentMessageText: string;
  autoFocusChatTextField: boolean;
  handleSendMessage: (messageText: string) => Promise<void>;
  handleMessageTextChange: (messageText: string) => void;
  handleNewChat: () => void;
  handleContextSelect: (contextId: string) => void;
  handleTaskSelect: (taskId: string) => void;
  handleArtifactSelect: (artifactId: string) => void;
  handleAgentSelect: (agent: AgentCard) => void;
}

export const useChat = (): UseChatReturn => {
  const [newChatMessageText, setNewChatMessageText] = React.useState<string>("");
  const [autoFocusChatTextField, setAutoFocusChatTextField] = React.useState<boolean>(false);

  const agents = useAgents();
  const chatContexts = useChatContexts();
  const selected = useSelected();
  const scrolling = useScrolling();
  const { showToast } = useToastContext();

  // Focus text field on initial mount
  React.useEffect(() => {
    setAutoFocusChatTextField(true);
  }, []);

  // Reset auto-focus after it's been applied
  React.useEffect(() => {
    if (autoFocusChatTextField) {
      const timer = setTimeout(() => {
        setAutoFocusChatTextField(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [autoFocusChatTextField]);

  // Calculate active context and task based on selection
  const activeChatContext: ChatContext | undefined = React.useMemo(() => {
    if (!selected.selectedContextId) {
      return undefined;
    }

    return selected.selectedContextId
      ? chatContexts.chatContexts[selected.selectedContextId]
      : undefined;
  }, [selected.selectedContextId, chatContexts.chatContexts]);

  const activeTask: Task | undefined = React.useMemo(() => {
    if (!activeChatContext) {
      return undefined;
    }

    return activeChatContext.tasks.find((task) => !terminalStates.includes(task.status.state));
  }, [activeChatContext]);

  // Get the current message text (from `activeChatContext` if it exists, otherwise from local state)
  const currentMessageText = activeChatContext?.messageText || newChatMessageText;

  const handleMessageTextChange = (messageText: string): void => {
    if (activeChatContext) {
      chatContexts.setChatContextMessageText(activeChatContext.contextId, messageText);
    } else {
      // For new chats, store the text locally until a context is created
      setNewChatMessageText(messageText);
    }
  };

  const handleNewChat = (): void => {
    selected.setSelectedContextId(undefined);
    selected.setSelectedTaskId(undefined);
    selected.setSelectedArtifactId(undefined);
    scrolling.setScrollToTaskId(undefined);
    scrolling.setScrollToArtifactId(undefined);
    setNewChatMessageText("");
    setAutoFocusChatTextField(true);
  };

  const handleContextSelect = (contextId: string): void => {
    selected.setSelectedContextId(contextId);
    selected.setSelectedArtifactId(undefined);
    scrolling.setScrollToTaskId(undefined);
    scrolling.setScrollToArtifactId(undefined);

    // Find the context and select its most recent task
    const context = chatContexts.chatContexts[contextId];
    if (context && context.tasks.length > 0) {
      // Select the most recent task (last in the array)
      const mostRecentTask = context.tasks[context.tasks.length - 1];
      selected.setSelectedTaskId(mostRecentTask.id);
    }

    // Set the active agent for this context
    if (context) {
      const foundAgent = agents.agents.find((agent: AgentCard) => agent.url === context.agent.url);
      if (foundAgent) {
        agents.setActiveAgent(context.agent);
      }
    }

    setNewChatMessageText("");
    setAutoFocusChatTextField(true);
  };

  const handleTaskSelect = (taskId: string): void => {
    selected.setSelectedTaskId(taskId);
    selected.setSelectedArtifactId(undefined);
    scrolling.setScrollToTaskId(taskId);
    scrolling.setScrollToArtifactId(undefined);
  };

  const handleArtifactSelect = (artifactId: string): void => {
    selected.setSelectedArtifactId(artifactId);
    scrolling.setScrollToTaskId(undefined);
    scrolling.setScrollToArtifactId(artifactId);
  };

  const handleAgentSelect = (agent: AgentCard): void => {
    agents.setActiveAgent(agent);
    handleNewChat();
  };

  const handleSendMessage = async (messageText: string): Promise<void> => {
    if (!agents.activeAgent) {
      showToast("Please add an agent", "warning");
      return;
    }

    // Setup context
    const contextId: string = activeChatContext?.contextId || uuidv4();
    const isNewContext: boolean = !activeChatContext?.contextId;

    if (isNewContext) {
      const tempContext: ChatContext = createTempChatContext(contextId, agents.activeAgent);
      chatContexts.addChatContext(tempContext);
      selected.setSelectedContextId(contextId);
    }

    try {
      const messageSendParams: MessageSendParams = createMessageSendParams(
        messageText,
        contextId,
        activeTask?.id
      );

      // Set loading, message text, and pending message
      chatContexts.setChatContextLoading(contextId, true);
      if (isNewContext) {
        setNewChatMessageText("");
      } else {
        chatContexts.setChatContextMessageText(contextId, "");
      }
      chatContexts.setChatContextPendingMessage(contextId, messageSendParams.message);

      // Send message
      const response: SendMessageResponse = await sendMessageToAgent(
        agents.activeAgent,
        messageSendParams
      );

      if ("result" in response) {
        const task = response.result as Task;
        chatContexts.updateTaskInContext(contextId, task);
        selected.setSelectedTaskId(task.id);
        chatContexts.setChatContextPendingMessage(contextId, null);
        chatContexts.setChatContextLoading(contextId, false);
      } else {
        console.error("Error response from A2A agent:", response);

        handleSendMessageError(
          contextId,
          isNewContext,
          messageText,
          "Something went wrong processing your message. Please try again."
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);

      handleSendMessageError(
        contextId,
        isNewContext,
        messageText,
        "Something went wrong sending your message. Please try again."
      );
    }
  };

  const handleSendMessageError = (
    contextId: string,
    isNewContext: boolean,
    messageText: string,
    toastMessage: string
  ): void => {
    if (isNewContext) {
      chatContexts.removeChatContext(contextId);
      selected.setSelectedContextId(undefined);
      selected.setSelectedTaskId(undefined);
      selected.setSelectedArtifactId(undefined);
      setNewChatMessageText(messageText);
      setAutoFocusChatTextField(true);
    } else {
      chatContexts.setChatContextLoading(contextId, false);
      chatContexts.setChatContextMessageText(contextId, messageText);
      chatContexts.setChatContextPendingMessage(contextId, null);
    }

    showToast(toastMessage, "error");
  };

  return {
    agents,
    chatContexts,
    selected,
    scrolling,
    activeChatContext,
    activeTask,
    currentMessageText,
    autoFocusChatTextField,
    handleSendMessage,
    handleMessageTextChange,
    handleNewChat,
    handleContextSelect,
    handleTaskSelect,
    handleArtifactSelect,
    handleAgentSelect,
  };
};
