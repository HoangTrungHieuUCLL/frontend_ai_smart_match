import { useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Group, Image, Modal, Stack, Text, Textarea, TextInput } from "@mantine/core";
import JobListing from "../components/JobListing";
import { Job, JobCreatePayload } from "../types";
import JobService from "../services/JobService";
import CVUploadButton from "../components/CVUploadButton";
import CVUploadModal from "../components/CVUploadModal";
import { useTranslation } from "../contexts/I18nContext";
import { getSavedJobs } from "../utils/savedJobs";
import { notifications } from "@mantine/notifications";

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

export default function JobSearchWithAIPage() {
    const { t } = useTranslation();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [addJobOpen, setAddJobOpen] = useState(false);
    const [adminToken, setAdminToken] = useState<string | null>(null);
    const [jobForm, setJobForm] = useState<JobFormState>(() => getEmptyJobForm());
    const [isRegistering, setIsRegistering] = useState(false);

    const [search, setSearch] = useState("");
    const [uploadedCvName, setUploadedCvName] =useState<string | null>(null);
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [shareOpened, setShareOpened] = useState(false);
    // const [copiedUrl, setCopiedUrl] = useState("");
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

    useEffect(() => {
        setAdminToken(localStorage.getItem("access_token"));
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search, showSavedOnly]);

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

    const updateJobForm = (field: keyof JobFormState, value: string) => {
        setJobForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleRegisterJob = async () => {
        const hasMissingRequiredField = requiredJobFields.some(
            (field) => !jobForm[field].trim()
        );

        if (hasMissingRequiredField) {
            notifications.show({
                color: "red",
                message: "Please complete all required job fields.",
                autoClose: 3000,
            });
            return;
        }

        if (!adminToken) {
            notifications.show({
                color: "red",
                message: "Please log in as admin before registering a job.",
                autoClose: 3000,
            });
            return;
        }

        const payload: JobCreatePayload = {
            company_name: jobForm.company_name.trim(),
            position: jobForm.position.trim(),
            date: jobForm.date_posted,
            location: jobForm.location.trim(),
            type: jobForm.job_type.trim(),
            overview: jobForm.overview.trim(),
            responsibilities: jobForm.responsibilities.trim(),
            requirements: jobForm.requirements.trim(),
            offers: jobForm.offers.trim(),
            salary: jobForm.salary_usd.trim() || null,
            notes: jobForm.notes.trim() || null,
            requirements_simplified: jobForm.requirements_simplified.trim(),
        };

        try {
            setIsRegistering(true);
            await JobService.createJob(payload, adminToken);
            await fetchJobs();
            setAddJobOpen(false);
            setJobForm(getEmptyJobForm());
            setPage(1);

            notifications.show({
                message: "Job registered successfully.",
                autoClose: 3000,
            });
        } catch (error) {
            notifications.show({
                color: "red",
                message: error instanceof Error ? error.message : "Failed to register job.",
                autoClose: 3000,
            });
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <Box style={{ minHeight: "100vh", backgroundColor: "#f7f2ef", padding: "28px 0" }}>
            <Container size="1100px">
                <Group justify="space-between" align="center" style={{ marginBottom: 24 }}>
                    {/* <Stack gap={4}>
                        <Title order={2} style={{ color: "#623a26", fontWeight: 700 }}>
                            {t("jobSearch.title")}
                        </Title>
                        <Text size="sm" c="dimmed">
                            {t("jobSearch.subtitle")}
                        </Text>
                    </Stack> */}

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
                    <Button
                        radius="xl"
                        variant={showSavedOnly ? "filled" : "light"}
                        style={{
                            backgroundColor: showSavedOnly ? BROWN : "transparent",
                            border: `1px solid ${BROWN}`,
                            color: showSavedOnly ? "#fff" : BROWN,
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                        }}
                        onClick={() => setShowSavedOnly((prev) => !prev)}
                    >
                        Saved Jobs
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
                                setJobForm((current) => ({
                                    ...current,
                                    date_posted: getTodayDate(),
                                }));
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

                </Group>
                </Group>

                <Stack gap="md">
                    {currentJobs.map((job) => (
                        <JobListing key={job.id} job={job}
                         onShare={handleShare}/>
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

            <Modal
                opened={addJobOpen}
                onClose={() => setAddJobOpen(false)}
                centered
                size="lg"
                title="Add a new job"
            >
                <Stack gap="sm">
                    <Group grow align="flex-start">
                        <TextInput
                            label="Company name"
                            value={jobForm.company_name}
                            onChange={(e) => updateJobForm("company_name", e.currentTarget.value)}
                            required
                        />
                        <TextInput
                            label="Position"
                            value={jobForm.position}
                            onChange={(e) => updateJobForm("position", e.currentTarget.value)}
                            required
                        />
                    </Group>

                    <Group grow align="flex-start">
                        <TextInput
                            label="Date posted"
                            value={jobForm.date_posted}
                            readOnly
                            required
                        />
                        <TextInput
                            label="Location"
                            value={jobForm.location}
                            onChange={(e) => updateJobForm("location", e.currentTarget.value)}
                            required
                        />
                    </Group>

                    <Group grow align="flex-start">
                        <TextInput
                            label="Job type"
                            value={jobForm.job_type}
                            onChange={(e) => updateJobForm("job_type", e.currentTarget.value)}
                            required
                        />
                        <TextInput
                            label="Salary USD"
                            value={jobForm.salary_usd}
                            onChange={(e) => updateJobForm("salary_usd", e.currentTarget.value)}
                            placeholder="Optional"
                        />
                    </Group>

                    <Textarea
                        label="Overview"
                        value={jobForm.overview}
                        onChange={(e) => updateJobForm("overview", e.currentTarget.value)}
                        minRows={3}
                        autosize
                        required
                    />
                    <Textarea
                        label="Responsibilities"
                        value={jobForm.responsibilities}
                        onChange={(e) => updateJobForm("responsibilities", e.currentTarget.value)}
                        minRows={3}
                        autosize
                        required
                    />
                    <Textarea
                        label="Requirements"
                        value={jobForm.requirements}
                        onChange={(e) => updateJobForm("requirements", e.currentTarget.value)}
                        minRows={3}
                        autosize
                        required
                    />
                    <Textarea
                        label="Offers"
                        value={jobForm.offers}
                        onChange={(e) => updateJobForm("offers", e.currentTarget.value)}
                        minRows={3}
                        autosize
                        required
                    />
                    <Textarea
                        label="Notes"
                        value={jobForm.notes}
                        onChange={(e) => updateJobForm("notes", e.currentTarget.value)}
                        minRows={2}
                        autosize
                        placeholder="Optional"
                    />
                    <Textarea
                        label="Requirements simplified"
                        value={jobForm.requirements_simplified}
                        onChange={(e) => updateJobForm("requirements_simplified", e.currentTarget.value)}
                        minRows={3}
                        autosize
                        required
                    />

                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="light"
                            color={BROWN}
                            onClick={() => setAddJobOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            style={{ backgroundColor: BROWN }}
                            loading={isRegistering}
                            onClick={handleRegisterJob}
                        >
                            Register
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Box>
    );
}
