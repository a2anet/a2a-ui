import { ArrowUpward, Stop } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import React from "react";

interface ChatTextFieldProps {
  onSendMessage: (message: string) => void;
  loading?: boolean;
}

export const ChatTextField: React.FC<ChatTextFieldProps> = ({ onSendMessage, loading = false }) => {
  const [message, setMessage] = React.useState<string>("");

  const handleSend = (): void => {
    if (message.trim() && !loading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent): void => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <TextField
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyDown={handleKeyPress}
      fullWidth
      multiline
      minRows={1}
      maxRows={9}
      placeholder="Ask anything"
      variant="outlined"
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 5,
          bgcolor: "background.paper",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "divider",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "divider",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "divider",
          },
        },
      }}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end" sx={{ alignSelf: "flex-end" }}>
              <IconButton
                onClick={handleSend}
                disabled={!message.trim() && !loading}
                sx={{
                  bgcolor: loading ? "grey.400" : "grey.900",
                  color: "white",
                  width: 32,
                  height: 32,
                  "&:hover": {
                    bgcolor: loading ? "grey.500" : "grey.800",
                  },
                  "&:disabled": {
                    bgcolor: "grey.300",
                    color: "grey.500",
                  },
                }}
              >
                {loading ? <Stop fontSize="small" /> : <ArrowUpward fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};
