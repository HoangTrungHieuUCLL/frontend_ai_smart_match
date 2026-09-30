import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Container,
  Group,
  Image,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import JobListing from "../components/JobListing";
import { Job, JobFilterOptions } from "../types";
import JobService from "../services/JobService";
import JobFilterPanel, { EMPTY_FILTERS, hasActiveFilters, JobFilters, matchesJobFilters } from "../components/JobFilterPanel";
import CVUploadButton from "../components/CVUploadButton";
import CVUploadModal from "../components/CVUploadModal";
import { useTranslation } from "../contexts/I18nContext";
import { CvConfirmReturn } from "../services/CvService";
import { getGuestSavedJobs } from "../utils/savedJobs";
import ProfileService from "../services/ProfileService";
import AddJobModal from "../components/AddJobModal";
import JobListingSkeleton from "../components/skeleton/JobListingSkeleton";
import { isAdminToken } from "../utils/auth";

type SortOption = "best_match" | "newest_first" | "company_az";

const JOBS_PER_PAGE = 10;
const BROWN = "#774326";

const SCORE_STORAGE_KEY = "jobScores";
const CV_NAME_STORAGE_KEY = "cvName";

const saveScoresToStorage = (results: CvConfirmReturn[]) => {
  const existing: CvConfirmReturn[] = JSON.parse(
    sessionStorage.getItem(SCORE_STORAGE_KEY) ?? "[]",
  );
  const merged = new Map(
    existing.map((r) => [r.job_id, r.compatibility_score]),
  );
  results.forEach((r) => merged.set(r.job_id, r.compatibility_score));
  sessionStorage.setItem(
    SCORE_STORAGE_KEY,
    JSON.stringify(
      Array.from(merged.entries()).map(([job_id, compatibility_score]) => ({
        job_id,
        compatibility_score,
      })),
    ),
  );
};

const applyStoredScores = (jobList: Job[]): Job[] => {
  const stored: CvConfirmReturn[] = JSON.parse(
    sessionStorage.getItem(SCORE_STORAGE_KEY) ?? "[]",
  );
  if (!stored.length) return jobList;
  const scoreMap = new Map(
    stored.map((r) => [r.job_id, r.compatibility_score]),
  );
  return jobList.map((job) => ({
    ...job,
    compatibility_score:
      scoreMap.get(job.id) ?? job.compatibility_score ?? null,
  }));
};

