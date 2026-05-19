import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Badge, Box, Button, Container, Divider, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { Job } from "../../types";
import JobService from "../../services/JobService";

const BROWN = "#774326";

const splitLines = (text?: string) => text?.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) ?? [];

export default function JobInfoDetailPage() {
  const router = useRouter();
  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      setLoading(true);
      try {
        const response = await JobService.getJobById(Number(id));
        setJob(response);
      } catch (error) {
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <Container size="800px" style={{ padding: "48px 0" }}>
        <Text>Loading job details...</Text>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container size="800px" style={{ padding: "48px 0" }}>
        <Text>Job not found.</Text>
      </Container>
    );
  }

  const responsibilities = splitLines(job.responsibilities);
  const requirements = splitLines(job.requirements);
  const benefits = splitLines(job.offers);
  const notes = splitLines(job.notes);

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#f7f2ef", padding: "28px 0" }}>
      <Container size="1200px">
        <Group justify="space-between" align="center" style={{ marginBottom: 24 }}>
          <Stack gap={4}>
            <Title order={2} style={{ color: "#623a26", fontWeight: 700 }}>
              {job.position}
            </Title>
            <Text color="dimmed" size="sm">
              Detailed job information, compatibility assessment, and next-step actions for this role.
            </Text>
          </Stack>
          <Button
            radius="xl"
            variant="outline"
            size="sm"
            style={{ borderColor: BROWN, color: BROWN }}
            onClick={() => router.push("/job-search-with-ai")}
          >
            Back to listings
          </Button>
        </Group>

        <Paper shadow="xl" radius="xl" style={{ backgroundColor: "#ffffff", border: "1px solid rgba(119, 67, 38, 0.12)", padding: 24 }}>
          <Stack gap="lg">
            <Group justify="space-between" align="stretch" wrap="wrap" style={{ marginBottom: 24 }}>
              {[
                {
                  number: "1",
                  title: "Job description",
                  description: job.overview,
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
                  <Stack gap="md">
                    <Group justify="apart" align="center">
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
                    <Stack gap={4}>
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
              <Stack gap="lg">
                <Group justify="apart" align="flex-start" wrap="nowrap">
                  <Group align="center" gap="md">
                    <Box
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: 24,
                        backgroundColor: "#f6f1ee",
                        display: "grid",
                        placeItems: "center",
                        color: BROWN,
                        fontWeight: 700,
                        fontSize: 28,
                      }}
                    >
                      {job.company_name
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")}
                    </Box>
                    <Stack gap={4}>
                      <Text size="xl" style={{ fontWeight: 700 }}>
                        {job.position}
                      </Text>
                      <Text color="dimmed" size="sm">
                        {job.overview}
                      </Text>
                      <Text color="dimmed" size="xs">
                        {job.company_name} • {job.date}
                      </Text>
                    </Stack>
                  </Group>

                  <Group gap="xs" wrap="nowrap">
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

                <Group gap="xs">
                  <Badge radius="xl" variant="outline" style={{ borderColor: BROWN, color: BROWN }}>
                    {job.location}
                  </Badge>
                  <Badge radius="xl" variant="outline" style={{ borderColor: BROWN, color: BROWN }}>
                    {job.type}
                  </Badge>
                </Group>

                <Divider />

                <Stack gap="sm">
                  <Text size="lg" style={{ fontWeight: 700 }}>
                    Job description
                  </Text>
                  <Text color="dimmed" size="sm">
                    {job.overview}
                  </Text>

                  <Text size="sm" style={{ fontWeight: 600 }}>
                    Key Responsibilities:
                  </Text>
                  <Stack gap={4}>
                    {responsibilities.map((item, index) => (
                      <Text key={index} color="dimmed" size="sm" component="div">
                        • {item}
                      </Text>
                    ))}
                  </Stack>

                  <Text size="sm" style={{ fontWeight: 600 }}>
                    Candidate Requirements:
                  </Text>
                  <Stack gap={4}>
                    {requirements.map((item, index) => (
                      <Text key={index} color="dimmed" size="sm" component="div">
                        • {item}
                      </Text>
                    ))}
                  </Stack>

                  <Text size="sm" style={{ fontWeight: 600 }}>
                    Benefits & Compensation:
                  </Text>
                  <Stack gap={4}>
                    {benefits.map((item, index) => (
                      <Text key={index} color="dimmed" size="sm" component="div">
                        • {item}
                      </Text>
                    ))}
                  </Stack>

                  <Text size="sm" style={{ fontWeight: 600 }}>
                    Notes:
                  </Text>
                  <Stack gap={4}>
                    {notes.map((item, index) => (
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
