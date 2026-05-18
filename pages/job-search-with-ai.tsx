import {useEffect, useMemo, useState} from "react";
import { useRouter } from "next/router";
import { Anchor, Badge, Box, Button, Container, Divider, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { jobs } from "../data/jobs";
import JobListing from "../components/JobListing";
import {Job} from "../types";
import JobService from "../services/JobService";

const JOBS_PER_PAGE = 10;
const BROWN = "#774326";

export default function JobSearchWithAIPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);

  const pageCount = Math.ceil(jobs.length / JOBS_PER_PAGE);

  useEffect(() => {
    const fetchJobs = async () => {
      const response = await JobService.getAllJobs();
      setJobs(response);
    }

    fetchJobs();
  })

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
          {jobs.map((job) => (
              <JobListing job={job} />
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
