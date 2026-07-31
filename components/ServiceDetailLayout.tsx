import { Button, Card, Container, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { useTranslation } from "../contexts/I18nContext";
import CvUploadCTA from "./CvUploadCTA";
import ConsultationCTA from "./ConsultationCTA";

const BROWN = "#774326";

type ServiceItem = {
  title: string;
  body: string;
};

type ServiceDetailLayoutProps = {
  title: string;
  items: ServiceItem[];
};

export default function ServiceDetailLayout({ title, items }: ServiceDetailLayoutProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Container size="1200px" py="xl">
      <Stack gap="xl">
        <Text fw={800} size="32px" ta="center">
          {title}
        </Text>

        <Stack gap="lg">
          {items.map((item) => (
            <Card key={item.title} radius="lg" padding="xl" withBorder shadow="sm">
              <Stack gap="sm">
                <Text fw={700} size="lg">
                  {item.title}
                </Text>
                <Text c="dimmed">{item.body}</Text>
                <Button
                  radius="xl"
                  style={{ backgroundColor: BROWN, alignSelf: "flex-start" }}
                  onClick={() => router.push("/contact")}
                >
                  {t("services.scheduleConsultation")}
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>

        <CvUploadCTA />
        <ConsultationCTA />
      </Stack>
    </Container>
  );
}
