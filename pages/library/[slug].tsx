import { useRouter } from "next/router";
import { Badge, Button, Container, Image, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { useTranslation } from "../../contexts/I18nContext";
import { getArticleBySlug } from "../../utils/articles";
import CvUploadCTA from "../../components/CvUploadCTA";
import ConsultationCTA from "../../components/ConsultationCTA";

const BROWN = "#774326";

export default function ArticleDetailPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const slug = typeof router.query.slug === "string" ? router.query.slug : undefined;
  const article = slug ? getArticleBySlug(slug) : undefined;

  if (!article) {
    return (
      <Container size="800px" py="xl">
        <Text ta="center">{t("jobInfo.notFound")}</Text>
      </Container>
    );
  }

  return (
    <Container size="800px" py="xl">
      <Stack gap="lg">
        <Button
          component={Link}
          href="/library"
          variant="subtle"
          color="brown"
          px={0}
          style={{ alignSelf: "flex-start", color: BROWN }}
        >
          {"< " + t("library.backToLibrary")}
        </Button>

        <Image src="/placeholders/article-thumb.svg" alt="" radius="lg" h={280} fit="cover" />

        <Badge color="brown" variant="light" style={{ alignSelf: "flex-start", color: BROWN }}>
          {article.category}
        </Badge>

        <Text fw={800} size="28px">
          {article.title}
        </Text>
        <Text size="sm" c="dimmed">
          {article.date}
        </Text>
        <Text>{article.body}</Text>

        <CvUploadCTA />
        <ConsultationCTA />
      </Stack>
    </Container>
  );
}
