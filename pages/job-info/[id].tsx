import { useRouter } from "next/router";
import Link from "next/link";
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
      <Container size="1100px">
        <Group justify="space-between" align="center" style={{ marginBottom: 24 }}>
          <Stack gap={4}>
            <Title order={2} style={{ color: "#623a26", fontWeight: 700 }}>
              {job.title}
            </Title>
            <Text color="dimmed" size="sm">
              {job.company} · {job.location}
            </Text>
          </Stack>
          <Link href="/job-search-with-ai" passHref legacyBehavior>
            <Button radius="xl" variant="outline" size="sm" style={{ borderColor: BROWN, color: BROWN }}>
              Back to listings
            </Button>
          </Link>
        </Group>

        <Paper withBorder radius="xl" p="xl" style={{ backgroundColor: "#ffffff" }}>
          <Stack gap="lg">
            <Group justify="space-between" align="center" wrap="nowrap">
              <Group align="center" gap="md">
                <Box
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 18,
                    backgroundColor: job.logoBackground,
                    display: "grid",
                    placeItems: "center",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 24,
                  }}
                >
                  {job.logo}
                </Box>
                <Stack gap={4}>
                  <Text size="lg" style={{ fontWeight: 700 }}>
                    {job.company}
                  </Text>
                  <Text size="xs" color="dimmed">
                    {job.posted}
                  </Text>
                </Stack>
              </Group>

              <Group gap="xs" wrap="nowrap">
                <Button radius="xl" variant="outline" size="xs" style={{ borderColor: BROWN, color: BROWN }}>
                  Upload your CV
                </Button>
                <Button radius="xl" size="xs" style={{ backgroundColor: BROWN, borderColor: BROWN }}>
                  Save
                </Button>
                <Button radius="xl" variant="outline" size="xs" style={{ borderColor: BROWN, color: BROWN }}>
                  Share
                </Button>
              </Group>
            </Group>

            <Group gap="xs">
              <Badge radius="xl" variant="outline" style={{ borderColor: BROWN, color: BROWN }}>
                {job.location}
              </Badge>
              <Badge radius="xl" variant="outline" style={{ borderColor: BROWN, color: BROWN }}>
                {job.category}
              </Badge>
            </Group>

            <Divider />

            <Stack gap="md">
              <Text size="lg" style={{ fontWeight: 700 }}>
                Job description
              </Text>
              <Text color="dimmed" size="sm">
                {job.description}
              </Text>

              <Text size="sm" style={{ fontWeight: 600 }}>
                Key Responsibilities:
              </Text>
              <Stack gap={4}>
                {job.responsibilities.map((item, index) => (
                  <Text key={index} color="dimmed" size="sm" component="div">
                    • {item}
                  </Text>
                ))}
              </Stack>

              <Text size="sm" style={{ fontWeight: 600 }}>
                Candidate Requirements:
              </Text>
              <Stack gap={4}>
                {job.requirements.map((item, index) => (
                  <Text key={index} color="dimmed" size="sm" component="div">
                    • {item}
                  </Text>
                ))}
              </Stack>

              <Text size="sm" style={{ fontWeight: 600 }}>
                Benefits & Compensation:
              </Text>
              <Stack gap={4}>
                {job.benefits.map((item, index) => (
                  <Text key={index} color="dimmed" size="sm" component="div">
                    • {item}
                  </Text>
                ))}
              </Stack>

              <Text size="sm" style={{ fontWeight: 600 }}>
                Location & Hours:
              </Text>
              <Stack gap={4}>
                {job.locationHours.map((item, index) => (
                  <Text key={index} color="dimmed" size="sm" component="div">
                    • {item}
                  </Text>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
