import { useEffect, useMemo, useState } from "react";
import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Container,
    Group,
    Loader,
    Modal,
    Paper,
    ScrollArea,
    Stack,
    Table,
    Text,
    Title,
    Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { CV, Job } from "../types";
import ExecutiveViewService, {
    ExecutiveViewDashboard,
    TopSkill,
} from "../services/ExecutiveViewService";
import { CVSummaryDetails } from "../components/CVUploadConfirmation";
import JobService from "../services/JobService";
import CvService from "../services/CvService";
import AddJobModal from "../components/AddJobModal";

const BROWN = "#774326";

function getCandidateName(cv: CV) {
    const profile = cv.candidate_profile;

    if (!profile) {
        return "Unknown candidate";
    }

    return [profile.given_name, profile.middle_name, profile.family_name]
        .filter(Boolean)
        .join(" ");
}

function KpiCard({label, value}: { label: string; value: number }) {
    return (
        <Paper
            p="lg"
            radius="md"
            style={{
                border: "1px solid rgba(119, 67, 38, 0.16)",
                backgroundColor: "#ffffff",
            }}
        >
            <Stack gap={6}>
                <Text size="sm" fw={600} c="dimmed">
                    {label}
                </Text>
                <Text size="34px" fw={800} c={BROWN} lh={1}>
                    {value.toLocaleString()}
                </Text>
            </Stack>
        </Paper>
    );
}

function SkillsBarChart({skills}: { skills: TopSkill[] }) {
    const maxCount = Math.max(...skills.map((skill) => skill.count), 1);

    if (skills.length === 0) {
        return (
            <Paper p="lg" radius="md" style={{border: "1px solid rgba(119, 67, 38, 0.16)"}}>
                <Text c="dimmed">No skills have been extracted from uploaded CVs yet.</Text>
            </Paper>
        );
    }

    return (
        <Paper
            p="lg"
            radius="md"
            style={{
                border: "1px solid rgba(119, 67, 38, 0.16)",
                backgroundColor: "#ffffff",
            }}
        >
            <Stack gap="md">
                {skills.map((skill) => (
                    <Box key={skill.skill}>
                        <Group justify="space-between" gap="md" wrap="nowrap" mb={6}>
                            <Text size="sm" fw={600} lineClamp={1}>
                                {skill.skill}
                            </Text>
                            <Text size="sm" fw={700} c={BROWN}>
                                {skill.count}
                            </Text>
                        </Group>
                        <Box
                            style={{
                                height: 14,
                                borderRadius: 8,
                                backgroundColor: "#f1e3d7",
                                overflow: "hidden",
                            }}
                        >
                            <Box
                                style={{
                                    width: `${(skill.count / maxCount) * 100}%`,
                                    height: "100%",
                                    borderRadius: 8,
                                    backgroundColor: BROWN,
                                }}
                            />
                        </Box>
                    </Box>
                ))}
            </Stack>
        </Paper>
    );
}

