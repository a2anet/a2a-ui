"use client";

import { Box, Container } from "@mui/material";
import React from "react";

import { AIMessage } from "@/components/chat/AIMessage";
import { ChatTextField } from "@/components/chat/ChatTextField";
import { UserMessage } from "@/components/chat/UserMessage";
import { Message } from "@/types";

interface ChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  loading: boolean;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, loading }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const handleSendMessage = (message: string): void => {
    onSendMessage(message);
  };

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Messages Container */}
      <Container maxWidth="md" sx={{ py: 2 }}>
        {messages.map((message: Message) => (
          <Box key={message.messageId}>
            {message.role === "user" ? (
              <UserMessage message={message} />
            ) : (
              <AIMessage message={message} />
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Container>

      {/* Fixed Input Container */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "background.default",
          background:
            "linear-gradient(to top, var(--mui-palette-background-default) 50%, transparent 50%)",
          pb: 2,
        }}
      >
        <Container maxWidth="md">
          <ChatTextField onSendMessage={handleSendMessage} loading={loading} />
        </Container>
      </Box>
    </Box>
  );
};
