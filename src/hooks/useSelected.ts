import React from "react";

export interface UseSelectedReturn {
  selectedContextId: string | undefined;
  selectedTaskId: string | undefined;
  selectedArtifactId: string | undefined;
  setSelectedContextId: (contextId: string | undefined) => void;
  setSelectedTaskId: (taskId: string | undefined) => void;
  setSelectedArtifactId: (artifactId: string | undefined) => void;
}

export const useSelected = (): UseSelectedReturn => {
  const [selectedContextId, setSelectedContextId] = React.useState<string | undefined>(undefined);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | undefined>(undefined);
  const [selectedArtifactId, setSelectedArtifactId] = React.useState<string | undefined>(undefined);

  return {
    selectedContextId,
    selectedTaskId,
    selectedArtifactId,
    setSelectedContextId,
    setSelectedTaskId,
    setSelectedArtifactId,
  };
};
