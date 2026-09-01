import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
    Select,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
    Tooltip,
    UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronUp,
    IconEdit,
    IconPlus,
    IconSearch,
    IconSelector,
    IconTrash,
} from "@tabler/icons-react";
import { CV, Job } from "../types";
import { useTranslation } from "../contexts/I18nContext";
import ExecutiveViewService, {
    CvSortBy,
    ExecutiveViewDashboard,
    ExecutiveViewRequestError,
    SortDirection,
    TopSkill,
} from "../services/ExecutiveViewService";
import { CVSummaryDetails } from "../components/CVUploadConfirmation";
import JobService from "../services/JobService";
import CvService from "../services/CvService";
import AddJobModal from "../components/AddJobModal";

const BROWN = "#774326";
const ROWS_PER_PAGE_OPTIONS = ["10", "20", "50"];

type SortableHeaderProps = {
    label: string;
    sortKey: CvSortBy;
    activeSortBy: CvSortBy;
    sortDirection: SortDirection;
    onSort: (sortKey: CvSortBy) => void;
};

function getCandidateName(cv: CV, unknownLabel: string) {
    const profile = cv.candidate_profile;

    if (!profile) {
        return unknownLabel;
    }

    return [profile.given_name, profile.middle_name, profile.family_name]
        .filter(Boolean)
        .join(" ");
}