export default function JobSearchWithAIPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authVersion, setAuthVersion] = useState(0);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<JobFilters>(EMPTY_FILTERS);
  const [filterOptions, setFilterOptions] = useState<JobFilterOptions>({ category_l2: [], category_l3: [], location: [] });
  const [uploadedCvName, setUploadedCvName] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("newest_first");

  const [compareMode, setCompareMode] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<Set<number>>(new Set());

  const MAX_COMPARE = 4;

  const handleToggleSelect = (jobId: number) => {
    setSelectedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else if (next.size < MAX_COMPARE) {
        next.add(jobId);
      }
      return next;
    });
  };

  const handleCompare = () => {
    router.push({
      pathname: "/compare",
      query: { jobs: Array.from(selectedJobs) },
    });
  };

  const handleToggleCompareMode = () => {
    setCompareMode((current) => {
      if (current) {
        setSelectedJobs(new Set());
      }

      return !current;
    });
  };

  useEffect(() => {
    const stored = sessionStorage.getItem(CV_NAME_STORAGE_KEY);
    setUploadedCvName(stored);
    if (stored) setSortOption("best_match");
  }, []);

  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [shareOpened, setShareOpened] = useState(false);
  const isAdmin = isAdminToken(adminToken);
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
    JobService.getFilterOptions()
      .then(setFilterOptions)
      .catch((error) => console.error("Failed to fetch filter options", error));
  }, []);

  useEffect(() => {
    setAdminToken(localStorage.getItem("access_token"));
  }, []);

  useEffect(() => {
    const syncAuthState = () => {
      setAdminToken(localStorage.getItem("access_token"));
      setAuthVersion((current) => current + 1);
    };

    window.addEventListener("storage", syncAuthState);
    window.addEventListener("auth-change", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("auth-change", syncAuthState);
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, showSavedOnly, sortOption, filters]);

  useEffect(() => {
    if (!showSavedOnly) return;

    const profileId = localStorage.getItem("profile_id");
    if (profileId) {
      ProfileService.getSavedJobs(Number(profileId)).then(setSavedJobIds).catch(() => setSavedJobIds([]));
    } else {
      setSavedJobIds(getGuestSavedJobs());
    }
  }, [showSavedOnly, authVersion]);

  useEffect(() => {
    if (isAdmin) {
      setShowSavedOnly(false);
    }
  }, [isAdmin]);

  const scoredJobs = useMemo(() => {
    return jobs.map((job) => ({
      ...job,
      compatibility_score: job.compatibility_score ?? null,
    }));
  }, [jobs]);

  const sortedJobs = useMemo(() => {
    return [...scoredJobs].sort((a, b) => {
      if (sortOption === "best_match") {
        const diff =
          (b.compatibility_score ?? 0) - (a.compatibility_score ?? 0);
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

  const filteredJobs = useMemo(() => {
    const q = search.toLowerCase();

    return sortedJobs.filter((job) => {
      const matchesSearch =
        job.position?.toLowerCase().includes(q) ||
        job.company_name?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q) ||
        job.requirements?.toLowerCase().includes(q);

      const matchesSaved = showSavedOnly ? savedJobIds.includes(job.id) : true;

      return matchesSearch && matchesSaved && matchesJobFilters(job, filters);
    });
  }, [sortedJobs, search, showSavedOnly, savedJobIds, filters]);

  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));

  const hasSearch = search.trim().length > 0 || hasActiveFilters(filters);
  const noJobsInDatabase = jobs.length === 0;
  const showEmptyState = !isLoading && filteredJobs.length === 0;

  const emptyStateContent = useMemo(() => {
    if (noJobsInDatabase) {
      return {
        title: t("jobSearch.noJobsAvailable"),
        description: t("jobSearch.checkBackSoon"),
        showClearFilters: false,
      };
    }

    if (hasSearch && showSavedOnly) {
      return {
        title: t("jobSearch.noJobsFound"),
        description: t("jobSearch.noSavedJobsMatch"),
        showClearFilters: true,
      };
    }

    if (showSavedOnly) {
      return {
        title: t("jobSearch.noJobsFound"),
        description: t("jobSearch.noSavedJobsYet"),
        showClearFilters: true,
      };
    }

    if (hasSearch) {
      return {
        title: t("jobSearch.noJobsFound"),
        description: t("jobSearch.tryDifferentSearch"),
        showClearFilters: true,
      };
    }

    return {
      title: t("jobSearch.noJobsFound"),
      description: "",
      showClearFilters: true,
    };
  }, [noJobsInDatabase, hasSearch, showSavedOnly, filters, t]);

  const clearFilters = () => {
    setSearch("");
    setShowSavedOnly(false);
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const currentJobs = useMemo(() => {
    return filteredJobs.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE);
  }, [filteredJobs, page]);

  const handleShare = async (jobId: number) => {
    const url = `${window.location.origin}/job-info/${jobId}`;

    await navigator.clipboard.writeText(url);

    // setCopiedUrl(url);
    setShareOpened(true);
  };

    return (
        <Box style={{ minHeight: "100vh", backgroundColor: "#f7f2ef", padding: "28px 0" }}>
            <Container size="1360px">
                <Group justify="flex-end" gap="xs" align="center" style={{ marginBottom: 24 }}>
                    {!isAdmin && (
                        <CVUploadButton
                            label={uploadedCvName ?? undefined}
                            onClick={() => setModalOpen(true)} />
                    )}

                    <TextInput
                        placeholder={t("jobSearch.searchPlaceholder")}
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
                    {!isAdmin && (
                        <>
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
                                {t("jobSearch.savedJobsButton")}
                            </Button>

                            <Button
                                radius="xl"
                                variant={compareMode ? "filled" : "light"}
                                h={40}
                                style={{
                                    backgroundColor: compareMode ? BROWN : "transparent",
                                    border: `1px solid ${BROWN}`,
                                    color: compareMode ? "#fff" : BROWN,
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                }}
                                onClick={handleToggleCompareMode}
                            >
                                {t("jobSearch.compareJobsButton")}
                            </Button>
                        </>
                    )}

                    {isAdmin && (
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
                                    {t("jobSearch.addNewJob")}
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
                                label: t("jobSearch.bestMatch"),
                                disabled: !jobs.some(j => j.compatibility_score),
                            },
                            { value: "newest_first", label: t("jobSearch.newestFirst") },
                            { value: "company_az", label: t("jobSearch.companyAZ") },
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

                <Box style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                    <Box
                        style={{
                            width: 280,
                            flexShrink: 0,
                            backgroundColor: "#fff",
                            borderRadius: 16,
                            padding: 16,
                            border: `1px solid rgba(119, 67, 38, 0.18)`,
                        }}
                    >
                        <JobFilterPanel filters={filters} onChange={setFilters} filterOptions={filterOptions} />
                    </Box>

                    <Box style={{ flex: 1, minWidth: 0 }}>
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
                                            {t("jobSearch.clearFilters")}
                                        </Button>
                                    )}
                                </Stack>
                            </Box>
                        ) : (
                            <Stack gap="md">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <JobListingSkeleton key={i} />
                                    ))
                                ) : (
                                    currentJobs.map((job) => (
                                        <JobListing
                                            key={job.id}
                                            job={job}
                                            onShare={handleShare}
                                            isSelected={selectedJobs.has(job.id)}
                                            onToggleSelect={compareMode ? () => handleToggleSelect(job.id) : undefined}
                                            selectDisabled={selectedJobs.size >= MAX_COMPARE}
                                            showSelectControl={compareMode}
                                            hideSaveAction={isAdmin}
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
                    </Box>
                </Box>
            </Container>


      <CVUploadModal
        opened={modalOpen}
        onClose={(results, cvName) => {
          setModalOpen(false);

          if (!results) return;
          if (cvName) {
            setUploadedCvName(cvName);
            sessionStorage.setItem(CV_NAME_STORAGE_KEY, cvName);
          }

          saveScoresToStorage(results);
          setSortOption("best_match");

          const scoreMap = new Map(
            results.map((r) => [r.job_id, r.compatibility_score]),
          );

          setJobs((prevJobs) =>
            prevJobs.map((job) => ({
              ...job,
              compatibility_score: scoreMap.get(job.id) ?? null,
            })),
          );
        }}
      />

      <Modal
        opened={shareOpened}
        onClose={() => setShareOpened(false)}
        centered
        title={t("jobSearch.shareJobTitle")}
      >
        <Stack>
          <Text>{t("jobSearch.linkCopied")}</Text>

          <Button
            radius="xl"
            color={BROWN}
            onClick={() => setShareOpened(false)}
          >
            {t("common.ok")}
          </Button>
        </Stack>
      </Modal>

      <AddJobModal
        opened={addJobOpen}
        onClose={() => setAddJobOpen(false)}
        adminToken={adminToken!}
        onJobSaved={async () => {
          await fetchJobs();
          setPage(1);
        }}
      />

      {/* Sticky compare bar */}
      {selectedJobs.size >= 2 && (
        <Box
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            padding: "16px 24px",
            backgroundColor: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(8px)",
            borderTop: `1px solid rgba(119, 67, 38, 0.18)`,
            boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <Group gap="md" align="center">
            <Button
              radius="xl"
              size="md"
              style={{ backgroundColor: BROWN, minWidth: 160 }}
              onClick={handleCompare}
            >
              {t("jobSearch.compareCount", { count: selectedJobs.size })}
            </Button>
            <Button
              radius="xl"
              size="md"
              variant="subtle"
              style={{ color: BROWN }}
              onClick={() => setSelectedJobs(new Set())}
            >
              {t("jobSearch.clear")}
            </Button>
          </Group>
        </Box>
      )}
    </Box>
  );
}
