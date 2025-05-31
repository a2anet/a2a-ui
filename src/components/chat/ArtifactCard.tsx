"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";
import React from "react";

import { Artifact, Part } from "@/types";

interface ArtifactCardProps {
  artifact: Artifact;
}

const renderPart = (part: Part, index: number): React.ReactNode => {
  switch (part.kind) {
    case "text":
      return (
        <Typography key={index} sx={{ whiteSpace: "pre-wrap" }}>
          {part.text}
        </Typography>
      );
    case "data":
      return (
        <Typography key={index} sx={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(part.data, null, 4)}
        </Typography>
      );
    default:
      return null;
  }
};

export const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact }) => {
  return (
    <Card
      elevation={0}
      sx={{ mb: 2, border: "1px solid", borderColor: "divider", borderRadius: 5 }}
    >
      <CardContent>
        {artifact.name && (
          <Typography variant="h6" component="h3" gutterBottom>
            {artifact.name}
          </Typography>
        )}

        {artifact.description && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {artifact.description}
          </Typography>
        )}

        <Box>{artifact.parts.map((part, index) => renderPart(part, index))}</Box>
      </CardContent>
    </Card>
  );
};
