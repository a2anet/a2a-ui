import React from "react";

export interface UseScrollingReturn {
  scrollToTaskId: string | undefined;
  scrollToArtifactId: string | undefined;
  setScrollToTaskId: (taskId: string | undefined) => void;
  setScrollToArtifactId: (artifactId: string | undefined) => void;
}

export const useScrolling = (): UseScrollingReturn => {
  const [scrollToTaskId, setScrollToTaskId] = React.useState<string | undefined>(undefined);
  const [scrollToArtifactId, setScrollToArtifactId] = React.useState<string | undefined>(undefined);

  return {
    scrollToTaskId,
    scrollToArtifactId,
    setScrollToTaskId,
    setScrollToArtifactId,
  };
};
