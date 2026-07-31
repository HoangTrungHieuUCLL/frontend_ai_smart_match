import { useState } from "react";
import { Avatar, Button, Card, Modal, Stack, Text } from "@mantine/core";
import { useTranslation } from "../contexts/I18nContext";

const BROWN = "#774326";

export type TeamMember = {
  name: string;
  title: string;
  tagline: string;
};

export default function TeamMemberCard({ name, title, tagline }: TeamMember) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Card
        radius="lg"
        padding="xl"
        withBorder
        shadow="sm"
        style={{ cursor: "pointer", textAlign: "center" }}
        onClick={() => setOpened(true)}
      >
        <Stack align="center" gap="sm">
          <Avatar src="/placeholders/team-photo.svg" alt={name} size={110} radius="50%" />
          <Text fw={700} size="lg">
            {name}
          </Text>
          <Text size="sm" c={BROWN} fw={600}>
            {title}
          </Text>
          <Text size="sm" c="dimmed">
            {tagline}
          </Text>
          <Button variant="subtle" color="brown" size="xs" style={{ color: BROWN }}>
            {t("team.viewProfile")}
          </Button>
        </Stack>
      </Card>

      <Modal opened={opened} onClose={() => setOpened(false)} centered radius="lg" size="sm">
        <Stack align="center" gap="sm" py="md">
          <Avatar src="/placeholders/team-photo.svg" alt={name} size={140} radius="50%" />
          <Text fw={800} size="xl">
            {name}
          </Text>
          <Text size="sm" c={BROWN} fw={700}>
            {title}
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            {tagline}
          </Text>
        </Stack>
      </Modal>
    </>
  );
}
