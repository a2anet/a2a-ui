"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import React from "react";

import { TextDataPartMarkdown } from "@/components/chat/TextDataPartMarkdown";
import { Artifact, Part } from "@a2a-js/sdk";

interface ArtifactAccordionProps {
  artifact: Artifact;
}

const renderPart = (part: Part, index: number): React.ReactNode => {
  if (part.kind === "text") {
    return (
      <Box key={index} sx={{ pb: 2 }}>
        <TextDataPartMarkdown key={index} part={part} />
      </Box>
    );
  } else if (part.kind === "data") {
    return <TextDataPartMarkdown key={index} part={part} />;
  } else {
    return null;
  }
};

export const ArtifactAccordion: React.FC<ArtifactAccordionProps> = ({ artifact }) => {
  return (
    <Accordion
      square={true}
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 5, boxShadow: "none" }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box>
          <Typography variant="body2" gutterBottom>
            Artifact {artifact.artifactId}
          </Typography>

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
      </AccordionSummary>

      <AccordionDetails>
        {artifact.parts.map((part, index) => renderPart(part, index))}
      </AccordionDetails>
    </Accordion>
  );
};
