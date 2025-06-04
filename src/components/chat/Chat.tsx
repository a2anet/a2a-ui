"use client";

import { Box, Container } from "@mui/material";
import React from "react";

import { Context } from "@/app/page";
import { AIMessage } from "@/components/chat/AIMessage";
import { ArtifactCard } from "@/components/chat/ArtifactCard";
import { ChatTextField } from "@/components/chat/ChatTextField";
import { TaskDivider } from "@/components/chat/TaskDivider";
import { UserMessage } from "@/components/chat/UserMessage";
import { Artifact, Message } from "@/types";

interface TaskDividerItem {
  kind: "task-divider";
  taskId: string;
}

type ChatItem = Message | Artifact | TaskDividerItem;

interface ChatProps {
  context?: Context;
  pendingMessage: Message | null;
  scrollToTaskId?: string;
  scrollToArtifactId?: string;
  onScrollComplete: () => void;
  onSendMessage: (message: string) => void;
  loading: boolean;
  textFieldValue: string;
  onTextFieldChange: (value: string) => void;
}

export const Chat: React.FC<ChatProps> = ({
  context,
  pendingMessage,
  scrollToTaskId,
  scrollToArtifactId,
  onScrollComplete,
  onSendMessage,
  loading,
  textFieldValue,
  onTextFieldChange,
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const taskRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
  const artifactRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

  // Get chat items (messages, artifacts, and task dividers) from the context and pending message
  const chatItems: ChatItem[] = React.useMemo(() => {
    const chatItems2: ChatItem[] = [];

    if (context) {
      for (const task of context.tasks) {
        // Add task divider at the start of each task
        chatItems2.push({
          kind: "task-divider",
          taskId: task.id,
        });

        // Add messages from task history
        if (task.history) {
          chatItems2.push(...task.history);
        }

        // Add the latest status message if it exists
        if (task.status.message) {
          chatItems2.push(task.status.message);
        }

        // Add artifacts if they exist
        if (task.artifacts) {
          chatItems2.push(...task.artifacts);
        }
      }
    }

    // Add pending message for immediate display
    if (pendingMessage) {
      chatItems2.push(pendingMessage);
    }

    return chatItems2;
  }, [context, pendingMessage]);

  const handleSendMessage = (message: string): void => {
    onSendMessage(message);
  };

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTask = (taskId: string): void => {
    const element = taskRefs.current.get(taskId);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => onScrollComplete(), 500);
    }
  };

  const scrollToArtifact = (artifactId: string): void => {
    const element = artifactRefs.current.get(artifactId);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => onScrollComplete(), 500);
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [chatItems]);

  React.useEffect(() => {
    if (scrollToTaskId) {
      scrollToTask(scrollToTaskId);
    }
  }, [scrollToTaskId]);

  React.useEffect(() => {
    if (scrollToArtifactId) {
      scrollToArtifact(scrollToArtifactId);
    }
  }, [scrollToArtifactId]);

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        height: "100%",
        overflow: "auto",
      }}
    >
      {/* Messages */}
      {/* `ChatTextField` height */}
      <Container maxWidth="md" sx={{ py: 2, minHeight: "calc(100% - 81px)" }}>
        {chatItems.map((item: ChatItem) => {
          if ("kind" in item && item.kind === "task-divider") {
            const taskDividerItem: TaskDividerItem = item as TaskDividerItem;

            return (
              <Box key={taskDividerItem.taskId} sx={{ mb: 4 }}>
                <TaskDivider
                  taskId={taskDividerItem.taskId}
                  onRef={(el) => {
                    if (el) {
                      taskRefs.current.set(taskDividerItem.taskId, el);
                    }
                  }}
                />
              </Box>
            );
          } else if ("kind" in item && item.kind === "message") {
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
              <Box
                key={artifact.artifactId}
                sx={{ mb: 4 }}
                ref={(el: HTMLDivElement | null) => {
                  if (el) {
                    artifactRefs.current.set(artifact.artifactId, el);
                  }
                }}
              >
                <ArtifactCard artifact={artifact} />
              </Box>
            );
          }
        })}
        <div ref={messagesEndRef} />
      </Container>

      {/* Chat Text Field */}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
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
