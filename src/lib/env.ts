import { CustomHeader } from "@/hooks/useSettings";

/**
 * Gets the default app name from environment variable or fallback
 */
export const getDefaultAppName = (): string => {
  return process.env.NEXT_PUBLIC_DEFAULT_APP_NAME || "A2A Net";
};

/**
 * Gets the default app icon path from environment variable or fallback
 */
export const getDefaultAppIcon = (): string => {
  return process.env.NEXT_PUBLIC_DEFAULT_APP_ICON || "/logo.png";
};

/**
 * Parses a comma-separated list of agent URLs from an environment variable
 */
export const parseAgentUrls = (envVar: string | undefined): string[] => {
  if (!envVar || !envVar.trim()) {
    return [];
  }

  return envVar
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
};

/**
 * Parses a JSON object of custom headers from an environment variable
 */
export const parseCustomHeaders = (envVar: string | undefined): CustomHeader[] => {
  if (!envVar || !envVar.trim()) {
    return [];
  }

  try {
    const headersObj: Record<string, string> = JSON.parse(envVar);

    return Object.entries(headersObj).map(([key, value]) => ({
      id: crypto.randomUUID(),
      key,
      value,
    }));
  } catch (error) {
    console.error("Failed to parse NEXT_PUBLIC_DEFAULT_HEADERS:", error);
    return [];
  }
};
