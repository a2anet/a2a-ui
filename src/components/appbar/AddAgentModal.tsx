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
  onClose: () => void;
  addAgentByUrl: (url: string) => Promise<void>;
}

export const AddAgentModal: React.FC<AddAgentModalProps> = ({ open, onClose, addAgentByUrl }) => {
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
      await addAgentByUrl(url.trim());
      handleClose();
    } catch (error) {
      console.error("Error adding agent:", error);
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
            Enter the base URL (e.g. https://example.com) or full URL (e.g.
            https://example.com/.well-known/agent-card.json) of the Agent Card.
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
