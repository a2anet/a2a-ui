"use client";

import { Box, Toolbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

import { AppBar } from "@/components/appbar/AppBar";
import { Chat } from "@/components/chat/Chat";
import { Sidebar, drawerWidth } from "@/components/sidebar/Sidebar";
import { useChat } from "@/hooks/useChat";

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

export const ChatPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(true);

  const chat = useChat();

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        agents={chat.agents.agents}
        activeAgent={chat.agents.activeAgent}
        sidebarOpen={sidebarOpen}
        addAgentByUrl={chat.agents.addAgentByUrl}
        onAgentSelect={chat.handleAgentSelect}
        onToggleSidebar={() => setSidebarOpen(true)}
        onNewChat={chat.handleNewChat}
      />

      <Sidebar
        open={sidebarOpen}
        contexts={Object.values(chat.chatContexts.contexts)}
        selectedContextId={chat.selected.selectedContextId}
        selectedTaskId={chat.selected.selectedTaskId}
        selectedArtifactId={chat.selected.selectedArtifactId}
        onContextSelect={chat.handleContextSelect}
        onTaskSelect={chat.handleTaskSelect}
        onArtifactSelect={chat.handleArtifactSelect}
        onNewChat={chat.handleNewChat}
        onClose={() => setSidebarOpen(false)}
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
            context={chat.activeContext}
            scrollToTaskId={chat.scrolling.scrollToTaskId}
            scrollToArtifactId={chat.scrolling.scrollToArtifactId}
            currentMessageText={chat.currentMessageText}
            autoFocusChatTextField={chat.autoFocusChatTextField}
            onSendMessage={chat.handleSendMessage}
            onChatTextFieldChange={chat.handleMessageTextChange}
          />
        </Box>
      </Main>
    </Box>
  );
};
