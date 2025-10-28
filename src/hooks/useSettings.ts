import React from "react";

import { parseCustomHeaders } from "@/lib/env";

export interface CustomHeader {
  id: string;
  key: string;
  value: string;
}

export interface UseSettingsReturn {
  customHeaders: CustomHeader[];
  addCustomHeader: () => void;
  updateCustomHeader: (id: string, key: string, value: string) => void;
  removeCustomHeader: (id: string) => void;
  getHeadersObject: () => Record<string, string>;
}

export const useSettings = (): UseSettingsReturn => {
  const [customHeaders, setCustomHeaders] = React.useState<CustomHeader[]>(() =>
    parseCustomHeaders(process.env.NEXT_PUBLIC_DEFAULT_HEADERS)
  );

  const addCustomHeader = (): void => {
    const newHeader: CustomHeader = {
      id: crypto.randomUUID(),
      key: "",
      value: "",
    };
    setCustomHeaders([...customHeaders, newHeader]);
  };

  const updateCustomHeader = (id: string, key: string, value: string): void => {
    const updated = customHeaders.map((header) =>
      header.id === id ? { ...header, key, value } : header
    );
    setCustomHeaders(updated);
  };

  const removeCustomHeader = (id: string): void => {
    setCustomHeaders(customHeaders.filter((header) => header.id !== id));
  };

  const getHeadersObject = (): Record<string, string> => {
    return customHeaders
      .filter((header) => header.key.trim() !== "")
      .reduce((acc, header) => {
        acc[header.key] = header.value;

        return acc;
      }, {} as Record<string, string>);
  };

  return {
    customHeaders,
    addCustomHeader,
    updateCustomHeader,
    removeCustomHeader,
    getHeadersObject,
  };
};
