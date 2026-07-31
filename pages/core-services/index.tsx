import { Container, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconGavel, IconChartBar, IconUsers } from "@tabler/icons-react";
import { useTranslation } from "../../contexts/I18nContext";
import ServiceCard from "../../components/ServiceCard";
import CvUploadCTA from "../../components/CvUploadCTA";
import ConsultationCTA from "../../components/ConsultationCTA";

export default function CoreServicesPage() {
  const { t } = useTranslation();

  return (
    <Container size="1200px" py="xl">
      <Stack gap="xl">
        <Stack gap="xs" ta="center" align="center">
          <Text fw={800} size="32px">
            {t("services.index.heading")}
          </Text>
          <Text c="dimmed" ta="center" maw={640}>
            {t("services.index.subtitle")}
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          <ServiceCard
            icon={IconUsers}
            title={t("services.hr.title")}
            summary={t("services.hr.summary")}
            href="/core-services/hr-consulting"
          />
          <ServiceCard
            icon={IconGavel}
            title={t("services.legal.title")}
            summary={t("services.legal.summary")}
            href="/core-services/business-legal-consulting"
          />
          <ServiceCard
            icon={IconChartBar}
            title={t("services.finance.title")}
            summary={t("services.finance.summary")}
            href="/core-services/finance-accounting"
          />
        </SimpleGrid>

        <CvUploadCTA />
        <ConsultationCTA />
      </Stack>
    </Container>
  );
}
