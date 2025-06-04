import { Box, Button, Divider } from "@mui/material";
import React from "react";

interface TaskDividerProps {
  taskId: string;
  onClick?: (taskId: string) => void;
  onRef?: (element: HTMLDivElement | null) => void;
}

export const TaskDivider: React.FC<TaskDividerProps> = ({ taskId, onClick, onRef }) => {
  const handleClick = (): void => {
    if (onClick) {
      onClick(taskId);
    }
  };

  return (
    <Box
      ref={onRef}
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Divider sx={{ flex: 1 }} />

      <Button
        variant="outlined"
        size="small"
        onClick={handleClick}
        sx={{
          textTransform: "none",
          borderColor: "divider",
          color: "text.primary",
          "&:hover": {
            borderColor: "text.primary",
            bgcolor: "action.hover",
          },
        }}
      >
        Task {taskId}
      </Button>

      <Divider sx={{ flex: 1 }} />
    </Box>
  );
};
