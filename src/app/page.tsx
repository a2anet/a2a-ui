"use client";

import { Alert, Box, Snackbar, Toolbar } from "@mui/material";
import React from "react";

import { AddAgentModal } from "@/components/appbar/AddAgentModal";
import { AppBar } from "@/components/appbar/AppBar";
import { Chat } from "@/components/chat/Chat";
import { A2AClient } from "@/lib/a2a/client/client";
import { createMessageSendParamsObject } from "@/lib/utils";
import { AgentCard, Message, SendMessageRequest, SendMessageSuccessResponse } from "@/types";

export default function Home() {
  const [messages, setMessages] = React.useState<Message[]>([]);
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
    setMessages([]);
    setTaskId(undefined);
    setContextId(undefined);
    setActiveAgent(agent);
  };

  const handleSendMessage = async (messageText: string): Promise<void> => {
    if (!activeAgent) {
      showToast("Please add an agent", "warning");

      return;
    }

    setLoading(true);

    try {
      const client: A2AClient = new A2AClient({ agentCard: activeAgent });

      // Create the message send params using the utility function
      const messageSendParams = createMessageSendParamsObject(messageText, taskId, contextId);

      // Add the user's message to the messages array
      setMessages((prev) => [...prev, messageSendParams.message]);

      // Create the request
      const request: SendMessageRequest = {
        jsonrpc: "2.0",
        method: "message/send",
        params: messageSendParams,
      };

      // Send the message to the A2A agent
      const response = await client.sendMessage(request);

      // Check if the response is successful
      if ("result" in response) {
        const successResponse = response as SendMessageSuccessResponse;
        const result = successResponse.result;

        // Extract taskId and contextId for future messages
        if (result.kind === "task") {
          setTaskId(result.id);
          setContextId(result.contextId);

          if (result.status.message) {
            setMessages((prev) => [...prev, result.status.message!]);
          }
        } else if (result.kind === "message") {
          if (result.taskId) {
            setTaskId(result.taskId);
          }

          if (result.contextId) {
            setContextId(result.contextId);
          }

          setMessages((prev) => [...prev, result]);
        }
      } else {
        console.error("Error response from A2A agent:", response);
        showToast("Something went wrong processing your message. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
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
        <Chat messages={messages} onSendMessage={handleSendMessage} loading={loading} />
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
