"use client";

import { Alert, Snackbar } from "@mui/material";
import React from "react";

import { useToast, type ToastSeverity } from "@/hooks/useToast";

interface ToastContextValue {
  showToast: (message: string, severity?: ToastSeverity) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toast = useToast();

  const contextValue: ToastContextValue = {
    showToast: toast.showToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={toast.toastOpen}
        onClose={toast.handleToastClose}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={toast.handleToastClose}
          severity={toast.toastSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.toastMessage}
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
