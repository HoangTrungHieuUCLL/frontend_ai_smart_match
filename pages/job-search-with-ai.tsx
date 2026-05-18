import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Anchor, Badge, Box, Button, Container, Divider, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { jobs } from "../data/jobs";

const JOBS_PER_PAGE = 10;
const BROWN = "#774326";

export default function JobSearchWithAIPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const pageCount = Math.ceil(jobs.length / JOBS_PER_PAGE);
  const currentJobs = useMemo(
    () => jobs.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE),
    [page]
  );

  const handleLearnMore = (jobId: string) => {
    router.push(`/job-info/${jobId}`);
  };

  const handleSave = (title: string) => {
    if (typeof window !== "undefined") {
      window.alert(`Saved ${title}`);
    }
  };

  const handleShare = (title: string) => {
    if (typeof window !== "undefined") {
      window.alert(`Share ${title}`);
    }
  };

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#f7f2ef", padding: "28px 0" }}>
      <Container size="1100px">
        <Group justify="space-between" align="center" style={{ marginBottom: 24 }}>
          <Stack gap={4}>
            <Title order={2} style={{ color: "#623a26", fontWeight: 700 }}>
              Job Search with AI
            </Title>
            <Text color="dimmed" size="sm">
              Browse job listings, save the ones you like, and open the details page for each role.
            </Text>
          </Stack>
          <Anchor href="/" color="dimmed" size="sm">
            View job info page
          </Anchor>
        </Group>

        <Stack gap="md">
          {currentJobs.map((job) => (
            <Paper
              key={job.id}
              withBorder
              radius="xl"
              p="lg"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "rgba(119, 67, 38, 0.2)",
              }}
            >
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group align="center" gap="md" style={{ flex: 1 }}>
                  <Box
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 18,
                      backgroundColor: job.logoBackground,
                      display: "grid",
                      placeItems: "center",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: 22,
                    }}
                  >
                    {job.logo}
                  </Box>

                  <Stack gap={2} style={{ minWidth: 0 }}>
                    <Text size="lg" fw={700}>
                      {job.title}
                    </Text>
                    <Text size="sm" color="dimmed">
                      {job.experience}
                    </Text>
                    <Text size="xs" color="dimmed">
                      {job.company}
                    </Text>
                    <Group gap="xs">
                      <Badge radius="xl" variant="outline" style={{ borderColor: BROWN, color: BROWN }}>
                        {job.location}
                      </Badge>
                      <Badge radius="xl" variant="outline" style={{ borderColor: BROWN, color: BROWN }}>
                        {job.category}
                      </Badge>
                    </Group>
                  </Stack>
                </Group>

                <Group gap="xs" wrap="nowrap">
                  <Button
                    radius="xl"
                    size="xs"
                    variant="filled"
                    style={{ backgroundColor: BROWN, borderColor: BROWN }}
                    onClick={() => handleLearnMore(job.id)}
                  >
                    Learn more
                  </Button>
                  <Button
                    radius="xl"
                    size="xs"
                    variant="outline"
                    style={{ borderColor: BROWN, color: BROWN }}
                    onClick={() => handleSave(job.title)}
                  >
                    Save
                  </Button>
                  <Button
                    radius="xl"
                    size="xs"
                    variant="outline"
                    style={{ borderColor: BROWN, color: BROWN }}
                    onClick={() => handleShare(job.title)}
                  >
                    Share
                  </Button>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>

        <Group justify="center" gap="xs" style={{ marginTop: 24 }}>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
            <Button
              key={pageNumber}
              radius="xl"
              size="sm"
              variant={page === pageNumber ? "filled" : "outline"}
              style={
                page === pageNumber
                  ? { backgroundColor: BROWN, borderColor: BROWN }
                  : { borderColor: BROWN, color: BROWN }
              }
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
        </Group>

        <Text color="dimmed" size="xs" style={{ marginTop: 12 }}>
          Page {page} of {pageCount}. Showing up to {JOBS_PER_PAGE} jobs per page.
        </Text>
      </Container>
    </Box>
  );
}
