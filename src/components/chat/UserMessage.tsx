import { Paper } from "@mui/material";

import { TextDataPartMarkdown } from "@/components/chat/TextDataPartMarkdown";
import { DataPart, Message, TextPart } from "@/types/agent";

interface UserMessageProps {
  message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  const textDataParts: (TextPart | DataPart)[] = message.parts.filter(
    (part) => part.kind === "text" || part.kind === "data"
  );

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "grey.100",
        p: 2,
        borderRadius: 5,
      }}
    >
      {textDataParts.map((part, index) => (
        <TextDataPartMarkdown key={index} part={part} />
      ))}
    </Paper>
  );
};
