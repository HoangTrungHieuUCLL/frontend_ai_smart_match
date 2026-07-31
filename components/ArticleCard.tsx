import { Badge, Button, Card, Image, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { useTranslation } from "../contexts/I18nContext";

const BROWN = "#774326";

export type Article = {
  slug: string;
  title: string;
  category: string;
  date: string;
};

export default function ArticleCard({ slug, title, category, date }: Article) {
  const { t } = useTranslation();

  return (
    <Card radius="lg" padding="lg" withBorder shadow="sm" style={{ height: "100%" }}>
      <Card.Section>
        <Image src="/placeholders/article-thumb.svg" alt="" h={160} fit="cover" />
      </Card.Section>
      <Stack gap="xs" mt="md" style={{ height: "100%" }}>
        <Badge color="brown" variant="light" style={{ alignSelf: "flex-start", color: BROWN }}>
          {category}
        </Badge>
        <Text fw={700} lineClamp={2}>
          {title}
        </Text>
        <Text size="xs" c="dimmed">
          {date}
        </Text>
        <Button
          component={Link}
          href={`/library/${slug}`}
          variant="subtle"
          color="brown"
          px={0}
          style={{ alignSelf: "flex-start", color: BROWN, marginTop: "auto" }}
        >
          {t("library.readNow")}
        </Button>
      </Stack>
    </Card>
  );
}
