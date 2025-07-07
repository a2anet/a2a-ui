import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";

interface LoadingProps {
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ text = "Loading" }) => {
  const [loadingDots, setLoadingDots] = React.useState<string>(".");

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLoadingDots((prev) => {
        switch (prev) {
          case "":
            return ".";
          case ".":
            return "..";
          case "..":
            return "...";
          default:
            return "";
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "bottom" }}>
      <CircularProgress size={24} />
      <Typography variant="body1" sx={{ ml: 2 }}>
        {text}
        {loadingDots}
      </Typography>
    </Box>
  );
};
