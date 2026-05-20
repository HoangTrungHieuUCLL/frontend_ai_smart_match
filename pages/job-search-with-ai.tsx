import { useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Group, Stack, Text, Title, Modal, TextInput } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import JobListing from "../components/JobListing";
import { Job } from "../types";
import JobService from '../services/JobService';
import CVUploadButton from "../components/CVUploadButton";
import { getCvFormErrors, isCvFormValid } from "../utils/cvValidation";
import CVUploadModal from "../components/CVUploadModal";

const JOBS_PER_PAGE = 10;
const BROWN = "#774326";

export default function JobSearchWithAIPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const pageCount = Math.max(1, Math.ceil(jobs.length / JOBS_PER_PAGE));
  const currentJobs = useMemo(
    () => jobs.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE),
    [jobs, page]
  );

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await JobService.getAllJobs();
        setJobs(response);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      }
    };

    fetchJobs();
  }, []);

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

          <CVUploadButton onClick={() => setModalOpen(true)} />
        </Group>

        <Stack gap="md">
          {currentJobs.map((job) => (
            <JobListing key={job.id} job={job} />
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

        <CVUploadModal opened={modalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  );
}
