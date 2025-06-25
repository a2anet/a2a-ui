import { DataPart, Message, TextPart } from "@a2a-js/sdk";
import { Box } from "@mui/material";

import { TextDataPartMarkdown } from "@/components/chat/TextDataPartMarkdown";

interface AIMessageProps {
  message: Message;
}

export const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
  const textDataParts: (TextPart | DataPart)[] = message.parts.filter(
    (part) => part.kind === "text" || part.kind === "data"
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-start",
      }}
    >
      {textDataParts.map((part, index) => (
        <TextDataPartMarkdown key={index} part={part} />
      ))}
    </Box>
  );
};
