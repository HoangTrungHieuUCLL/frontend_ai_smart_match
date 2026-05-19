import { useRouter } from "next/router";
import { Badge, Box, Button, Container, Divider, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { jobs } from "../../data/jobs";

const BROWN = "#774326";

export default function JobInfoDetailPage() {
  const router = useRouter();
  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
  const job = jobs.find((item) => item.id === id);

  if (!job) {
    return (
      <Container size="800px" style={{ padding: "48px 0" }}>
        <Text>Loading job details...</Text>
      </Container>
    );
  }

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#f7f2ef", padding: "28px 0" }}>
      <Container size="1200px">
        <Group justify="space-between" align="center" style={{ marginBottom: 24 }}>
          <Stack spacing={4}>
            <Title order={2} style={{ color: "#623a26", fontWeight: 700 }}>
              {job.title}
            </Title>
            <Text color="dimmed" size="sm">
              Detailed job information, compatibility assessment, and next-step actions for this role.
            </Text>
          </Stack>
          <Button radius="xl" variant="outline" size="sm" style={{ borderColor: BROWN, color: BROWN }} onClick={() => router.push("/job-search-with-ai")}>Back to listings</Button>
        </Group>

        <Paper shadow="xl" radius="xl" style={{ backgroundColor: "#ffffff", border: "1px solid rgba(119, 67, 38, 0.12)", padding: 24 }}>
          <Stack spacing="lg">
            <Group spacing="lg" align="stretch" wrap="wrap" style={{ marginBottom: 24 }}>
              {[
                {
                  number: "1",
                  title: "Job description",
                  description: "See how the role matches your profile and decide if it is the right fit.",
                  button: "How much does this job suit me?",
                },
                {
                  number: "2",
                  title: "Your CV uploaded.",
                  description: "The system has your profile and can compare it with job requirements automatically.",
                  button: "Let's ask AI",
                },
                {
                  number: "3",
                  title: "Match score",
                  description: "This job is highly compatible with your profile based on skills and experience.",
                  button: "How compatible am I to this job?",
                },
              ].map((card) => (
                <Paper
                  key={card.number}
                  withBorder
                  radius="md"
                  p="lg"
                  style={{
                    flex: "1 1 280px",
                    minWidth: 280,
                    backgroundColor: "#fdf7ef",
                    borderColor: "rgba(119, 67, 38, 0.16)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Stack spacing="md">
                    <Group position="apart" align="center">
                      <Box
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          backgroundColor: BROWN,
                          color: "#ffffff",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 700,
                        }}
                      >
                        {card.number}
                      </Box>
                      <Box
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          border: `1px solid ${BROWN}`,
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Text size="sm" sx={{ lineHeight: 1 }}>
                          ×
                        </Text>
                      </Box>
                    </Group>
                    <Stack spacing={4}>
                      <Text size="sm" style={{ fontWeight: 700, color: BROWN, textTransform: "uppercase" }}>
                        {card.title}
                      </Text>
                      <Text color="dimmed" size="sm">
                        {card.description}
                      </Text>
                    </Stack>
                  </Stack>
                  <Button radius="xl" style={{ backgroundColor: BROWN, borderColor: BROWN, marginTop: 16 }}>
                    {card.button}
                  </Button>
                </Paper>
              ))}
            </Group>

            <Paper withBorder radius="xl" p="xl" style={{ backgroundColor: "#ffffff", borderColor: "rgba(119, 67, 38, 0.16)" }}>
              <Stack spacing="lg">
                <Group position="apart" align="flex-start" wrap="nowrap">
                  <Group align="center" spacing="md">
                    <Box
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: 24,
                        backgroundColor: job.logoBackground,
                        display: "grid",
                        placeItems: "center",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: 28,
                      }}
                    >
                      {job.logo}
                    </Box>
                    <Stack spacing={4}>
                      <Text size="xl" weight={700} style={{ fontWeight: 700 }}>
                        {job.title}
                      </Text>
                      <Text color="dimmed" size="sm">
                        {job.experience}
                      </Text>
                      <Text color="dimmed" size="xs">
                        {job.company} • {job.posted}
                      </Text>
                    </Stack>
                  </Group>

                  <Group spacing="xs" wrap="nowrap">
                    <Button radius="xl" variant="outline" size="sm" style={{ borderColor: BROWN, color: BROWN }}>
                      Upload your CV
                    </Button>
                    <Button radius="xl" size="sm" style={{ backgroundColor: BROWN, borderColor: BROWN }}>
                      Save
                    </Button>
                    <Button radius="xl" variant="outline" size="sm">
                      Share
                    </Button>
                  </Group>
                </Group>

                <Group spacing="xs">
                  <Badge radius="xl" variant="outline" style={{ borderColor: BROWN, color: BROWN }}>
                    {job.location}
                  </Badge>
                  <Badge radius="xl" variant="outline" style={{ borderColor: BROWN, color: BROWN }}>
                    {job.category}
                  </Badge>
                </Group>

                <Divider />

                <Stack spacing="sm">
                  <Text size="lg" style={{ fontWeight: 700 }}>
                    Job description
                  </Text>
                  <Text color="dimmed" size="sm">
                    {job.description}
                  </Text>

                  <Text size="sm" style={{ fontWeight: 600 }}>
                    Key Responsibilities:
                  </Text>
                  <Stack spacing={4}>
                    {job.responsibilities.map((item, index) => (
                      <Text key={index} color="dimmed" size="sm" component="div">
                        • {item}
                      </Text>
                    ))}
                  </Stack>

                  <Text size="sm" style={{ fontWeight: 600 }}>
                    Candidate Requirements:
                  </Text>
                  <Stack spacing={4}>
                    {job.requirements.map((item, index) => (
                      <Text key={index} color="dimmed" size="sm" component="div">
                        • {item}
                      </Text>
                    ))}
                  </Stack>

                  <Text size="sm" style={{ fontWeight: 600 }}>
                    Benefits & Compensation:
                  </Text>
                  <Stack spacing={4}>
                    {job.benefits.map((item, index) => (
                      <Text key={index} color="dimmed" size="sm" component="div">
                        • {item}
                      </Text>
                    ))}
                  </Stack>

                  <Text size="sm" style={{ fontWeight: 600 }}>
                    Work Location & Hours:
                  </Text>
                  <Stack spacing={4}>
                    {job.locationHours.map((item, index) => (
                      <Text key={index} color="dimmed" size="sm" component="div">
                        • {item}
                      </Text>
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
