import { Box, Paper } from "@mui/material";

import { MessageTypography } from "@/components/chat/MessageTypography";
import { Message } from "@/types";

interface UserMessageProps {
  message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        mb: 2,
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
        <MessageTypography message={message} />
      </Paper>
    </Box>
  );
};
