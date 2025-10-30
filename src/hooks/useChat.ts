import { AgentCard, Message, MessageSendParams, SendMessageResponse, Task } from "@a2a-js/sdk";
import { A2AClient } from "@a2a-js/sdk/client";
import React from "react";
import { v4 as uuidv4 } from "uuid";

import { useToastContext } from "@/contexts/ToastContext";
import { useAgents, UseAgentsReturn } from "@/hooks/useAgents";
import { StreamEvent, useChatContexts, UseChatContextsReturn } from "@/hooks/useChatContexts";
import { useScrolling, UseScrollingReturn } from "@/hooks/useScrolling";
import { useSelected, UseSelectedReturn } from "@/hooks/useSelected";
import { useSettings, UseSettingsReturn } from "@/hooks/useSettings";
import { createA2AProxyFetch } from "@/lib/api/proxy-fetch";
import { createMessageSendParams, createTempChatContext, terminalStates } from "@/lib/chat";
import { ChatContext } from "@/types/chat";

interface UseChatReturn {
  agents: UseAgentsReturn;
  chatContexts: UseChatContextsReturn;
  selected: UseSelectedReturn;
  scrolling: UseScrollingReturn;
  settings: UseSettingsReturn;
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
  const settings = useSettings();
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

    // If last item is a Message, no active task
    const lastItem =
      activeChatContext.messagesAndTasks[activeChatContext.messagesAndTasks.length - 1];

    if (lastItem && lastItem.kind === "message") {
      return undefined;
    }

    // Find last non-terminal Task
    return activeChatContext.messagesAndTasks
      .toReversed()
      .find(
        (item): item is Task =>
          item.kind === "task" && !terminalStates.includes((item as Task).status.state)
      );
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

    // Find the context and select its most recent task (if any)
    const context = chatContexts.chatContexts[contextId];
    const mostRecentTask = context?.messagesAndTasks
      .toReversed()
      .find((item) => item.kind === "task");
    if (mostRecentTask) {
      selected.setSelectedTaskId((mostRecentTask as Task).id);
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

      // Create an A2A Client with an A2A proxy fetch function that allows the it to connect to an
      // A2A Server through the Next.js proxy.
      const A2AProxyFetch: typeof fetch = createA2AProxyFetch(settings.getHeadersObject());
      const client = new A2AClient(agents.activeAgent, { fetchImpl: A2AProxyFetch });

      if (!agents.activeAgent.capabilities?.streaming) {
        // Non-streaming
        chatContexts.setChatContextPendingMessage(contextId, messageSendParams.message);
        const response: SendMessageResponse = await client.sendMessage(messageSendParams);

        if ("result" in response) {
          const result: Task | Message = response.result;

          if (result.kind === "message") {
            // Handle Message response
            chatContexts.updateMessagesInContext(contextId, [
              messageSendParams.message,
              result as Message,
            ]);
          } else if (result.kind === "task") {
            // Handle Task response
            chatContexts.updateTaskInContext(contextId, result as Task);
            selected.setSelectedTaskId((result as Task).id);
          }

          chatContexts.setChatContextPendingMessage(contextId, null);
          chatContexts.setChatContextLoading(contextId, false);
        } else {
          console.error("Error response from A2A agent:", response);

          handleSendMessageError(
            contextId,
            isNewContext,
            messageText,
            "Something went wrong sending your message. Please try again."
          );
        }
      } else {
        if (!activeTask?.id) {
          // New task
          chatContexts.setChatContextPendingMessage(contextId, messageSendParams.message);
        } else {
          // Existing task
          chatContexts.handleStreamEvent(contextId, messageSendParams.message);
        }

        // Streaming
        try {
          const stream: AsyncGenerator<StreamEvent, void, unknown> =
            client.sendMessageStream(messageSendParams);

          for await (const event of stream) {
            if (event.kind === "task") {
              const task = event as Task;
              chatContexts.setChatContextPendingMessage(contextId, null);
              chatContexts.handleStreamEvent(contextId, task);
              selected.setSelectedTaskId(task.id);
            } else {
              chatContexts.handleStreamEvent(contextId, event);
            }
          }

          // Stream completed successfully
          chatContexts.setChatContextLoading(contextId, false);
        } catch (error) {
          console.error("Error response from A2A agent:", error);

          handleSendMessageError(
            contextId,
            isNewContext,
            messageText,
            "Something went wrong sending your message. Please try again."
          );
        }
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
    settings,
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
