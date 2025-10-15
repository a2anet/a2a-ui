import { Add, Chat as ChatIcon, KeyboardArrowDown, Menu as MenuIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  AppBar as MuiAppBar,
  AppBarProps as MuiAppBarProps,
  Toolbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

import { AddAgentModal } from "@/components/appbar/AddAgentModal";
import { drawerWidth } from "@/components/sidebar/Sidebar";
import { AgentCard } from "@a2a-js/sdk";
import { AgentWithAuth } from "@/types/agent";

interface StyledAppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<StyledAppBarProps>(({ theme }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

interface AppBarProps {
  agents: AgentWithAuth[];
  activeAgent: AgentWithAuth | null;
  sidebarOpen: boolean;
  addAgentByUrl: (url: string, authToken?: string) => Promise<void>;
  onAgentSelect: (agent: AgentWithAuth) => void;
  onToggleSidebar: () => void;
  onNewChat: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({
  agents,
  activeAgent,
  sidebarOpen,
  addAgentByUrl,
  onAgentSelect,
  onToggleSidebar,
  onNewChat,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [addAgentModalOpen, setAddAgentModalOpen] = React.useState<boolean>(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    // Only open menu if there are agents
    if (agents.length > 0) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleAgentSelect = (agent: AgentWithAuth): void => {
    onAgentSelect(agent);
    onNewChat();
    handleClose();
  };

  const agentButtonText = activeAgent?.agentCard.name ?? "A2A Net";

  return (
    <>
      <StyledAppBar
        position="fixed"
        open={sidebarOpen}
        color="transparent"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth="md">
          <Toolbar sx={{ justifyContent: "space-between", px: { xs: 0 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!sidebarOpen && (
                <>
                  <IconButton onClick={onToggleSidebar} sx={{ color: "text.primary" }}>
                    <MenuIcon />
                  </IconButton>

                  <IconButton onClick={onNewChat} sx={{ color: "text.primary" }}>
                    <ChatIcon />
                  </IconButton>
                </>
              )}

              <Button
                onClick={handleClick}
                variant="text"
                endIcon={agents.length > 0 ? <KeyboardArrowDown /> : undefined}
                sx={{
                  textTransform: "none",
                  color: "text.primary",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Typography variant="h6" component="span">
                  {agentButtonText}
                </Typography>
              </Button>
            </Box>

            <Button
              onClick={() => setAddAgentModalOpen(true)}
              variant="outlined"
              startIcon={<Add />}
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
              Agent
            </Button>
          </Toolbar>
        </Container>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: 3,
            },
          }}
        >
          {agents.map((agent) => (
            <MenuItem
              key={agent.agentCard.url}
              onClick={() => handleAgentSelect(agent)}
              selected={activeAgent?.agentCard.url === agent.agentCard.url}
              sx={{
                width: 420,
                mx: 1,
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
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: 1,
                }}
              >
                <Typography variant="subtitle2">{agent.agentCard.name}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: 1,
                  }}
                >
                  {agent.agentCard.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </StyledAppBar>

      <AddAgentModal
        open={addAgentModalOpen}
        onClose={() => setAddAgentModalOpen(false)}
        addAgentByUrl={addAgentByUrl}
      />
    </>
  );
};
