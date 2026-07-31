import { Container, SimpleGrid, Stack, Text } from "@mantine/core";
import { useTranslation } from "../../contexts/I18nContext";
import ArticleCard from "../../components/ArticleCard";
import CvUploadCTA from "../../components/CvUploadCTA";
import ConsultationCTA from "../../components/ConsultationCTA";
import { ARTICLES } from "../../utils/articles";

export default function LibraryPage() {
  const { t } = useTranslation();

  return (
    <Container size="1200px" py="xl">
      <Stack gap="xl">
        <Stack gap="xs" ta="center" align="center">
          <Text fw={800} size="32px">
            {t("library.heading")}
          </Text>
          <Text c="dimmed" ta="center" maw={640}>
            {t("library.subtitle")}
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          {ARTICLES.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </SimpleGrid>

        <CvUploadCTA />
        <ConsultationCTA />
      </Stack>
    </Container>
  );
}
