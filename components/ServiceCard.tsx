import { Box, Button, Card, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import type { ComponentType } from "react";
import { useTranslation } from "../contexts/I18nContext";

const BROWN = "#774326";

type ServiceCardProps = {
  icon: ComponentType<{ size?: number; color?: string; stroke?: number }>;
  title: string;
  summary: string;
  href: string;
};

export default function ServiceCard({ icon: IconComponent, title, summary, href }: ServiceCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Card radius="lg" padding="xl" withBorder shadow="sm" style={{ height: "100%" }}>
      <Stack gap="md" justify="space-between" style={{ height: "100%" }}>
        <Stack gap="md">
          <Box
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "#f4dfc6",
              display: "grid",
              placeItems: "center",
            }}
          >
            <IconComponent size={28} color={BROWN} stroke={1.75} />
          </Box>
          <Text fw={700} size="lg">
            {title}
          </Text>
          <Text c="dimmed" size="sm">
            {summary}
          </Text>
        </Stack>
        <Button
          variant="subtle"
          color="brown"
          px={0}
          style={{ alignSelf: "flex-start", color: BROWN }}
          onClick={() => router.push(href)}
        >
          {t("services.learnMore")}
        </Button>
      </Stack>
    </Card>
  );
}
