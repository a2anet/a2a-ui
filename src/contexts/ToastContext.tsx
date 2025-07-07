"use client";

import { Alert, Snackbar } from "@mui/material";
import React from "react";

export type ToastSeverity = "error" | "warning" | "info" | "success";

interface ToastContextValue {
  showToast: (message: string, severity?: ToastSeverity) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastOpen, setToastOpen] = React.useState<boolean>(false);
  const [toastMessage, setToastMessage] = React.useState<string>("");
  const [toastSeverity, setToastSeverity] = React.useState<ToastSeverity>("error");

  const showToast = (message: string, severity: ToastSeverity = "error"): void => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleToastClose = (event?: React.SyntheticEvent | Event, reason?: string): void => {
    if (reason === "clickaway") {
      return;
    }

    setToastOpen(false);
  };

  const contextValue: ToastContextValue = {
    showToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={toastOpen}
        onClose={handleToastClose}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toastSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToastContext = (): ToastContextValue => {
  const context = React.useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }

  return context;
};
