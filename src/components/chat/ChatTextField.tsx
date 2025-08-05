import { ArrowUpward, Stop } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import React from "react";

interface ChatTextFieldProps {
  value: string;
  loading?: boolean;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onSendMessage: (message: string) => void;
}

export const ChatTextField: React.FC<ChatTextFieldProps> = ({
  value,
  loading = false,
  autoFocus = false,
  onChange,
  onSendMessage,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = (): void => {
    if (value.trim() && !loading) {
      onSendMessage(value.trim());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent): void => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // Focus the text field when autoFocus changes to true
  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <TextField
      inputRef={inputRef}
      value={value}
      onChange={handleChange}
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
                disabled={!value.trim() && !loading}
                sx={{
                  bgcolor: loading ? "background.default" : "text.primary",
                  color: loading ? "text.primary" : "background.default",
                  width: 32,
                  height: 32,
                  "&:hover": {
                    bgcolor: loading ? "background.default.hover" : "text.secondary",
                  },
                  "&:disabled": {
                    bgcolor: "action.disabledBackground",
                    color: "action.disabled",
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
