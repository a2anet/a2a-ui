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
import { Task, TaskState } from "@/types";

export const drawerWidth = 300;

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
    switch (state) {
      case TaskState.Submitted:
        return "Submitted";
      case TaskState.Working:
        return "Working";
      case TaskState.InputRequired:
        return "Input Required";
      case TaskState.Completed:
        return "Completed";
      case TaskState.Canceled:
        return "Canceled";
      case TaskState.Failed:
        return "Failed";
      case TaskState.Rejected:
        return "Rejected";
      case TaskState.AuthRequired:
        return "Auth Required";
      case TaskState.Unknown:
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

      <Box sx={{ p: 2 }}>
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
                <ListItem key={context.contextId} disablePadding>
                  <ListItemButton
                    selected={selectedContextId === context.contextId}
                    onClick={() => onContextSelect(context.contextId)}
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
                  <ListItem key={task.id} disablePadding>
                    <ListItemButton
                      selected={selectedTaskId === task.id}
                      onClick={() => onTaskSelect(task.id)}
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
                  <ListItem key={artifact.artifactId} disablePadding>
                    <ListItemButton
                      selected={selectedArtifactId === artifact.artifactId}
                      onClick={() => onArtifactSelect(artifact.artifactId)}
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
