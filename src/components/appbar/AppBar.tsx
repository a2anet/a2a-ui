import { Add, KeyboardArrowDown } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
  Menu,
  MenuItem,
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";

import { AgentCard } from "@/types";

interface AppBarProps {
  agents: AgentCard[];
  activeAgent: AgentCard | null;
  onAgentSelect: (agent: AgentCard) => void;
  onAddAgent: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({
  agents,
  activeAgent,
  onAgentSelect,
  onAddAgent,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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
    handleClose();
  };

  const agentButtonText = activeAgent?.name ?? "A2A Net";

  return (
    <MuiAppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={{ bgcolor: "background.default", borderBottom: 1, borderColor: "divider" }}
    >
      <Container maxWidth="md">
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 0 } }}>
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

          <Button
            onClick={onAddAgent}
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
      >
        {agents.map((agent) => (
          <MenuItem
            key={agent.url}
            onClick={() => handleAgentSelect(agent)}
            selected={activeAgent?.url === agent.url}
            sx={{ minWidth: 280 }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <Typography variant="subtitle2">{agent.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {agent.description}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                <Chip label={`v${agent.version}`} size="small" variant="outlined" />
                {agent.provider && (
                  <Chip label={agent.provider.organization} size="small" variant="outlined" />
                )}
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </MuiAppBar>
  );
};
