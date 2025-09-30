import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import React from "react";

import { TextDataPartMarkdown } from "@/components/chat/TextDataPartMarkdown";
import { DataPart, FilePart, Message, TextPart } from "@a2a-js/sdk";

interface ToolCallAccordionProps {
  toolCallMessage: Message;
  toolCallResultMessage: Message | undefined;
}

export const ToolCallAccordion: React.FC<ToolCallAccordionProps> = ({
  toolCallMessage,
  toolCallResultMessage,
}) => {
  if (!toolCallMessage.metadata?.toolCallId || !toolCallMessage.metadata?.toolCallName) {
    console.error("`toolCallMessage` `metadata` is missing `toolCallId` or `toolCallName`");
    return null;
  }

  const argsDataPart: TextPart | DataPart | FilePart | undefined = toolCallMessage.parts[0];

  if (!argsDataPart || argsDataPart.kind !== "data") {
    console.error("`toolCallMessage` `parts[0]` should be a `DataPart`");
    return null;
  }

  const resultDataPart: TextPart | DataPart | FilePart | undefined =
    toolCallResultMessage?.parts[0];

  if (resultDataPart && resultDataPart.kind !== "text" && resultDataPart.kind !== "data") {
    console.error(
      "If `toolCallResultMessage` exists, `parts[0]` should be a `TextPart` or `DataPart`"
    );
    return null;
  }

  return (
    <Accordion
      square={true}
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 5, boxShadow: "none" }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box>
          <Typography variant="h6">{toolCallMessage.metadata?.toolCallName as string}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {toolCallMessage.metadata?.toolCallId as string}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <TextDataPartMarkdown part={argsDataPart} />

        {resultDataPart && (
          <Box sx={{ mt: 2 }}>
            <TextDataPartMarkdown part={resultDataPart} />
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
