import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { Box, Button, Group, Text } from "@mantine/core";

const BROWN = "#9a5d35";

type CVUploadButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> & {
  label?: string;
  style?: CSSProperties;
};

export default function CVUploadButton({ label = "Upload your CV", style, ...props }: CVUploadButtonProps) {
  return (
    <Button
      radius="xl"
      h={40}
      px={8}
      style={{
        width: "min(292px, 100%)",
        backgroundColor: BROWN,
        borderColor: BROWN,
        color: "#ffffff",
        ...style,
      }}
      styles={{
        inner: { width: "100%" },
        label: { width: "100%" },
      }}
      {...props}
    >
      <Group justify="space-between" align="center" wrap="nowrap" gap={10} style={{ width: "100%" }}>
        <Box
          aria-hidden="true"
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            color: BROWN,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            fontSize: 23,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          +
        </Box>

        <Text component="span" size="sm" fw={700} style={{ flex: 1, textAlign: "left", color: "#ffffff" }}>
          {label}
        </Text>

        <Box
          aria-hidden="true"
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            color: BROWN,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            fontSize: 16,
            fontWeight: 800,
            fontFamily: "Georgia, serif",
            lineHeight: 1,
          }}
        >
          i
        </Box>
      </Group>
    </Button>
  );
}
