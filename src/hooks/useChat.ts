import React from "react";
import { v4 as uuidv4 } from "uuid";

import { useToastContext } from "@/contexts/ToastContext";
import { useAgents, UseAgentsReturn } from "@/hooks/useAgents";
import { useChatContexts, UseChatContextsReturn } from "@/hooks/useChatContexts";
import { useScrolling, UseScrollingReturn } from "@/hooks/useScrolling";
import { useSelected, UseSelectedReturn } from "@/hooks/useSelected";
import {
  createMessageSendParams,
  createTempTask,
  sendMessageToAgent,
  terminalStates,
} from "@/lib/chat";
import { AgentCard, SendMessageSuccessResponse, Task } from "@/types/agent";
import { ChatContext } from "@/types/chat";

interface UseChatReturn {
  agents: UseAgentsReturn;
  chatContexts: UseChatContextsReturn;
  selected: UseSelectedReturn;
  scrolling: UseScrollingReturn;
  activeContext: ChatContext | undefined;
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
  const activeContext: ChatContext | undefined = React.useMemo(() => {
    return selected.selectedContextId
      ? chatContexts.contexts[selected.selectedContextId]
      : undefined;
  }, [selected.selectedContextId, chatContexts.contexts]);

  const activeTask: Task | undefined = React.useMemo(() => {
    if (!activeContext) return undefined;
    return activeContext.tasks.find((task) => !terminalStates.includes(task.status.state));
  }, [activeContext]);

  // Get the current message text (from `activeContext` if it exists, otherwise from local state)
  const currentMessageText = activeContext?.messageText || newChatMessageText;

  const handleMessageTextChange = (messageText: string): void => {
    if (selected.selectedContextId && activeContext) {
      updateMessageText(selected.selectedContextId, messageText);
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
    const context = chatContexts.contexts[contextId];
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

  const updateMessageText = (contextId: string, messageText: string): void => {
    chatContexts.updateContext(contextId, { messageText });
  };

  const handleSendMessage = async (messageText: string): Promise<void> => {
    if (!agents.activeAgent) {
      showToast("Please add an agent", "warning");
      return;
    }

    const existingTaskId = activeTask?.id;
    let contextId = selected.selectedContextId;
    let taskId: string;
    let isNewTask = false;
    let isTemporaryContext = false;

    // Generate a taskId for new tasks or use existing one
    if (existingTaskId && activeContext) {
      taskId = existingTaskId;
    } else {
      taskId = uuidv4();
      isNewTask = true;
    }

    // Create a temporary context if we don't have one
    if (!activeContext) {
      contextId = chatContexts.createNewContext(agents.activeAgent);
      isTemporaryContext = true;
      selected.setSelectedContextId(contextId);
    } else {
      // Update existing context loading state and clear message text
      chatContexts.updateContext(activeContext.contextId, { loading: true, messageText: "" });
    }

    // Clear the message text immediately when sending
    if (contextId && activeContext) {
      updateMessageText(contextId, "");
    } else {
      setNewChatMessageText("");
    }

    try {
      const messageSendParams = createMessageSendParams(messageText, contextId!, taskId);

      // Create a temporary task if this is a new task
      if (isNewTask) {
        const tempTask = createTempTask(taskId, contextId!, messageSendParams.message);

        // Add the temporary task to the context
        chatContexts.updateContext(contextId!, {
          tasks: activeContext ? [...(activeContext.tasks || []), tempTask] : [tempTask],
          pendingMessage: null,
        });
      } else {
        // For existing tasks, just add the pending message
        chatContexts.updateContext(contextId!, { pendingMessage: messageSendParams.message });
      }

      // Send message via API
      const response = await sendMessageToAgent(agents.activeAgent.url, messageSendParams);

      if ("result" in response) {
        const successResponse = response as SendMessageSuccessResponse;
        const task = successResponse.result as Task;

        // Update context with the real task
        chatContexts.setContexts((prev) => {
          const newContexts = { ...prev };
          let existingContext = newContexts[task.contextId];

          if (!existingContext) {
            // Create new context with the task's contextId
            existingContext = {
              contextId: task.contextId,
              agent: agents.activeAgent!,
              tasks: [],
              pendingMessage: null,
              messageText: "",
              loading: false,
            };
            newContexts[task.contextId] = existingContext;
          }

          // Update the context ID if different (temporary UUID -> real context ID)
          if (contextId !== task.contextId) {
            // Remove the old temporary context and update selection
            if (newContexts[contextId!]) {
              delete newContexts[contextId!];
            }
            selected.setSelectedContextId(task.contextId);
          }

          // Find and update or add the task
          const tempTaskIndex = existingContext.tasks.findIndex((t) => t.id === taskId);
          let newTasks: Task[];

          if (tempTaskIndex !== -1) {
            // Replace the temporary task with the real one
            newTasks = [...existingContext.tasks];
            newTasks[tempTaskIndex] = task;
          } else {
            // Add new task or update existing one
            const existingTaskIndex = existingContext.tasks.findIndex((t) => t.id === task.id);

            if (existingTaskIndex === -1) {
              newTasks = [...existingContext.tasks, task];
            } else {
              newTasks = [...existingContext.tasks];
              newTasks[existingTaskIndex] = task;
            }
          }

          // Create new context object instead of mutating existing one
          newContexts[task.contextId] = {
            ...existingContext,
            tasks: newTasks,
            pendingMessage: null,
            loading: false,
          };

          return newContexts;
        });
      } else {
        console.error("Error response from A2A agent:", response);

        if (isTemporaryContext) {
          // Remove the temporary context if it failed
          chatContexts.removeContext(contextId!);
          selected.setSelectedContextId(undefined);
        } else {
          // For existing contexts, restore the message text and clear loading
          chatContexts.updateContext(contextId!, {
            pendingMessage: null,
            messageText: messageText,
            loading: false,
          });
        }

        showToast("Something went wrong processing your message. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error sending message:", error);

      if (isTemporaryContext) {
        // Remove the temporary context if it failed
        chatContexts.removeContext(contextId!);
        selected.setSelectedContextId(undefined);
      } else {
        // For existing contexts, restore the message text and clear loading
        chatContexts.updateContext(contextId!, {
          pendingMessage: null,
          messageText: messageText,
          loading: false,
        });
      }

      // If sending fails, restore the message text
      if (contextId && activeContext) {
        updateMessageText(contextId, messageText);
      } else {
        setNewChatMessageText(messageText);
      }

      showToast("Something went wrong sending your message. Please try again.", "error");
    }
  };

  return {
    agents,
    chatContexts,
    selected,
    scrolling,
    activeContext,
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
