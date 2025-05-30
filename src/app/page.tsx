"use client";

import React from "react";

import { Chat } from "@/components/chat/Chat";
import { Message } from "@/types";

export default function Home() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleSendMessage = (messageText: string): void => {
    const newUserMessage: Message = {
      role: "user",
      parts: [{ kind: "text", text: messageText }],
      messageId: `user-${Date.now()}`,
      kind: "message",
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse: Message = {
        role: "agent",
        parts: [{ kind: "text", text: "This is a demo response from the AI agent." }],
        messageId: `agent-${Date.now()}`,
        kind: "message",
      };

      setMessages((prev) => [...prev, aiResponse]);
      setLoading(false);
    }, 1000);
  };

  return <Chat messages={messages} onSendMessage={handleSendMessage} loading={loading} />;
}
