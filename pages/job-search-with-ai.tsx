import { useEffect, useMemo, useState } from "react";
import {Box, Button, Container, Group, Image, Modal, Select, Stack, Text, Textarea, TextInput} from "@mantine/core";
import JobListing from "../components/JobListing";
import { Job, JobCreatePayload } from "../types";
import JobService from "../services/JobService";
import CVUploadButton from "../components/CVUploadButton";
import CVUploadModal from "../components/CVUploadModal";
import { useTranslation } from "../contexts/I18nContext";
import { CvConfirmReturn } from "../services/CvService";
import { getSavedJobs } from "../utils/savedJobs";
import { notifications } from "@mantine/notifications";
import AddJobModal from "../components/AddJobModal";
import JobListingSkeleton from "../components/skeleton/JobListingSkeleton";

type SortOption = "best_match" | "newest_first" | "company_az";

const JOBS_PER_PAGE = 10;
const BROWN = "#774326";

type JobFormState = {
    company_name: string;
    position: string;
    date_posted: string;
    location: string;
    job_type: string;
    overview: string;
    responsibilities: string;
    requirements: string;
    offers: string;
    salary_usd: string;
    notes: string;
    requirements_simplified: string;
};

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getEmptyJobForm = (): JobFormState => ({
    company_name: "",
    position: "",
    date_posted: getTodayDate(),
    location: "",
    job_type: "",
    overview: "",
    responsibilities: "",
    requirements: "",
    offers: "",
    salary_usd: "",
    notes: "",
    requirements_simplified: "",
});

const requiredJobFields: Array<keyof JobFormState> = [
    "company_name",
    "position",
    "date_posted",
    "location",
    "job_type",
    "overview",
    "responsibilities",
    "requirements",
    "offers",
    "requirements_simplified",
];

const SCORE_STORAGE_KEY = "jobScores";
const CV_NAME_STORAGE_KEY = "cvName";

const saveScoresToStorage = (results: CvConfirmReturn[]) => {
    const existing: CvConfirmReturn[] = JSON.parse(localStorage.getItem(SCORE_STORAGE_KEY) ?? "[]");
    const merged = new Map(existing.map((r) => [r.job_id, r.compatibility_score]));
    results.forEach((r) => merged.set(r.job_id, r.compatibility_score));
    localStorage.setItem(
        SCORE_STORAGE_KEY,
        JSON.stringify(Array.from(merged.entries()).map(([job_id, compatibility_score]) => ({ job_id, compatibility_score })))
    );
};

const applyStoredScores = (jobList: Job[]): Job[] => {
    const stored: CvConfirmReturn[] = JSON.parse(localStorage.getItem(SCORE_STORAGE_KEY) ?? "[]");
    if (!stored.length) return jobList;
    const scoreMap = new Map(stored.map((r) => [r.job_id, r.compatibility_score]));
    return jobList.map((job) => ({
        ...job,
        compatibility_score: scoreMap.get(job.id) ?? job.compatibility_score ?? null,
    }));
};

