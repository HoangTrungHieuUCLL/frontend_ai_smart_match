import { Button, Card, Group, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { useTranslation } from "../contexts/I18nContext";

const BROWN = "#774326";

export default function ConsultationCTA() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Card radius="lg" padding="xl" withBorder shadow="sm" style={{ backgroundColor: "#fdf7ef" }}>
      <Group justify="space-between" wrap="wrap" gap="lg">
        <Stack gap={4} style={{ flex: 1, minWidth: 220 }}>
          <Text fw={700} size="lg">
            {t("cta.consultation.title")}
          </Text>
          <Text c="dimmed" size="sm">
            {t("cta.consultation.body")}
          </Text>
        </Stack>
        <Button radius="xl" style={{ backgroundColor: BROWN }} onClick={() => router.push("/contact")}>
          {t("cta.consultation.button")}
        </Button>
      </Group>
    </Card>
  );
}
