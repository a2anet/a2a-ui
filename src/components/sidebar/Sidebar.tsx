import { Chat as ChatIcon, ChevronLeft } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

import { ChatContext } from "@/types/chat";
import { Task, TaskState } from "@a2a-js/sdk";

export const drawerWidth = 280;

interface SidebarProps {
  open: boolean;
  chatContexts: { [contextId: string]: ChatContext };
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
  chatContexts,
  selectedContextId,
  selectedTaskId,
  selectedArtifactId,
  onContextSelect,
  onTaskSelect,
  onArtifactSelect,
  onNewChat,
  onClose,
}) => {
  const [failedIcons, setFailedIcons] = React.useState<Set<string>>(new Set());

  const getAgentIconUrl = (context: ChatContext): string => {
    const agentIcon: string | undefined = context.agent.iconUrl;

    if (!agentIcon || failedIcons.has(agentIcon)) {
      return "/logo.png";
    }

    return agentIcon;
  };

  const handleIconError = (iconUrl: string | undefined): void => {
    if (!iconUrl) {
      return;
    }

    setFailedIcons((prev) => new Set(prev).add(iconUrl));
  };

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

  const selectedContext: ChatContext | undefined = selectedContextId
    ? chatContexts[selectedContextId]
    : undefined;

  const selectedTask: Task | undefined =
    selectedContext && selectedTaskId
      ? selectedContext.messagesAndTasks.find(
          (item): item is Task => item.kind === "task" && (item as Task).id === selectedTaskId
        )
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
        {chatContexts && Object.keys(chatContexts).length > 0 && (
          <>
            <List subheader={<ListSubheader>Contexts</ListSubheader>}>
              {Object.values(chatContexts)
                .toReversed()
                .map((context) => (
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
                      <ListItemAvatar>
                        <Avatar
                          src={getAgentIconUrl(context)}
                          alt={context.agent.name}
                          onError={() => handleIconError(context.agent.iconUrl)}
                        />
                      </ListItemAvatar>

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

            {selectedContext &&
              selectedContext.messagesAndTasks &&
              selectedContext.messagesAndTasks.some(
                (item): item is Task => item.kind === "task"
              ) && (
                <List subheader={<ListSubheader>Tasks</ListSubheader>}>
                  {selectedContext.messagesAndTasks
                    .filter((item): item is Task => item.kind === "task")
                    .map((task: Task) => (
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
