import { Task, TaskState } from "@a2a-js/sdk";
import { Chat as ChatIcon, ChevronLeft } from "@mui/icons-material";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

import { ChatContext } from "@/hooks/useContextManager";

export const drawerWidth = 280;

interface SidebarProps {
  open: boolean;
  contexts: ChatContext[];
  selectedContextId: string | undefined;
  selectedTaskId: string | undefined;
  selectedArtifactId: string | undefined;
  onContextSelect: (contextId: string) => void;
  onTaskSelect: (taskId: string) => void;
  onArtifactSelect: (artifactId: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  contexts,
  selectedContextId,
  selectedTaskId,
  selectedArtifactId,
  onContextSelect,
  onTaskSelect,
  onArtifactSelect,
  onNewChat,
  onClose,
}) => {
  const getTaskStateText = (state: TaskState): string => {
    // export type TaskState = "submitted" | "working" | "input-required" | "completed" | "canceled" | "failed" | "rejected" | "auth-required" | "unknown";
    switch (state) {
      case "submitted":
        return "Submitted";
      case "working":
        return "Working";
      case "input-required":
        return "Input Required";
      case "completed":
        return "Completed";
      case "canceled":
        return "Canceled";
      case "failed":
        return "Failed";
      case "rejected":
        return "Rejected";
      case "auth-required":
        return "Auth Required";
      case "unknown":
        return "Unknown";
      default:
        return "Unknown";
    }
  };

  const selectedContext: ChatContext | undefined = contexts.find(
    (context) => context.contextId === selectedContextId
  );
  const selectedTask: Task | undefined =
    selectedContext && selectedTaskId
      ? selectedContext.tasks.find((task) => task.id === selectedTaskId)
      : undefined;

  return (
    <Drawer
      open={open}
      variant="persistent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          borderRight: 1,
          boxSizing: "border-box",
          borderColor: "divider",
        },
      }}
    >
      <DrawerHeader>
        <IconButton onClick={onClose}>
          <ChevronLeft />
        </IconButton>
      </DrawerHeader>

      <Box sx={{ p: 1 }}>
        <Button
          onClick={onNewChat}
          variant="outlined"
          startIcon={<ChatIcon />}
          fullWidth
          sx={{
            textTransform: "none",
            justifyContent: "flex-start",
            borderColor: "divider",
            color: "text.primary",
            "&:hover": {
              borderColor: "text.primary",
              bgcolor: "action.hover",
            },
          }}
        >
          New chat
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {contexts && contexts.length > 0 && (
          <>
            <List subheader={<ListSubheader>Contexts</ListSubheader>}>
              {contexts.toReversed().map((context) => (
                <ListItem key={context.contextId} disablePadding sx={{ px: 1 }}>
                  <ListItemButton
                    selected={selectedContextId === context.contextId}
                    onClick={() => onContextSelect(context.contextId)}
                    sx={{
                      borderRadius: 3,
                      bgcolor: "background.paper",
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                      "&.Mui-selected": {
                        bgcolor: "action.selected",
                        "&:hover": {
                          bgcolor: "action.selected",
                        },
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" noWrap>
                          {context.contextId}
                        </Typography>
                      }
                      secondary={context.agent.name}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {selectedContext && selectedContext.tasks && selectedContext.tasks.length > 0 && (
              <List subheader={<ListSubheader>Tasks</ListSubheader>}>
                {selectedContext.tasks.map((task) => (
                  <ListItem key={task.id} disablePadding sx={{ px: 1 }}>
                    <ListItemButton
                      selected={selectedTaskId === task.id}
                      onClick={() => onTaskSelect(task.id)}
                      sx={{
                        borderRadius: 3,
                        bgcolor: "background.paper",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                        "&.Mui-selected": {
                          bgcolor: "action.selected",
                          "&:hover": {
                            bgcolor: "action.selected",
                          },
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" noWrap>
                            {task.id}
                          </Typography>
                        }
                        secondary={getTaskStateText(task.status.state)}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}

            {selectedTask && selectedTask.artifacts && selectedTask.artifacts.length > 0 && (
              <List subheader={<ListSubheader>Artifacts</ListSubheader>}>
                {selectedTask.artifacts.map((artifact) => (
                  <ListItem key={artifact.artifactId} disablePadding sx={{ px: 1 }}>
                    <ListItemButton
                      selected={selectedArtifactId === artifact.artifactId}
                      onClick={() => onArtifactSelect(artifact.artifactId)}
                      sx={{
                        borderRadius: 3,
                        bgcolor: "background.paper",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                        "&.Mui-selected": {
                          bgcolor: "action.selected",
                          "&:hover": {
                            bgcolor: "action.selected",
                          },
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" noWrap>
                            {artifact.artifactId}
                          </Typography>
                        }
                        secondary={artifact.name}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </Box>
    </Drawer>
  );
};
