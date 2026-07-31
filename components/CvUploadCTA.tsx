import { Card, Group, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { useTranslation } from "../contexts/I18nContext";
import CVUploadButton from "./CVUploadButton";

export default function CvUploadCTA() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Card radius="lg" padding="xl" withBorder shadow="sm">
      <Group justify="space-between" wrap="wrap" gap="lg">
        <Stack gap={4} style={{ flex: 1, minWidth: 220 }}>
          <Text fw={700} size="lg">
            {t("cta.cvUpload.title")}
          </Text>
          <Text c="dimmed" size="sm">
            {t("cta.cvUpload.body")}
          </Text>
        </Stack>
        <CVUploadButton label={t("cta.cvUpload.button")} onClick={() => router.push("/job-search-with-ai")} />
      </Group>
    </Card>
  );
}
