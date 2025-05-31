"use client";

import { Box, Container } from "@mui/material";
import React from "react";

import { AIMessage } from "@/components/chat/AIMessage";
import { ArtifactCard } from "@/components/chat/ArtifactCard";
import { ChatTextField } from "@/components/chat/ChatTextField";
import { UserMessage } from "@/components/chat/UserMessage";
import { Artifact, Message } from "@/types";

interface ChatProps {
  messages: (Message | Artifact)[];
  onSendMessage: (message: string) => void;
  loading: boolean;
  textFieldValue: string;
  onTextFieldChange: (value: string) => void;
}

export const Chat: React.FC<ChatProps> = ({
  messages,
  onSendMessage,
  loading,
  textFieldValue,
  onTextFieldChange,
}) => {
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

  const renderItem = (item: Message | Artifact): React.ReactNode => {
    if ("kind" in item && item.kind === "message") {
      const message: Message = item as Message;

      return (
        <Box key={message.messageId} sx={{ mb: 4 }}>
          {message.role === "user" ? (
            <UserMessage message={message} />
          ) : (
            <AIMessage message={message} />
          )}
        </Box>
      );
    } else {
      const artifact: Artifact = item as Artifact;

      return (
        <Box key={artifact.artifactId} sx={{ mb: 4 }}>
          <ArtifactCard artifact={artifact} />
        </Box>
      );
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
      }}
    >
      {/* Messages Container */}
      <Container maxWidth="md" sx={{ pt: 2, pb: 34 }}>
        {messages.map((item) => renderItem(item))}
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
          <ChatTextField
            onSendMessage={handleSendMessage}
            loading={loading}
            value={textFieldValue}
            onChange={onTextFieldChange}
          />
        </Container>
      </Box>
    </Box>
  );
};
