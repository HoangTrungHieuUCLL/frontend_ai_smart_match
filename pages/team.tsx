import { Container, SimpleGrid, Stack, Text } from "@mantine/core";
import { useTranslation } from "../contexts/I18nContext";
import TeamMemberCard, { TeamMember } from "../components/TeamMemberCard";
import CvUploadCTA from "../components/CvUploadCTA";
import ConsultationCTA from "../components/ConsultationCTA";

const TEAM_MEMBERS: TeamMember[] = [
  { name: "Windy Pham", title: "Founder — \"The Director\"", tagline: "Focuses on strategic organizational management." },
  { name: "An Bui", title: "Co-founder — \"The Artist\"", tagline: "Emphasizes understanding people in strategy development." },
  { name: "Hang Bui", title: "Co-founder — \"The Writer\"", tagline: "Specializes in legal framework and compliance." },
  { name: "Huong Do", title: "Co-founder — \"The Producer\"", tagline: "Designs HR systems." },
  { name: "Hien Tran", title: "Co-founder — \"The Controller\"", tagline: "Prioritizes business interests and financial accuracy." },
  { name: "Khanh Nguyen", title: "Co-founder — \"The Creator\"", tagline: "Develops operational systems." },
];

export default function TeamPage() {
  const { t } = useTranslation();

  return (
    <Container size="1200px" py="xl">
      <Stack gap="xl">
        <Stack gap="xs" ta="center" align="center">
          <Text fw={800} size="32px">
            {t("team.heading")}
          </Text>
          <Text c="dimmed" ta="center" maw={640}>
            {t("team.subtitle")}
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {TEAM_MEMBERS.map((member) => (
            <TeamMemberCard key={member.name} {...member} />
          ))}
        </SimpleGrid>

        <CvUploadCTA />
        <ConsultationCTA />
      </Stack>
    </Container>
  );
}
