import { DataPart, TextPart } from "@a2a-js/sdk";
import { Typography } from "@mui/material";
import { MuiMarkdown, getOverrides as muiMarkdownGetOverrides, Overrides } from "mui-markdown";
import { Highlight, themes } from "prism-react-renderer";

interface TextDataPartMarkdownProps {
  part: TextPart | DataPart;
}

const getOverrides = (hideLineNumbers: boolean): Overrides => {
  const overrides = muiMarkdownGetOverrides({
    Highlight,
    themes,
    prismTheme: themes.github,
    hideLineNumbers,
  });

  return {
    ...(overrides.blockquote ? { blockquote: overrides.blockquote } : {}),
    ...(overrides.code ? { code: overrides.code } : {}),
    ...(overrides.pre ? { pre: overrides.pre } : {}),
    h1: {
      component: Typography,
      props: {
        variant: "h4",
        component: "h1",
        gutterBottom: true,
      },
    },
    h2: {
      component: Typography,
      props: {
        variant: "h5",
        component: "h2",
        gutterBottom: true,
      },
    },
    h3: {
      component: Typography,
      props: {
        variant: "h6",
        component: "h3",
        gutterBottom: true,
      },
    },
    h4: {
      component: Typography,
      props: {
        variant: "subtitle1",
        component: "h4",
        gutterBottom: true,
      },
    },
    h5: {
      component: Typography,
      props: {
        variant: "subtitle2",
        component: "h5",
        gutterBottom: true,
      },
    },
    h6: {
      component: Typography,
      props: {
        variant: "body1",
        component: "h6",
        sx: { fontWeight: "bold" },
        gutterBottom: true,
      },
    },
  };
};

export const TextDataPartMarkdown: React.FC<TextDataPartMarkdownProps> = ({ part }) => {
  if (part.kind === "text") {
    return <MuiMarkdown overrides={getOverrides(false)}>{part.text}</MuiMarkdown>;
  } else {
    return (
      <MuiMarkdown overrides={getOverrides(true)}>{`\`\`\`json\n${JSON.stringify(
        part.data,
        null,
        4
      )}\n\`\`\``}</MuiMarkdown>
    );
  }
};