export default function ExecutiveViewPage() {
    const [dashboard, setDashboard] = useState<ExecutiveViewDashboard | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedCv, setSelectedCv] = useState<CV | null>(null);
    const [cvToDelete, setCvToDelete] = useState<CV | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
    const [jobModalOpen, setJobModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [error, setError] = useState("");
    const [jobError, setJobError] = useState("");
    const [adminToken, setAdminToken] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingCvId, setDeletingCvId] = useState<number | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await ExecutiveViewService.getDashboard();
                setDashboard(response);
            } catch {
                setError("Unable to load executive dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const fetchJobs = async () => {
        try {
            setJobsLoading(true);
            setJobError("");
            const response = await JobService.getAllJobs();
            setJobs(response);
        } catch {
            setJobError("Unable to load job listings.");
        } finally {
            setJobsLoading(false);
        }
    };

    useEffect(() => {
        setAdminToken(localStorage.getItem("access_token"));
        fetchJobs();
    }, []);

    const cvs = dashboard?.cvs ?? [];

    const rows = useMemo(() => {
        return cvs.map((cv) => (
            <Table.Tr
                key={cv.id}
                onClick={() => setSelectedCv(cv)}
                style={{
                    cursor: "pointer",
                    opacity: deletingCvId === cv.id ? 0.55 : 1,
                }}
            >
                <Table.Td>{cv.id}</Table.Td>
                <Table.Td>
                    <Text fw={600}>{cv.filename}</Text>
                </Table.Td>
                <Table.Td>{getCandidateName(cv)}</Table.Td>
                <Table.Td>
                    <Text lineClamp={2}>
                        {cv.candidate_profile?.skills || "No skills extracted"}
                    </Text>
                </Table.Td>
                <Table.Td>
                    <Group justify="flex-end">
                        <Tooltip label="Delete CV">
                            <ActionIcon
                                variant="light"
                                color="red"
                                aria-label={`Delete ${cv.filename}`}
                                disabled={!adminToken || deletingCvId !== null}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setCvToDelete(cv);
                                }}
                            >
                                {deletingCvId === cv.id ? (
                                    <Loader size={16} color="red" />
                                ) : (
                                    <IconTrash size={18} />
                                )}
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Table.Td>
            </Table.Tr>
        ));
    }, [adminToken, cvs, deletingCvId]);

    const jobRows = useMemo(() => {
        return jobs.map((job) => (
            <Table.Tr key={job.id}>
                <Table.Td>
                    <Text fw={700}>{job.position}</Text>
                </Table.Td>
                <Table.Td>{job.company_name}</Table.Td>
                <Table.Td>{job.location || "Not specified"}</Table.Td>
                <Table.Td>{job.type || "Not specified"}</Table.Td>
                <Table.Td>
                    <Text lineClamp={2}>{job.requirements || "No requirements listed"}</Text>
                </Table.Td>
                <Table.Td>{job.salary || "Not specified"}</Table.Td>
                <Table.Td>
                    <Group gap="xs" justify="flex-end" wrap="nowrap">
                        <Tooltip label="Edit job">
                            <ActionIcon
                                variant="light"
                                color="brown"
                                aria-label={`Edit ${job.position}`}
                                disabled={!adminToken}
                                onClick={() => {
                                    setSelectedJob(job);
                                    setJobModalOpen(true);
                                }}
                            >
                                <IconEdit size={18} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete job">
                            <ActionIcon
                                variant="light"
                                color="red"
                                aria-label={`Delete ${job.position}`}
                                disabled={!adminToken}
                                onClick={() => setJobToDelete(job)}
                            >
                                <IconTrash size={18} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Table.Td>
            </Table.Tr>
        ));
    }, [adminToken, jobs]);

    const handleAddJob = () => {
        setSelectedJob(null);
        setJobModalOpen(true);
    };

    const handleCloseJobModal = () => {
        setJobModalOpen(false);
        setSelectedJob(null);
    };

    const handleDeleteJob = async () => {
        if (!jobToDelete || !adminToken) {
            return;
        }

        try {
            setIsDeleting(true);
            await JobService.deleteJob(jobToDelete.id, adminToken);
            await fetchJobs();
            notifications.show({
                message: "Job deleted successfully.",
                autoClose: 3000,
            });
            setJobToDelete(null);
        } catch (error) {
            notifications.show({
                color: "red",
                message: error instanceof Error ? error.message : "Failed to delete job.",
                autoClose: 3000,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCv = async () => {
        if (!cvToDelete || !adminToken || deletingCvId !== null) {
            return;
        }

        try {
            setDeletingCvId(cvToDelete.id);
            await CvService.deleteCv(cvToDelete.id, adminToken);

            setDashboard((current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    total_cvs: Math.max(0, current.total_cvs - 1),
                    cvs: current.cvs.filter((cv) => cv.id !== cvToDelete.id),
                };
            });

            if (selectedCv?.id === cvToDelete.id) {
                setSelectedCv(null);
            }

            notifications.show({
                message: "CV deleted successfully",
                autoClose: 3000,
            });
            setCvToDelete(null);
        } catch (error) {
            notifications.show({
                color: "red",
                message: error instanceof Error ? error.message : "Failed to delete CV.",
                autoClose: 3000,
            });
        } finally {
            setDeletingCvId(null);
        }
    };

    return (
        <Box style={{minHeight: "100vh", backgroundColor: "#f7f2ef", padding: "28px 0"}}>
            <Container size="1200px">
                <Group justify="space-between" align="flex-start" mb="xl">
                    <Stack gap={4}>
                        <Title order={2} style={{color: "#623a26", fontWeight: 800}}>
                            Executive View
                        </Title>
                        <Text size="sm" c="dimmed">
                            Dashboard overview of jobs, uploaded CVs, and extracted candidate skills.
                        </Text>
                    </Stack>
                    <Badge color="brown" variant="light" size="lg">
                        Admin dashboard
                    </Badge>
                </Group>

                {loading ? (
                    <Stack align="center" py={80}>
                        <Loader color={BROWN} size="lg" />
                        <Text c="dimmed">Loading dashboard data...</Text>
                    </Stack>
                ) : error ? (
                    <Paper p="lg" radius="md" style={{border: "1px solid rgba(119, 67, 38, 0.16)"}}>
                        <Text c="red" fw={600}>{error}</Text>
                    </Paper>
                ) : dashboard && (
                    <Stack gap="xl">
                        <Box
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: 16,
                            }}
                        >
                            <KpiCard label="Total number of jobs" value={dashboard.total_jobs} />
                            <KpiCard label="Total number of uploaded CVs" value={dashboard.total_cvs} />
                        </Box>

                        <Stack gap="sm">
                            <Title order={3} style={{color: "#623a26"}}>
                                Top 15 Skills
                            </Title>
                            <SkillsBarChart skills={dashboard.top_skills} />
                        </Stack>

                        <Stack gap="sm">
                            <Group justify="space-between" align="center">
                                <Stack gap={2}>
                                    <Title order={3} style={{color: "#623a26"}}>
                                        Job Management
                                    </Title>
                                    <Text size="sm" c="dimmed">
                                        Create, edit, and remove listings shown to candidates.
                                    </Text>
                                </Stack>
                                <Button
                                    leftSection={<IconPlus size={18} />}
                                    style={{backgroundColor: BROWN}}
                                    disabled={!adminToken}
                                    onClick={handleAddJob}
                                >
                                    Add job
                                </Button>
                            </Group>

                            {!adminToken && (
                                <Paper p="md" radius="md" style={{border: "1px solid rgba(119, 67, 38, 0.16)"}}>
                                    <Text c="red" fw={600}>
                                        Admin login is required to manage jobs.
                                    </Text>
                                </Paper>
                            )}

                            <Paper
                                radius="md"
                                style={{
                                    border: "1px solid rgba(119, 67, 38, 0.16)",
                                    backgroundColor: "#ffffff",
                                    overflow: "hidden",
                                }}
                            >
                                <ScrollArea>
                                    <Table highlightOnHover verticalSpacing="md" miw={980}>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Position</Table.Th>
                                                <Table.Th>Company</Table.Th>
                                                <Table.Th>Location</Table.Th>
                                                <Table.Th>Type</Table.Th>
                                                <Table.Th>Requirements</Table.Th>
                                                <Table.Th>Salary</Table.Th>
                                                <Table.Th style={{textAlign: "right"}}>Actions</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {jobsLoading ? (
                                                <Table.Tr>
                                                    <Table.Td colSpan={7}>
                                                        <Group justify="center" py="lg">
                                                            <Loader color={BROWN} size="sm" />
                                                            <Text c="dimmed">Loading jobs...</Text>
                                                        </Group>
                                                    </Table.Td>
                                                </Table.Tr>
                                            ) : jobError ? (
                                                <Table.Tr>
                                                    <Table.Td colSpan={7}>
                                                        <Text c="red" fw={600} ta="center" py="lg">
                                                            {jobError}
                                                        </Text>
                                                    </Table.Td>
                                                </Table.Tr>
                                            ) : jobRows.length ? jobRows : (
                                                <Table.Tr>
                                                    <Table.Td colSpan={7}>
                                                        <Text c="dimmed" ta="center" py="lg">
                                                            No jobs found.
                                                        </Text>
                                                    </Table.Td>
                                                </Table.Tr>
                                            )}
                                        </Table.Tbody>
                                    </Table>
                                </ScrollArea>
                            </Paper>
                        </Stack>

                        <Stack gap="sm">
                            <Group justify="space-between">
                                <Title order={3} style={{color: "#623a26"}}>
                                    CV Extracted Data
                                </Title>
                                <Text size="sm" c="dimmed">
                                    Click a row to view the full CV summary.
                                </Text>
                            </Group>

                            <Paper
                                radius="md"
                                style={{
                                    border: "1px solid rgba(119, 67, 38, 0.16)",
                                    backgroundColor: "#ffffff",
                                    overflow: "hidden",
                                }}
                            >
                                <ScrollArea>
                                    <Table highlightOnHover verticalSpacing="md" miw={860}>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>ID</Table.Th>
                                                <Table.Th>CV file name</Table.Th>
                                                <Table.Th>Candidate full name</Table.Th>
                                                <Table.Th>Skills</Table.Th>
                                                <Table.Th style={{textAlign: "right"}}>Actions</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {rows.length ? rows : (
                                                <Table.Tr>
                                                    <Table.Td colSpan={5}>
                                                        <Text c="dimmed" ta="center" py="lg">
                                                            No uploaded CVs found.
                                                        </Text>
                                                    </Table.Td>
                                                </Table.Tr>
                                            )}
                                        </Table.Tbody>
                                    </Table>
                                </ScrollArea>
                            </Paper>
                        </Stack>
                    </Stack>
                )}
            </Container>

            <Modal
                opened={selectedCv !== null}
                onClose={() => setSelectedCv(null)}
                title={<Text fw={700} size="lg">CV Summary</Text>}
                size="xl"
            >
                {selectedCv && (
                    <CVSummaryDetails
                        cv={selectedCv}
                        footer={
                            <Group justify="space-between">
                                <Button
                                    color="red"
                                    variant="light"
                                    leftSection={<IconTrash size={18} />}
                                    disabled={!adminToken || deletingCvId !== null}
                                    onClick={() => setCvToDelete(selectedCv)}
                                >
                                    Delete
                                </Button>
                                <Button color={BROWN} onClick={() => setSelectedCv(null)}>
                                    Close
                                </Button>
                            </Group>
                        }
                    />
                )}
            </Modal>

            {adminToken && (
                <AddJobModal
                    opened={jobModalOpen}
                    onClose={handleCloseJobModal}
                    adminToken={adminToken}
                    job={selectedJob}
                    onJobSaved={fetchJobs}
                />
            )}

            <Modal
                opened={jobToDelete !== null}
                onClose={() => setJobToDelete(null)}
                centered
                title={<Text fw={700} size="lg">Delete job</Text>}
            >
                <Stack>
                    <Text>
                        {jobToDelete
                            ? `Are you sure you want to delete ${jobToDelete.position} at ${jobToDelete.company_name}? This action cannot be undone.`
                            : ""}
                    </Text>
                    <Group justify="flex-end">
                        <Button
                            variant="light"
                            color={BROWN}
                            onClick={() => setJobToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="red"
                            loading={isDeleting}
                            onClick={handleDeleteJob}
                        >
                            Delete
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal
                opened={cvToDelete !== null}
                onClose={() => {
                    if (deletingCvId === null) {
                        setCvToDelete(null);
                    }
                }}
                centered
                title={<Text fw={700} size="lg">Delete CV</Text>}
            >
                <Stack>
                    <Text>
                        {cvToDelete
                            ? `Delete CV '${cvToDelete.filename}' and all associated data for ${getCandidateName(cvToDelete)}? This cannot be undone.`
                            : ""}
                    </Text>
                    <Group justify="flex-end">
                        <Button
                            variant="light"
                            color={BROWN}
                            onClick={() => setCvToDelete(null)}
                            disabled={deletingCvId !== null}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="red"
                            loading={deletingCvId !== null}
                            onClick={handleDeleteCv}
                        >
                            Delete
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Box>
    );
}
