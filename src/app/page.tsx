"use client";

import { Alert, Box, Snackbar, Toolbar } from "@mui/material";
import React from "react";

import { AddAgentModal } from "@/components/appbar/AddAgentModal";
import { AppBar } from "@/components/appbar/AppBar";
import { Chat } from "@/components/chat/Chat";
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
} from "@/types";

export default function Home() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [pendingMessage, setPendingMessage] = React.useState<Message | null>(null);
  const [messageText, setMessageText] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [taskId, setTaskId] = React.useState<string | undefined>(undefined);
  const [contextId, setContextId] = React.useState<string | undefined>(undefined);
  const [toastOpen, setToastOpen] = React.useState<boolean>(false);
  const [toastMessage, setToastMessage] = React.useState<string>("");
  const [toastSeverity, setToastSeverity] = React.useState<
    "error" | "warning" | "info" | "success"
  >("error");
  const [agents, setAgents] = React.useState<AgentCard[]>([]);
  const [activeAgent, setActiveAgent] = React.useState<AgentCard | null>(null);
  const [addAgentModalOpen, setAddAgentModalOpen] = React.useState<boolean>(false);

  // Derive messages from tasks and pending message
  const messages: (Message | Artifact)[] = React.useMemo(() => {
    const allItems: (Message | Artifact)[] = [];

    for (const task of tasks) {
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

    // Add pending message for immediate display
    if (pendingMessage) {
      allItems.push(pendingMessage);
    }

    return allItems;
  }, [tasks, pendingMessage]);

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
    setTasks([]);
    setPendingMessage(null);
    setMessageText("");
    setTaskId(undefined);
    setContextId(undefined);
    setActiveAgent(agent);
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

        // Update taskId and contextId for future messages
        setTaskId(task.id);
        setContextId(task.contextId);

        // Update or add the task to our tasks state
        setTasks((prev) => {
          const existingTaskIndex = prev.findIndex((existingTask) => existingTask.id === task.id);

          if (existingTaskIndex === -1) {
            // Add new task
            return [...prev, task];
          } else {
            // Update existing task
            const newTasks = [...prev];
            newTasks[existingTaskIndex] = task;

            return newTasks;
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

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar
        agents={agents}
        activeAgent={activeAgent}
        onAgentSelect={handleAgentSelect}
        onAddAgent={() => setAddAgentModalOpen(true)}
      />

      <Toolbar />

      <Box sx={{ flex: 1 }}>
        <Chat
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loading}
          textFieldValue={messageText}
          onTextFieldChange={setMessageText}
        />
      </Box>

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
