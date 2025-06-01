"use client";

import { Alert, Box, Snackbar, Toolbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

import { AddAgentModal } from "@/components/appbar/AddAgentModal";
import { AppBar } from "@/components/appbar/AppBar";
import { Chat } from "@/components/chat/Chat";
import { Sidebar, drawerWidth } from "@/components/sidebar/Sidebar";
import { A2AClient } from "@/lib/a2a/client/client";
import { createMessageSendParamsObject } from "@/lib/utils";
import {
  AgentCard,
  Artifact,
  Message,
  SendMessageRequest,
  SendMessageResponse,
  SendMessageSuccessResponse,
  Task,
  TaskState,
} from "@/types";

export interface Context {
  contextId: string;
  agent: AgentCard;
  tasks: Task[];
}

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  marginLeft: `-${drawerWidth}px`,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: 0,
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

export default function Home() {
  const [contexts, setContexts] = React.useState<Context[]>([]);
  const [activeContextId, setActiveContextId] = React.useState<string | undefined>(undefined);
  const [pendingMessage, setPendingMessage] = React.useState<Message | null>(null);
  const [messageText, setMessageText] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [toastOpen, setToastOpen] = React.useState<boolean>(false);
  const [toastMessage, setToastMessage] = React.useState<string>("");
  const [toastSeverity, setToastSeverity] = React.useState<
    "error" | "warning" | "info" | "success"
  >("error");
  const [agents, setAgents] = React.useState<AgentCard[]>([]);
  const [activeAgent, setActiveAgent] = React.useState<AgentCard | null>(null);
  const [addAgentModalOpen, setAddAgentModalOpen] = React.useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(true);

  // Terminal states that should reset tasks
  const terminalStates: TaskState[] = [
    TaskState.Completed,
    TaskState.Canceled,
    TaskState.Failed,
    TaskState.Rejected,
    TaskState.Unknown,
  ];

  // Get the active context
  const activeContext: Context | undefined = React.useMemo(() => {
    return contexts.find((context) => context.contextId === activeContextId);
  }, [contexts, activeContextId]);

  // Get the active (non-terminal) task from the active context
  const activeTask: Task | undefined = React.useMemo(() => {
    if (!activeContext) return undefined;

    return activeContext.tasks.find((task) => !terminalStates.includes(task.status.state));
  }, [activeContext, terminalStates]);

  // Derive messages from the active context and pending message
  const messages: (Message | Artifact)[] = React.useMemo(() => {
    const allItems: (Message | Artifact)[] = [];

    if (activeContext) {
      for (const task of activeContext.tasks) {
        // Add messages from task history
        if (task.history) {
          allItems.push(...task.history);
        }

        // Add the latest status message if it exists
        if (task.status.message) {
          allItems.push(task.status.message);
        }

        // Add artifacts if they exist
        if (task.artifacts) {
          allItems.push(...task.artifacts);
        }
      }
    }

    // Add pending message for immediate display
    if (pendingMessage) {
      allItems.push(pendingMessage);
    }

    return allItems;
  }, [activeContext, pendingMessage]);

  const showToast = (
    message: string,
    severity: "error" | "warning" | "info" | "success" = "error"
  ): void => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleToastClose = (event?: React.SyntheticEvent | Event, reason?: string): void => {
    if (reason === "clickaway") {
      return;
    }

    setToastOpen(false);
  };

  const handleAgentAdded = (agent: AgentCard): void => {
    setAgents((prev) => {
      // Check if agent already exists
      const existingIndex = prev.findIndex((existingAgent) => existingAgent.url === agent.url);

      if (existingIndex !== -1) {
        // Replace the existing agent
        const newAgents = [...prev];
        newAgents[existingIndex] = agent;

        // Update active agent if we're replacing the currently active one
        if (activeAgent?.url === agent.url) {
          setActiveAgent(agent);
        }

        return newAgents;
      } else {
        const newAgents = [...prev, agent];

        // Set as active agent if it's the first one
        if (prev.length === 0) {
          setActiveAgent(agent);
        }

        showToast(`Added ${agent.name}`, "success");

        return newAgents;
      }
    });
  };

  const handleAgentSelect = (agent: AgentCard): void => {
    setActiveAgent(agent);
    handleNewChat();
  };

  const handleNewChat = (): void => {
    setActiveContextId(undefined);
    setPendingMessage(null);
    setMessageText("");
  };

  const handleContextSelect = (contextId: string): void => {
    const context = contexts.find((ctx) => ctx.contextId === contextId);

    if (context) {
      setActiveContextId(contextId);
      setActiveAgent(context.agent);
      setPendingMessage(null);
      setMessageText("");
    }
  };

  const handleSendMessage = async (messageTextToSend: string): Promise<void> => {
    if (!activeAgent) {
      showToast("Please add an agent", "warning");
      return;
    }

    setLoading(true);
    setMessageText(""); // Clear the text field immediately on send

    try {
      const client: A2AClient = new A2AClient({ agentCard: activeAgent });

      // Get the current task ID and context ID for message sending
      const taskId = activeTask?.id;
      const contextId = activeContext?.contextId;

      // Create the message send params using the utility function
      const messageSendParams = createMessageSendParamsObject(messageTextToSend, taskId, contextId);

      // Add the user's message to pending message for immediate display
      setPendingMessage(messageSendParams.message);

      // Create the request
      const request: SendMessageRequest = {
        jsonrpc: "2.0",
        method: "message/send",
        params: messageSendParams,
      };

      // Send the message to the A2A agent
      const response: SendMessageResponse = await client.sendMessage(request);

      // Check if the response is successful
      if ("result" in response) {
        const successResponse: SendMessageSuccessResponse = response as SendMessageSuccessResponse;
        const task: Task = successResponse.result as Task;

        // Clear pending message since we now have the task response
        setPendingMessage(null);

        // Update or create context and add/update the task
        setContexts((prev) => {
          const existingContextIndex = prev.findIndex(
            (context) => context.contextId === task.contextId
          );

          if (existingContextIndex === -1) {
            // Create new context
            const newContext: Context = {
              contextId: task.contextId,
              agent: activeAgent,
              tasks: [task],
            };

            setActiveContextId(task.contextId);

            return [...prev, newContext];
          } else {
            // Update existing context
            const newContexts = [...prev];
            const existingContext = newContexts[existingContextIndex];

            const existingTaskIndex = existingContext.tasks.findIndex(
              (existingTask) => existingTask.id === task.id
            );

            if (existingTaskIndex === -1) {
              // Add new task to existing context
              existingContext.tasks = [...existingContext.tasks, task];
            } else {
              // Update existing task
              const newTasks = [...existingContext.tasks];
              newTasks[existingTaskIndex] = task;
              existingContext.tasks = newTasks;
            }

            return newContexts;
          }
        });
      } else {
        console.error("Error response from A2A agent:", response);
        // Clear pending message and restore text field value on error
        setPendingMessage(null);
        setMessageText(messageTextToSend);
        showToast("Something went wrong processing your message. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Clear pending message and restore text field value on error
      setPendingMessage(null);
      setMessageText(messageTextToSend);
      showToast("Something went wrong sending your message. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarOpen = (): void => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = (): void => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        agents={agents}
        activeAgent={activeAgent}
        sidebarOpen={sidebarOpen}
        onAgentSelect={handleAgentSelect}
        onAddAgent={() => setAddAgentModalOpen(true)}
        onToggleSidebar={handleSidebarOpen}
        onNewChat={handleNewChat}
      />

      <Sidebar
        open={sidebarOpen}
        contexts={contexts}
        activeContextId={activeContextId}
        onContextSelect={handleContextSelect}
        onNewChat={handleNewChat}
        onClose={handleSidebarClose}
      />

      <Main open={sidebarOpen}>
        <Toolbar />

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 64px)", // `Toolbar` height
            overflow: "hidden",
          }}
        >
          <Chat
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={loading}
            textFieldValue={messageText}
            onTextFieldChange={setMessageText}
          />
        </Box>
      </Main>

      <AddAgentModal
        open={addAgentModalOpen}
        onClose={() => setAddAgentModalOpen(false)}
        onAgentAdded={handleAgentAdded}
        onError={(message) => showToast(message, "error")}
      />

      <Snackbar
        open={toastOpen}
        onClose={handleToastClose}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toastSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
