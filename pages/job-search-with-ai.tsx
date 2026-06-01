import { useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import JobListing from "../components/JobListing";
import { Job } from "../types";
import JobService from "../services/JobService";
import CVUploadButton from "../components/CVUploadButton";
import CVUploadModal from "../components/CVUploadModal";
import { useTranslation } from "../contexts/I18nContext";
import {CvConfirmReturn} from "../services/CvService";

const JOBS_PER_PAGE = 10;
const BROWN = "#774326";

export default function JobSearchWithAIPage() {
    const { t } = useTranslation();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [uploadedCvName, setUploadedCvName] =useState<string | null>(null);
    const fetchJobs = async () => {
        try {
            const response = await JobService.getAllJobs();
            setJobs(response);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const scoredJobs = useMemo(() => {
        return jobs.map((job) => ({
            ...job,
            compatibility_score: job.compatibility_score ?? null,
        }));
    }, [jobs]);

    const sortedJobs = useMemo(() => {
        return [...scoredJobs].sort(
            (a, b) => (b.compatibility_score ?? 0) - (a.compatibility_score ?? 0)
        );
    }, [scoredJobs]);

    const pageCount = Math.max(1, Math.ceil(sortedJobs.length / JOBS_PER_PAGE));

    const filteredJobs = useMemo(() => {
        const q = search.toLowerCase();

        return sortedJobs.filter((job) => {
            return (
                job.position?.toLowerCase().includes(q) ||
                job.company_name?.toLowerCase().includes(q) ||
                job.location?.toLowerCase().includes(q) ||
                job.requirements?.toLowerCase().includes(q)
            );
        });
    }, [sortedJobs, search]);

    const currentJobs = useMemo(() => {
        return filteredJobs.slice(
            (page - 1) * JOBS_PER_PAGE,
            page * JOBS_PER_PAGE
        );
    }, [filteredJobs, page]);

    return (
        <Box style={{ minHeight: "100vh", backgroundColor: "#f7f2ef", padding: "28px 0" }}>
            <Container size="1100px">
                <Group justify="space-between" align="center" wrap="nowrap" style={{ marginBottom: 24 }}>
                    <Stack gap={4}>
                        <Title order={2} style={{ color: "#623a26", fontWeight: 700 }}>
                            {t("jobSearch.title")}
                        </Title>
                        <Text size="sm" c="dimmed">
                            {t("jobSearch.subtitle")}
                        </Text>
                    </Stack>

                <Group gap="md" wrap="nowrap">

                    <CVUploadButton 
                    label={uploadedCvName ?? undefined}
                    onClick={() => setModalOpen(true)} />

                    <TextInput
                        placeholder="Search jobs..."
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        radius="xl"
                        h={40}
                        styles={{
                            input: {
                                height: 40,
                                borderColor: BROWN,
                                color: BROWN,
                                backgroundColor: "#f7f2ef",
                            },
                        }}
                    />

                </Group>
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
                    {t("jobSearch.pageStatus", { page, pageCount, jobsPerPage: JOBS_PER_PAGE })}
                </Text>
            </Container>

            <CVUploadModal
                opened={modalOpen}
                onClose={(results, cvName) => {
                    setModalOpen(false);

                    if (!results) return;
                    if (cvName) {
                        setUploadedCvName(cvName);
                    }
                    const scoreMap = new Map(
                        results.map(r => [r.job_id, r.compatibility_score])
                    );

                    setJobs(prevJobs =>
                        prevJobs.map(job => ({
                            ...job,
                            compatibility_score:
                                scoreMap.get(job.id) ?? null,
                        }))
                    );
                }}
            />
        </Box>
    );
}
