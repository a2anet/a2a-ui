import { A2AClient, AgentCard } from "@a2a-js/sdk";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";

interface AddAgentModalProps {
  open: boolean;
  onAgentAdded: (agent: AgentCard) => void;
  onClose: () => void;
  onError: (message: string) => void;
}

export const AddAgentModal: React.FC<AddAgentModalProps> = ({
  open,
  onAgentAdded,
  onClose,
  onError,
}) => {
  const [url, setUrl] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleClose = (): void => {
    setUrl("");
    setLoading(false);
    onClose();
  };

  const handleAddAgent = async (): Promise<void> => {
    if (!url.trim()) {
      return;
    }

    setLoading(true);

    try {
      // Fetch the agent card
      const client: A2AClient = new A2AClient(url);
      const agentCard: AgentCard = await client.getAgentCard();
      onAgentAdded(agentCard);
      handleClose();
    } catch (error) {
      console.error("Error adding agent:", error);
      onError("Failed to fetch agent card. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent): void => {
    if (event.key === "Enter" && !loading) {
      handleAddAgent();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Agent</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the base URL of the agent to add it to your list. The agent card will be
            automatically fetched from the /.well-known/agent.json endpoint.
          </Typography>

          <TextField
            label="Agent URL"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            autoFocus
            fullWidth
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>

        <Button
          onClick={handleAddAgent}
          disabled={!url.trim()}
          loading={loading}
          variant="contained"
        >
          Add Agent
        </Button>
      </DialogActions>
    </Dialog>
  );
};
