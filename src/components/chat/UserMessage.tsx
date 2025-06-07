import { Box, Paper, Typography } from "@mui/material";

import { Message, Part, TextPart } from "@/lib/a2a/types";

interface UserMessageProps {
  message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  const textParts: string = message.parts
    .filter((part: Part) => part.kind === "text")
    .map((part: TextPart) => part.text)
    .join(" ");

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          bgcolor: "grey.100",
          p: 2,
          maxWidth: "70%",
          borderRadius: 5,
        }}
      >
        <Typography
          sx={{
            whiteSpace: "pre-wrap",
          }}
        >
          {textParts}
        </Typography>
      </Paper>
    </Box>
  );
};
