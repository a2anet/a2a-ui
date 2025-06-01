import { Typography } from "@mui/material";

import { Message, Part, TextPart } from "@/types";

interface MessageTypographyProps {
  message: Message;
}

export const MessageTypography: React.FC<MessageTypographyProps> = ({ message }) => {
  const textContent: string = message.parts
    .filter((part: Part) => part.kind === "text")
    .map((part: TextPart) => part.text)
    .join(" ");

  return (
    <Typography
      sx={{
        whiteSpace: "pre-wrap",
      }}
    >
      {textContent}
    </Typography>
  );
};
