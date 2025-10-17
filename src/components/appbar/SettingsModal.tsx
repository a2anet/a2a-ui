import { Add, Delete } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";

import { CustomHeader } from "@/hooks/useSettings";

interface SettingsModalProps {
  open: boolean;
  customHeaders: CustomHeader[];
  onClose: () => void;
  onAddHeader: () => void;
  onUpdateHeader: (id: string, key: string, value: string) => void;
  onRemoveHeader: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  customHeaders,
  onClose,
  onAddHeader,
  onUpdateHeader,
  onRemoveHeader,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Custom Headers
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Add custom headers to send with every message request.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              {customHeaders.map((header) => (
                <Box
                  key={header.id}
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <TextField
                    label="Header Name"
                    value={header.key}
                    onChange={(e) => onUpdateHeader(header.id, e.target.value, header.value)}
                    size="small"
                    placeholder="X-Custom-Header"
                    fullWidth
                  />

                  <TextField
                    label="Header Value"
                    value={header.value}
                    onChange={(e) => onUpdateHeader(header.id, header.key, e.target.value)}
                    size="small"
                    placeholder="value"
                    fullWidth
                  />

                  <IconButton onClick={() => onRemoveHeader(header.id)} size="small">
                    <Delete />
                  </IconButton>
                </Box>
              ))}

              <Button
                onClick={onAddHeader}
                startIcon={<Add />}
                variant="outlined"
                sx={{ alignSelf: "flex-start" }}
              >
                Add Header
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
