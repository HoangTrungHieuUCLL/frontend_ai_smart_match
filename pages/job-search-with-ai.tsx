import { useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import JobListing from "../components/JobListing";
import { Job } from "../types";
import JobService from "../services/JobService";
import CVUploadButton from "../components/CVUploadButton";
import CVUploadModal from "../components/CVUploadModal";

const JOBS_PER_PAGE = 10;
const BROWN = "#774326";

export default function JobSearchWithAIPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);

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

    // assign default score handling (after modal updates)
    const scoredJobs = useMemo(() => {
        return jobs.map((job) => ({
            ...job,
            compatability_score: job.compatability_score ?? null,
        }));
    }, [jobs]);

    // sort AFTER scores exist
    const sortedJobs = useMemo(() => {
        return [...scoredJobs].sort(
            (a, b) => (b.compatability_score ?? 0) - (a.compatability_score ?? 0)
        );
    }, [scoredJobs]);

    const pageCount = Math.max(
        1,
        Math.ceil(sortedJobs.length / JOBS_PER_PAGE)
    );

    const currentJobs = useMemo(() => {
        return sortedJobs.slice(
            (page - 1) * JOBS_PER_PAGE,
            page * JOBS_PER_PAGE
        );
    }, [sortedJobs, page]);

    return (
        <Box style={{ minHeight: "100vh", backgroundColor: "#f7f2ef", padding: "28px 0" }}>
            <Container size="1100px">
                <Group justify="space-between" align="center" style={{ marginBottom: 24 }}>
                    <Stack gap={4}>
                        <Title order={2} style={{ color: "#623a26", fontWeight: 700 }}>
                            Job Search with AI
                        </Title>
                        <Text size="sm" c="dimmed">
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

                <Group justify="center" gap="xs" mt={24}>
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

                <Text size="xs" c="dimmed" mt={12}>
                    Page {page} of {pageCount}. Showing up to {JOBS_PER_PAGE} jobs per page.
                </Text>
            </Container>

            <CVUploadModal
                opened={modalOpen}
                onClose={() => {
                    const updatedJobs = jobs.map((job) => ({
                        ...job,
                        compatability_score: Math.floor(Math.random() * 101),
                    }));

                    setJobs(updatedJobs);
                    setModalOpen(false);
                }}
            />
        </Box>
    );
}