import {
  Add,
  Chat as ChatIcon,
  KeyboardArrowDown,
  Menu as MenuIcon,
  Settings,
} from "@mui/icons-material";
import {
  Avatar,
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
import { SettingsModal } from "@/components/appbar/SettingsModal";
import { drawerWidth } from "@/components/sidebar/Sidebar";
import { CustomHeader } from "@/hooks/useSettings";
import { AgentCard } from "@a2a-js/sdk";

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
  agents: AgentCard[];
  activeAgent: AgentCard | null;
  sidebarOpen: boolean;
  customHeaders: CustomHeader[];
  addAgentByUrl: (url: string) => Promise<void>;
  onAgentSelect: (agent: AgentCard) => void;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onAddHeader: () => void;
  onUpdateHeader: (id: string, key: string, value: string) => void;
  onRemoveHeader: (id: string) => void;
}

export const AppBar: React.FC<AppBarProps> = ({
  agents,
  activeAgent,
  sidebarOpen,
  customHeaders,
  addAgentByUrl,
  onAgentSelect,
  onToggleSidebar,
  onNewChat,
  onAddHeader,
  onUpdateHeader,
  onRemoveHeader,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [addAgentModalOpen, setAddAgentModalOpen] = React.useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = React.useState<boolean>(false);
  const [failedIcons, setFailedIcons] = React.useState<Set<string>>(new Set());
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

  const handleAgentSelect = (agent: AgentCard): void => {
    onAgentSelect(agent);
    onNewChat();
    handleClose();
  };

  const getAgentIconUrl = (agent: AgentCard | null | undefined): string => {
    const agentIcon: string | undefined = agent?.iconUrl;

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

  const agentButtonText = activeAgent?.name ?? "A2A Net";

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
                startIcon={
                  <Avatar
                    src={getAgentIconUrl(activeAgent)}
                    sx={{ width: 32, height: 32 }}
                    alt={agentButtonText}
                    onError={() => handleIconError(activeAgent?.iconUrl)}
                  />
                }
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

            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={() => setSettingsModalOpen(true)} sx={{ color: "text.primary" }}>
                <Settings />
              </IconButton>

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
            </Box>
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
              key={agent.url}
              onClick={() => handleAgentSelect(agent)}
              selected={activeAgent?.url === agent.url}
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
              <Avatar
                src={getAgentIconUrl(agent)}
                alt={agent.name}
                onError={() => handleIconError(agent.iconUrl)}
                sx={{ mr: 2 }}
              />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: 1,
                }}
              >
                <Typography variant="subtitle2">{agent.name}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: 1,
                  }}
                >
                  {agent.description}
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

      <SettingsModal
        open={settingsModalOpen}
        customHeaders={customHeaders}
        onClose={() => setSettingsModalOpen(false)}
        onAddHeader={onAddHeader}
        onUpdateHeader={onUpdateHeader}
        onRemoveHeader={onRemoveHeader}
      />
    </>
  );
};
