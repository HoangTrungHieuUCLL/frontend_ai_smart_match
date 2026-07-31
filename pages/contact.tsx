import { Container, Stack, Text } from "@mantine/core";
import { useTranslation } from "../contexts/I18nContext";
import ConsultationForm from "../components/ConsultationForm";

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <Container size="800px" py="xl">
      <Stack gap="xl">
        <Stack gap="xs" ta="center" align="center">
          <Text fw={800} size="32px">
            {t("contact.heading")}
          </Text>
          <Text c="dimmed" ta="center" maw={560}>
            {t("contact.subtitle")}
          </Text>
        </Stack>

        <ConsultationForm />
      </Stack>
    </Container>
  );
}
