"use client";

import { Box, Container } from "@mui/material";
import React from "react";

import { AIMessage } from "@/components/chat/AIMessage";
import { ArtifactAccordion } from "@/components/chat/ArtifactAccordion";
import { ChatTextField } from "@/components/chat/ChatTextField";
import { Loading } from "@/components/chat/Loading";
import { TaskDivider } from "@/components/chat/TaskDivider";
import { ToolCallAccordion } from "@/components/chat/ToolCallAccordion";
import { UserMessage } from "@/components/chat/UserMessage";
import { Artifact, Message } from "@/types/agent";
import { ChatContext } from "@/types/chat";

interface TaskDividerItem {
  kind: "task-divider";
  taskId: string;
}

interface ToolCallItem {
  kind: "tool-call";
  toolCallMessage: Message;
  toolCallResultMessage: Message | undefined;
}

type ChatItem = Message | Artifact | TaskDividerItem | ToolCallItem;

interface ChatProps {
  activeChatContext?: ChatContext;
  scrollToTaskId?: string;
  scrollToArtifactId?: string;
  currentMessageText: string;
  autoFocusChatTextField?: boolean;
  onSendMessage: (message: string) => void;
  onChatTextFieldChange: (value: string) => void;
}

export const Chat: React.FC<ChatProps> = ({
  activeChatContext,
  scrollToTaskId,
  scrollToArtifactId,
  currentMessageText,
  autoFocusChatTextField = false,
  onSendMessage,
  onChatTextFieldChange,
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const taskRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
  const artifactRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

  // Get chat items (messages, artifacts, and task dividers) from the context and pending message
  const chatItems: ChatItem[] = React.useMemo(() => {
    const chatItems2: ChatItem[] = [];

    if (activeChatContext) {
      for (const task of activeChatContext.tasks) {
        // Add task divider at the start of each task
        chatItems2.push({
          kind: "task-divider",
          taskId: task.id,
        });

        // Combine history with status message
        let messages: Message[] = [];

        if (task.history) {
          messages = [...task.history];
        }

        if (task.status.message) {
          messages.push(task.status.message);
        }

        // Add messages to chat items
        for (const message of messages) {
          if (!message.metadata?.type) {
            chatItems2.push(message);
          } else if (message.metadata?.type === "tool-call") {
            const toolCallId: string = message.metadata.toolCallId as string;

            const toolCallResultMessage: Message | undefined = messages.find(
              (message) =>
                message.metadata?.type === "tool-call-result" &&
                message.metadata?.toolCallId === toolCallId
            );

            chatItems2.push({
              kind: "tool-call",
              toolCallMessage: message,
              toolCallResultMessage: toolCallResultMessage,
            });
          }
        }

        // Add artifacts if they exist
        if (task.artifacts) {
          chatItems2.push(...task.artifacts);
        }
      }

      // Add pending message for immediate display
      if (activeChatContext.pendingMessage) {
        chatItems2.push(activeChatContext.pendingMessage);
      }
    }

    return chatItems2;
  }, [activeChatContext]);

  const handleSendMessage = (message: string): void => {
    onSendMessage(message);
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatItems]);

  React.useEffect(() => {
    if (scrollToTaskId) {
      const element = taskRefs.current.get(scrollToTaskId);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [scrollToTaskId]);

  React.useEffect(() => {
    if (scrollToArtifactId) {
      const element = artifactRefs.current.get(scrollToArtifactId);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Box sx={{ maxWidth: "70%" }}>
                      <UserMessage message={message} />
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
                  >
                    <AIMessage message={message} />
                  </Box>
                )}
              </Box>
            );
          } else if ("kind" in item && item.kind === "tool-call") {
            const toolCallItem: ToolCallItem = item as ToolCallItem;

            return (
              <Box key={toolCallItem.toolCallMessage.messageId} sx={{ mb: 4 }}>
                <ToolCallAccordion
                  toolCallMessage={toolCallItem.toolCallMessage}
                  toolCallResultMessage={toolCallItem.toolCallResultMessage}
                />
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
                <ArtifactAccordion artifact={artifact} />
              </Box>
            );
          }
        })}

        {activeChatContext?.loading && (
          <Box sx={{ mb: 4 }}>
            <Loading />
          </Box>
        )}

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
            value={currentMessageText}
            loading={activeChatContext?.loading}
            autoFocus={autoFocusChatTextField}
            onChange={onChatTextFieldChange}
            onSendMessage={handleSendMessage}
          />
        </Container>
      </Box>
    </Box>
  );
};
