import React from "react";

export type ToastSeverity = "error" | "warning" | "info" | "success";

interface UseToastReturn {
  toastOpen: boolean;
  toastMessage: string;
  toastSeverity: ToastSeverity;
  showToast: (message: string, severity?: ToastSeverity) => void;
  handleToastClose: (event?: React.SyntheticEvent | Event, reason?: string) => void;
}

export const useToast = (): UseToastReturn => {
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

  return {
    toastOpen,
    toastMessage,
    toastSeverity,
    showToast,
    handleToastClose,
  };
};
