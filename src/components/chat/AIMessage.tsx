import { Box } from "@mui/material";

import { MessageTypography } from "@/components/chat/MessageTypography";
import { Message } from "@/types";

interface AIMessageProps {
  message: Message;
}

export const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-start",
        mb: 2,
      }}
    >
      <MessageTypography message={message} />
    </Box>
  );
};
