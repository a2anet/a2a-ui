"use client";

import { Box, Toolbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

import { AddAgentModal } from "@/components/appbar/AddAgentModal";
import { AppBar } from "@/components/appbar/AppBar";
import { Chat } from "@/components/chat/Chat";
import { Sidebar, drawerWidth } from "@/components/sidebar/Sidebar";
import { useToastContext } from "@/contexts/ToastContext";
import { useAgentManager } from "@/hooks/useAgentManager";
import { useContextManager } from "@/hooks/useContextManager";
import { AgentCard } from "@/types/agent";

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
  const [addAgentModalOpen, setAddAgentModalOpen] = React.useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(true);
  const [newChatMessageText, setNewChatMessageText] = React.useState<string>("");
  const [shouldAutoFocus, setShouldAutoFocus] = React.useState<boolean>(false);

  // Use custom hooks for managing state
  const { showToast } = useToastContext();
  const agentManager = useAgentManager({ showToast });
  const contextManager = useContextManager({ showToast });

  const handleAgentSelect = (agent: AgentCard): void => {
    agentManager.handleAgentSelect(agent);
    contextManager.handleNewChat();
    setNewChatMessageText("");
    setShouldAutoFocus(true);
  };

  const handleNewChat = (): void => {
    contextManager.handleNewChat();
    setNewChatMessageText("");
    setShouldAutoFocus(true);
  };

  const handleContextSelect = (contextId: string): void => {
    const context = contextManager.contexts.find((ctx) => ctx.contextId === contextId);

    if (context) {
      agentManager.setActiveAgent(context.agent);
      contextManager.handleContextSelect(contextId);
      setNewChatMessageText("");
      setShouldAutoFocus(true);
    }
  };

  const handleSendMessage = async (messageText: string): Promise<void> => {
    if (!agentManager.activeAgent) {
      showToast("Please add an agent", "warning");
      return;
    }

    // Clear the message text immediately when sending
    if (contextManager.selectedContextId && contextManager.activeContext) {
      contextManager.updateMessageText(contextManager.selectedContextId, "");
    } else {
      setNewChatMessageText("");
    }

    try {
      await contextManager.handleSendMessage(messageText, agentManager.activeAgent);
    } catch (error) {
      // If sending fails, restore the message text
      if (contextManager.selectedContextId && contextManager.activeContext) {
        contextManager.updateMessageText(contextManager.selectedContextId, messageText);
      } else {
        setNewChatMessageText(messageText);
      }
    }
  };

  const handleMessageTextChange = (messageText: string): void => {
    if (contextManager.selectedContextId && contextManager.activeContext) {
      contextManager.updateMessageText(contextManager.selectedContextId, messageText);
    } else {
      // For new chats, store the text locally until a context is created
      setNewChatMessageText(messageText);
    }
  };

  const handleSidebarOpen = (): void => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = (): void => {
    setSidebarOpen(false);
  };

  // Focus text field on initial mount
  React.useEffect(() => {
    setShouldAutoFocus(true);
  }, []);

  // Reset auto-focus after it's been applied
  React.useEffect(() => {
    if (shouldAutoFocus) {
      const timer = setTimeout(() => {
        setShouldAutoFocus(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoFocus]);

  // Get the current message text (either from active context or new chat)
  const currentMessageText = contextManager.activeContext?.messageText || newChatMessageText;

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        agents={agentManager.agents}
        activeAgent={agentManager.activeAgent}
        sidebarOpen={sidebarOpen}
        onAgentSelect={handleAgentSelect}
        onAddAgent={() => setAddAgentModalOpen(true)}
        onToggleSidebar={handleSidebarOpen}
        onNewChat={handleNewChat}
      />

      <Sidebar
        open={sidebarOpen}
        contexts={contextManager.contexts}
        selectedContextId={contextManager.selectedContextId}
        selectedTaskId={contextManager.selectedTaskId}
        selectedArtifactId={contextManager.selectedArtifactId}
        onContextSelect={handleContextSelect}
        onTaskSelect={contextManager.handleTaskSelect}
        onArtifactSelect={contextManager.handleArtifactSelect}
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
            context={contextManager.activeContext}
            scrollToTaskId={contextManager.scrollToTaskId}
            scrollToArtifactId={contextManager.scrollToArtifactId}
            onScrollComplete={contextManager.onScrollComplete}
            onSendMessage={handleSendMessage}
            onTextFieldChange={handleMessageTextChange}
            currentMessageText={currentMessageText}
            autoFocus={shouldAutoFocus}
          />
        </Box>
      </Main>

      <AddAgentModal
        open={addAgentModalOpen}
        onClose={() => setAddAgentModalOpen(false)}
        onAgentAdded={agentManager.handleAgentAdded}
        onError={(message) => showToast(message, "error")}
      />
    </Box>
  );
}