export default function JobSearchWithAIPage() {
    const { t } = useTranslation();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [addJobOpen, setAddJobOpen] = useState(false);
    const [adminToken, setAdminToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [uploadedCvName, setUploadedCvName] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>("newest_first");

    useEffect(() => {
        const stored = localStorage.getItem(CV_NAME_STORAGE_KEY);
        setUploadedCvName(stored);
        if (stored) setSortOption("best_match");
    }, []);

    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [shareOpened, setShareOpened] = useState(false);
    // const [copiedUrl, setCopiedUrl] = useState("");
    const fetchJobs = async () => {
        try {
            setIsLoading(true);
            const response = await JobService.getAllJobs();
            setJobs(applyStoredScores(response));
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        setAdminToken(localStorage.getItem("access_token"));
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search, showSavedOnly, sortOption]);

    const scoredJobs = useMemo(() => {
        return jobs.map((job) => ({
            ...job,
            compatibility_score: job.compatibility_score ?? null,
        }));
    }, [jobs]);

    const sortedJobs = useMemo(() => {
        return [...scoredJobs].sort((a, b) => {
            if (sortOption === "best_match") {
                const diff = (b.compatibility_score ?? 0) - (a.compatibility_score ?? 0);
                return diff !== 0 ? diff : a.id - b.id;
            }
            if (sortOption === "newest_first") {
                const dateA = a.date ? new Date(a.date).getTime() : null;
                const dateB = b.date ? new Date(b.date).getTime() : null;
                if (dateA === null && dateB === null) return a.id - b.id;
                if (dateA === null) return 1;
                if (dateB === null) return -1;
                return dateB - dateA !== 0 ? dateB - dateA : a.id - b.id;
            }
            if (sortOption === "company_az") {
                const cmp = (a.company_name ?? "").localeCompare(b.company_name ?? "");
                return cmp !== 0 ? cmp : a.id - b.id;
            }
            return 0;
        });
    }, [scoredJobs, sortOption]);

    const pageCount = Math.max(1, Math.ceil(sortedJobs.length / JOBS_PER_PAGE));

    const filteredJobs = useMemo(() => {
        const q = search.toLowerCase();
        const savedIds = getSavedJobs();

        return sortedJobs.filter((job) => {
            const matchesSearch =
                job.position?.toLowerCase().includes(q) ||
                job.company_name?.toLowerCase().includes(q) ||
                job.location?.toLowerCase().includes(q) ||
                job.requirements?.toLowerCase().includes(q);

            const matchesSaved = showSavedOnly ? savedIds.includes(job.id) : true;

            return matchesSearch && matchesSaved;
        });
    }, [sortedJobs, search, showSavedOnly]);

    const hasSearch = search.trim().length > 0;
    const noJobsInDatabase = jobs.length === 0;
    const showEmptyState =
        !isLoading &&
        filteredJobs.length === 0;

    const emptyStateContent = useMemo(() => {
        if (noJobsInDatabase) {
            return {
                title: "No jobs are available at the moment.",
                description: "Check back soon.",
                showClearFilters: false,
            };
        }

        if (hasSearch && showSavedOnly) {
            return {
                title: "No jobs found",
                description:
                    "No saved jobs match your search. Try clearing the search or the saved filter.",
                showClearFilters: true,
            };
        }

        if (showSavedOnly) {
            return {
                title: "No jobs found",
                description:
                    "You haven't saved any jobs yet. Browse the full list to save jobs you like.",
                showClearFilters: true,
            };
        }

        if (hasSearch) {
            return {
                title: "No jobs found",
                description:
                    "Try a different search term or clear the search.",
                showClearFilters: true,
            };
        }

        return {
            title: "No jobs found",
            description: "",
            showClearFilters: true,
        };
    }, [noJobsInDatabase, hasSearch, showSavedOnly]);

    const clearFilters = () => {
        setSearch("");
        setShowSavedOnly(false);
        setPage(1);
    };

    const currentJobs = useMemo(() => {
        return filteredJobs.slice(
            (page - 1) * JOBS_PER_PAGE,
            page * JOBS_PER_PAGE
        );
    }, [filteredJobs, page]);

    const handleShare = async (jobId: number) => {
        const url = `${window.location.origin}/job-info/${jobId}`;

        await navigator.clipboard.writeText(url);

        // setCopiedUrl(url);
        setShareOpened(true);
    };

    return (
        <Box style={{ minHeight: "100vh", backgroundColor: "#f7f2ef", padding: "28px 0" }}>
            <Container size="1100px">
                <Group justify="flex-end" gap="xs" align="center" style={{ marginBottom: 24 }}>
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
                                minHeight: 40,
                                borderColor: BROWN,
                                color: BROWN,
                                backgroundColor: "#f7f2ef",
                            },
                        }}
                    />
                    <Button
                        radius="xl"
                        variant={showSavedOnly ? "filled" : "light"}
                        h={40}
                        style={{
                            backgroundColor: showSavedOnly ? BROWN : "transparent",
                            border: `1px solid ${BROWN}`,
                            color: showSavedOnly ? "#fff" : BROWN,
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                        }}
                        onClick={() => setShowSavedOnly((prev) => !prev)}
                    >
                        Saved jobs
                    </Button>

                    {adminToken && (
                        <Button
                            radius="xl"
                            h={40}
                            px={10}
                            style={{
                                backgroundColor: BROWN,
                                borderColor: BROWN,
                                color: "#ffffff",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                            }}
                            styles={{
                                inner: { width: "100%" },
                                label: { width: "100%" },
                            }}
                            onClick={() => {
                                setAddJobOpen(true);
                            }}
                        >
                            <Group gap={10} align="center" wrap="nowrap">
                                <Image src="/add.png" alt="" w={24} h={24} fit="cover" />
                                <Text component="span" size="sm" fw={700} c="#ffffff">
                                    Add new job
                                </Text>
                            </Group>
                        </Button>
                    )}

                    <Select
                        value={sortOption}
                        onChange={(val) => {
                            if (val) setSortOption(val as SortOption);
                        }}
                        data={[
                            {
                                value: "best_match",
                                label: "Best Match",
                                disabled: !jobs.some(j => j.compatibility_score),
                            },
                            { value: "newest_first", label: "Newest First" },
                            { value: "company_az", label: "Company A–Z" },
                        ]}
                        radius="xl"
                        w={180}
                        styles={{
                            input: {
                                height: 40,
                                minHeight: 40,
                                borderColor: BROWN,
                                color: BROWN,
                                backgroundColor: "#f7f2ef",
                                fontWeight: 600,
                            },
                            option: {
                                color: BROWN,
                            },
                        }}
                    />
                </Group>

                {showEmptyState ? (
                    <Box
                        style={{
                            minHeight: 200,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Stack align="center" gap="sm">
                            <Text fw={700} size="lg">
                                {emptyStateContent.title}
                            </Text>

                            <Text
                                c="dimmed"
                                ta="center"
                                maw={420}
                            >
                                {emptyStateContent.description}
                            </Text>

                            {emptyStateContent.showClearFilters && (
                                <Button
                                    radius="xl"
                                    variant="outline"
                                    style={{
                                        borderColor: BROWN,
                                        color: BROWN,
                                    }}
                                    onClick={clearFilters}
                                >
                                    Clear filters
                                </Button>
                            )}
                        </Stack>
                    </Box>
                ) : (
                    <Stack gap="md">
                        { isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <JobListingSkeleton key={i} />
                            ))
                        ) : (
                            jobs.map((job) => (
                                <JobListing key={job.id}
                                            job={job}
                                            onShare={handleShare}
                                />
                            ))
                        )}
                    </Stack>
                )}

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
                        localStorage.setItem(CV_NAME_STORAGE_KEY, cvName);
                        setSortOption("best_match");
                    }

                    saveScoresToStorage(results);

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

            <Modal
                opened={shareOpened}
                onClose={() => setShareOpened(false)}
                centered
                title="Share Job"
            >
                <Stack>
                    <Text>
                        Link to this job is saved in your clipboard
                    </Text>

                    <Button
                        radius="xl"
                        color={BROWN}
                        onClick={() => setShareOpened(false)}
                    >
                        OK
                    </Button>
                </Stack>
            </Modal>

            <AddJobModal
                opened={addJobOpen}
                onClose={() => setAddJobOpen(false)}
                adminToken={adminToken!}
                onJobCreated={async () => {
                    await fetchJobs();
                    setPage(1);
                }}
            />
        </Box>
    );
}