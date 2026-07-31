import { Box, Button, Container, SimpleGrid, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { IconGavel, IconChartBar, IconUsers } from "@tabler/icons-react";
import { useTranslation } from "../contexts/I18nContext";
import ServiceCard from "../components/ServiceCard";
import ArticleCard from "../components/ArticleCard";
import CvUploadCTA from "../components/CvUploadCTA";
import ConsultationCTA from "../components/ConsultationCTA";
import { ARTICLES } from "../utils/articles";

const BROWN = "#774326";

export default function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Stack gap={0}>
      <Box
        style={{
          backgroundImage: "url(/placeholders/hero-bg.svg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container size="1200px" py={80}>
          <Stack gap="lg" align="center" ta="center" maw={720} mx="auto">
            <Text fw={800} size="40px" c="white">
              {t("home.hero.title")}
            </Text>
            <Text c="white" size="lg" opacity={0.9}>
              {t("home.hero.subtitle")}
            </Text>
            <Button
              radius="xl"
              size="md"
              style={{ backgroundColor: "#ffffff", color: BROWN }}
              onClick={() => router.push("/contact")}
            >
              {t("home.hero.cta")}
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container size="1200px" py="xl">
        <Stack gap="xl">
          <Stack gap="lg">
            <Text fw={800} size="28px" ta="center">
              {t("home.services.heading")}
            </Text>
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
          </Stack>

          <Stack gap="lg">
            <Text fw={800} size="28px" ta="center">
              {t("home.library.heading")}
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
              {ARTICLES.slice(0, 4).map((article) => (
                <ArticleCard key={article.slug} {...article} />
              ))}
            </SimpleGrid>
            <Button
              variant="subtle"
              color="brown"
              style={{ alignSelf: "center", color: BROWN }}
              onClick={() => router.push("/library")}
            >
              {t("home.library.viewAll")}
            </Button>
          </Stack>

          <CvUploadCTA />
          <ConsultationCTA />
        </Stack>
      </Container>
    </Stack>
  );
}
