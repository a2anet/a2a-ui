"use client";

import { createTheme } from "@mui/material/styles";
import { Inter } from "next/font/google";

const inter = Inter({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: {
    colorSchemeSelector: "class",
  },
  palette: {
    primary: {
      main: "#222",
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;
