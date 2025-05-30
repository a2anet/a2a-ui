import { Typography } from "@mui/material";

import { Message } from "@/types";

interface MessageTypographyProps {
  message: Message;
}

export const MessageTypography: React.FC<MessageTypographyProps> = ({ message }) => {
  const textContent: string = message.parts
    .filter((part) => part.kind === "text")
    .map((part) => (part as any).text)
    .join(" ");

  return (
    <Typography
      variant="body1"
      sx={{
        lineHeight: 1.5,
        whiteSpace: "pre-wrap",
      }}
    >
      {textContent}
    </Typography>
  );
};
