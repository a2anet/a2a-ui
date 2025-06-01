"use client";

import { Box, Card, CardContent, Divider, Typography } from "@mui/material";
import React from "react";

import { TextDataPartMarkdown } from "@/components/chat/TextDataPartMarkdown";
import { Artifact, Part } from "@/types";

interface ArtifactCardProps {
  artifact: Artifact;
}

const renderPart = (part: Part, index: number): React.ReactNode => {
  if (part.kind === "text" || part.kind === "data") {
    return <TextDataPartMarkdown key={index} part={part} />;
  } else {
    return null;
  }
};

export const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact }) => {
  return (
    <Card
      elevation={0}
      sx={{ mb: 2, border: "1px solid", borderColor: "divider", borderRadius: 5 }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Box sx={{ px: 2, pt: 2 }}>
          {artifact.name && (
            <Typography variant="h4" component="h3" gutterBottom>
              {artifact.name}
            </Typography>
          )}

          {artifact.description && (
            <Typography color="text.secondary" gutterBottom>
              {artifact.description}
            </Typography>
          )}
        </Box>

        {(artifact.name || artifact.description) && <Divider sx={{ my: 2 }} />}

        <Box sx={{ px: 2 }}>{artifact.parts.map((part, index) => renderPart(part, index))}</Box>
      </CardContent>
    </Card>
  );
};