function KpiCard({label, value}: { label: string; value: number }) {
    return (
        <Paper
            data-testid="kpi-card"
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

function SortableHeader({
                            label,
                            sortKey,
                            activeSortBy,
                            sortDirection,
                            onSort,
                        }: SortableHeaderProps) {
    const isActive = activeSortBy === sortKey;
    const SortIcon = !isActive
        ? IconSelector
        : sortDirection === "asc"
            ? IconChevronUp
            : IconChevronDown;

    return (
        <Table.Th>
            <UnstyledButton
                onClick={() => onSort(sortKey)}
                style={{width: "100%"}}
                aria-label={`Sort by ${label}`}
            >
                <Group gap={6} wrap="nowrap">
                    <Text fw={700} size="sm">
                        {label}
                    </Text>
                    <SortIcon size={16} color={isActive ? BROWN : "#9b8a80"} />
                </Group>
            </UnstyledButton>
        </Table.Th>
    );
}

function SkillsBarChart({skills, emptyLabel}: { skills: TopSkill[]; emptyLabel: string }) {
    const maxCount = Math.max(...skills.map((skill) => skill.count), 1);

    if (skills.length === 0) {
        return (
            <Paper p="lg" radius="md" style={{border: "1px solid rgba(119, 67, 38, 0.16)"}}>
                <Text c="dimmed">{emptyLabel}</Text>
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
                    <Box key={skill.skill} data-testid="skill-bar">
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
    const router = useRouter();
    const { t } = useTranslation();
    const [dashboard, setDashboard] = useState<ExecutiveViewDashboard | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedCv, setSelectedCv] = useState<CV | null>(null);
    const [cvToDelete, setCvToDelete] = useState<CV | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
    const [jobModalOpen, setJobModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [cvTableLoading, setCvTableLoading] = useState(false);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [error, setError] = useState("");
    const [jobError, setJobError] = useState("");
    const [adminToken, setAdminToken] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingCvId, setDeletingCvId] = useState<number | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<CvSortBy>("id");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setPage(1);
            setDebouncedSearch(searchInput);
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [searchInput]);

    useEffect(() => {
        let cancelled = false;

        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) {
                    router.replace("/login");
                    return;
                }

                setError("");
                setCvTableLoading(true);

                const response = await ExecutiveViewService.getDashboard({
                    search: debouncedSearch,
                    sortBy,
                    sortDirection,
                    page,
                    pageSize,
                });

                if (!cancelled) {
                    setDashboard(response);
                }
            } catch (requestError) {
                if (!cancelled) {
                    if (
                        requestError instanceof ExecutiveViewRequestError &&
                        requestError.status === 401
                    ) {
                        router.replace("/login");
                        return;
                    }

                    if (
                        requestError instanceof ExecutiveViewRequestError &&
                        requestError.status === 403
                    ) {
                        setError(t("executiveView.unauthorized"));
                        return;
                    }

                    setError(t("executiveView.loadError"));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setCvTableLoading(false);
                }
            }
        };

        fetchDashboard();

        return () => {
            cancelled = true;
        };
    }, [debouncedSearch, sortBy, sortDirection, page, pageSize, router]);

    const fetchJobs = async () => {
        try {
            setJobsLoading(true);
            setJobError("");
            const response = await JobService.getAllJobs();
            setJobs(response);
        } catch {
            setJobError(t("executiveView.jobLoadError"));
        } finally {
            setJobsLoading(false);
        }
    };

    useEffect(() => {
        setAdminToken(localStorage.getItem("access_token"));
        fetchJobs();
    }, []);

    const cvs = dashboard?.cvs ?? [];
    const cvTable = dashboard?.cv_table;
    const totalMatchingCvs = cvTable?.total_count ?? 0;
    const totalPages = cvTable?.total_pages ?? 1;
    const firstShownCv = totalMatchingCvs === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastShownCv = Math.min(page * pageSize, totalMatchingCvs);

    const handleSort = (nextSortBy: CvSortBy) => {
        setPage(1);

        if (sortBy === nextSortBy) {
            setSortDirection((current) => current === "asc" ? "desc" : "asc");
            return;
        }

        setSortBy(nextSortBy);
        setSortDirection("asc");
    };

    const handlePageSizeChange = (value: string | null) => {
        setPageSize(Number(value ?? 20));
        setPage(1);
    };

    const rows = useMemo(() => {
        return cvs.map((cv) => (
            <Table.Tr
                data-testid="cv-table-row"
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
                <Table.Td>{getCandidateName(cv, t("executiveView.unknownCandidate"))}</Table.Td>
                <Table.Td>
                    <Text lineClamp={2}>
                        {cv.candidate_profile?.skills || t("executiveView.noSkillsShort")}
                    </Text>
                </Table.Td>
                <Table.Td>
                    <Group justify="flex-end">
                        <Tooltip label={t("executiveView.deleteCvTooltip")}>
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
    }, [adminToken, cvs, deletingCvId, t]);

    const jobRows = useMemo(() => {
        return jobs.map((job) => (
            <Table.Tr key={job.id}>
                <Table.Td>
                    <Text fw={700}>{job.position}</Text>
                </Table.Td>
                <Table.Td>{job.company_name}</Table.Td>
                <Table.Td>{job.location || t("common.notSpecified")}</Table.Td>
                <Table.Td>{job.type || t("common.notSpecified")}</Table.Td>
                <Table.Td>
                    <Text lineClamp={2}>{job.requirements || t("executiveView.noRequirementsListed")}</Text>
                </Table.Td>
                <Table.Td>{job.salary || t("common.notSpecified")}</Table.Td>
                <Table.Td>
                    <Group gap="xs" justify="flex-end" wrap="nowrap">
                        <Tooltip label={t("executiveView.editJobTooltip")}>
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
                        <Tooltip label={t("executiveView.deleteJobTooltip")}>
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
    }, [adminToken, jobs, t]);

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
                message: t("executiveView.jobDeletedSuccess"),
                autoClose: 3000,
            });
            setJobToDelete(null);
        } catch (error) {
            notifications.show({
                color: "red",
                message: error instanceof Error ? error.message : t("executiveView.jobDeleteFailed"),
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
                    cv_table: {
                        ...current.cv_table,
                        total_count: Math.max(0, current.cv_table.total_count - 1),
                    },
                };
            });

            if (selectedCv?.id === cvToDelete.id) {
                setSelectedCv(null);
            }

            notifications.show({
                message: t("executiveView.cvDeletedSuccess"),
                autoClose: 3000,
            });
            setCvToDelete(null);
        } catch (error) {
            notifications.show({
                color: "red",
                message: error instanceof Error ? error.message : t("executiveView.cvDeleteFailed"),
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
                            {t("executiveView.title")}
                        </Title>
                        <Text size="sm" c="dimmed">
                            {t("executiveView.subtitle")}
                        </Text>
                    </Stack>
                    <Badge color="brown" variant="light" size="lg">
                        {t("executiveView.adminBadge")}
                    </Badge>
                </Group>

                {loading ? (
                    <Stack align="center" py={80}>
                        <Loader color={BROWN} size="lg" />
                        <Text c="dimmed">{t("executiveView.loadingDashboard")}</Text>
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
                            <KpiCard label={t("executiveView.totalJobs")} value={dashboard.total_jobs} />
                            <KpiCard label={t("executiveView.totalCvs")} value={dashboard.total_cvs} />
                        </Box>

                        <Stack gap="sm">
                            <Title order={3} style={{color: "#623a26"}}>
                                {t("executiveView.topSkills")}
                            </Title>
                            <SkillsBarChart skills={dashboard.top_skills} emptyLabel={t("executiveView.noSkillsExtracted")} />
                        </Stack>

                        <Stack gap="sm">
                            <Group justify="space-between" align="center">
                                <Stack gap={2}>
                                    <Title order={3} style={{color: "#623a26"}}>
                                        {t("executiveView.jobManagement")}
                                    </Title>
                                    <Text size="sm" c="dimmed">
                                        {t("executiveView.jobManagementDesc")}
                                    </Text>
                                </Stack>
                                <Button
                                    leftSection={<IconPlus size={18} />}
                                    style={{backgroundColor: BROWN}}
                                    disabled={!adminToken}
                                    onClick={handleAddJob}
                                >
                                    {t("executiveView.addJob")}
                                </Button>
                            </Group>

                            {!adminToken && (
                                <Paper p="md" radius="md" style={{border: "1px solid rgba(119, 67, 38, 0.16)"}}>
                                    <Text c="red" fw={600}>
                                        {t("executiveView.adminLoginRequired")}
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
                                                <Table.Th>{t("executiveView.colPosition")}</Table.Th>
                                                <Table.Th>{t("executiveView.colCompany")}</Table.Th>
                                                <Table.Th>{t("executiveView.colLocation")}</Table.Th>
                                                <Table.Th>{t("executiveView.colType")}</Table.Th>
                                                <Table.Th>{t("executiveView.colRequirements")}</Table.Th>
                                                <Table.Th>{t("executiveView.colSalary")}</Table.Th>
                                                <Table.Th style={{textAlign: "right"}}>{t("executiveView.colActions")}</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {jobsLoading ? (
                                                <Table.Tr>
                                                    <Table.Td colSpan={7}>
                                                        <Group justify="center" py="lg">
                                                            <Loader color={BROWN} size="sm" />
                                                            <Text c="dimmed">{t("executiveView.loadingJobs")}</Text>
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
                                                            {t("executiveView.noJobsFound")}
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
                            <Group justify="space-between" align="flex-end">
                                <Title order={3} style={{color: "#623a26"}}>
                                    {t("executiveView.cvExtractedData")}
                                </Title>
                                <Text size="sm" c="dimmed">
                                    {t("executiveView.cvExtractedDataDesc")}
                                </Text>
                            </Group>

                            <TextInput
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.currentTarget.value)}
                                leftSection={<IconSearch size={18} />}
                                placeholder={t("executiveView.searchPlaceholder")}
                                aria-label={t("executiveView.searchPlaceholder")}
                            />

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
                                                <SortableHeader
                                                    label={t("executiveView.colId")}
                                                    sortKey="id"
                                                    activeSortBy={sortBy}
                                                    sortDirection={sortDirection}
                                                    onSort={handleSort}
                                                />
                                                <SortableHeader
                                                    label={t("executiveView.colFilename")}
                                                    sortKey="filename"
                                                    activeSortBy={sortBy}
                                                    sortDirection={sortDirection}
                                                    onSort={handleSort}
                                                />
                                                <SortableHeader
                                                    label={t("executiveView.colCandidateName")}
                                                    sortKey="candidate_name"
                                                    activeSortBy={sortBy}
                                                    sortDirection={sortDirection}
                                                    onSort={handleSort}
                                                />
                                                <SortableHeader
                                                    label={t("executiveView.colSkills")}
                                                    sortKey="skills"
                                                    activeSortBy={sortBy}
                                                    sortDirection={sortDirection}
                                                    onSort={handleSort}
                                                />
                                                <Table.Th style={{textAlign: "right"}}>{t("executiveView.colActions")}</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {cvTableLoading ? (
                                                <Table.Tr>
                                                    <Table.Td colSpan={5}>
                                                        <Group justify="center" py="lg">
                                                            <Loader color={BROWN} size="sm" />
                                                            <Text c="dimmed">{t("executiveView.loadingCandidates")}</Text>
                                                        </Group>
                                                    </Table.Td>
                                                </Table.Tr>
                                            ) : rows.length ? rows : (
                                                <Table.Tr>
                                                    <Table.Td colSpan={5}>
                                                        <Text c="dimmed" ta="center" py="lg">
                                                            {debouncedSearch.trim()
                                                                ? t("executiveView.noCandidatesFound")
                                                                : t("executiveView.noCvsFound")}
                                                        </Text>
                                                    </Table.Td>
                                                </Table.Tr>
                                            )}
                                        </Table.Tbody>
                                    </Table>
                                </ScrollArea>
                                <Group
                                    justify="space-between"
                                    gap="md"
                                    p="md"
                                    style={{borderTop: "1px solid rgba(119, 67, 38, 0.12)"}}
                                >
                                    <Text size="sm" c="dimmed">
                                        {t("executiveView.showingRange", {
                                            first: firstShownCv,
                                            last: lastShownCv,
                                            total: totalMatchingCvs,
                                        })}
                                    </Text>
                                    <Group gap="sm">
                                        <Select
                                            data={ROWS_PER_PAGE_OPTIONS}
                                            value={String(pageSize)}
                                            onChange={handlePageSizeChange}
                                            aria-label="Rows per page"
                                            w={92}
                                            allowDeselect={false}
                                        />
                                        <Button
                                            variant="light"
                                            color="brown"
                                            leftSection={<IconChevronLeft size={16} />}
                                            disabled={page <= 1 || cvTableLoading}
                                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                                        >
                                            {t("common.previous")}
                                        </Button>
                                        <Text size="sm" fw={600} style={{minWidth: 84, textAlign: "center"}}>
                                            {t("executiveView.pageOf", { page, total: totalPages })}
                                        </Text>
                                        <Button
                                            variant="light"
                                            color="brown"
                                            rightSection={<IconChevronRight size={16} />}
                                            disabled={page >= totalPages || cvTableLoading}
                                            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                        >
                                            {t("common.next")}
                                        </Button>
                                    </Group>
                                </Group>
                            </Paper>
                        </Stack>
                    </Stack>
                )}
            </Container>

            <Modal
                opened={selectedCv !== null}
                onClose={() => setSelectedCv(null)}
                title={<Text fw={700} size="lg">{t("executiveView.cvSummaryTitle")}</Text>}
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
                                    {t("common.delete")}
                                </Button>
                                <Button color={BROWN} onClick={() => setSelectedCv(null)}>
                                    {t("common.close")}
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
                title={<Text fw={700} size="lg">{t("executiveView.deleteJobTitle")}</Text>}
            >
                <Stack>
                    <Text>
                        {jobToDelete
                            ? t("executiveView.confirmDeleteJob", {
                                position: jobToDelete.position,
                                company: jobToDelete.company_name,
                            })
                            : ""}
                    </Text>
                    <Group justify="flex-end">
                        <Button
                            variant="light"
                            color={BROWN}
                            onClick={() => setJobToDelete(null)}
                            disabled={isDeleting}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            color="red"
                            loading={isDeleting}
                            onClick={handleDeleteJob}
                        >
                            {t("common.delete")}
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
                title={<Text fw={700} size="lg">{t("executiveView.deleteCvTitle")}</Text>}
            >
                <Stack>
                    <Text>
                        {cvToDelete
                            ? t("executiveView.confirmDeleteCv", {
                                filename: cvToDelete.filename,
                                name: getCandidateName(cvToDelete, t("executiveView.unknownCandidate")),
                            })
                            : ""}
                    </Text>
                    <Group justify="flex-end">
                        <Button
                            variant="light"
                            color={BROWN}
                            onClick={() => setCvToDelete(null)}
                            disabled={deletingCvId !== null}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            color="red"
                            loading={deletingCvId !== null}
                            onClick={handleDeleteCv}
                        >
                            {t("common.delete")}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Box>
    );
}
