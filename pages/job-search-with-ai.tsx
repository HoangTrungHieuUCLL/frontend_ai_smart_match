import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Button,
  Drawer,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconAdjustmentsHorizontal, IconArrowLeft, IconArrowRight, IconSearch } from "@tabler/icons-react";
import JobListing from "../components/JobListing";
import JobSearchHero from "../components/JobSearchHero";
import styles from "../styles/editorial.module.css";
import { Job, JobFilterOptions } from "../types";
import JobService from "../services/JobService";
import JobFilterPanel, { EMPTY_FILTERS, hasActiveFilters, JobFilters, matchesJobFilters } from "../components/JobFilterPanel";
import CVUploadModal from "../components/CVUploadModal";
import DeleteCvModal from "../components/DeleteCvModal";
import { useTranslation } from "../contexts/I18nContext";
import CvService, { CvConfirmReturn } from "../services/CvService";
import { clearStoredProfileCv, getStoredProfileCv } from "../utils/profileStorage";
import { notifications } from "@mantine/notifications";
import { getGuestSavedJobs } from "../utils/savedJobs";
import ProfileService from "../services/ProfileService";
import AddJobModal from "../components/AddJobModal";
import JobListingSkeleton from "../components/skeleton/JobListingSkeleton";
import { isAdminToken } from "../utils/auth";

type SortOption = "best_match" | "newest_first" | "company_az";

const JOBS_PER_PAGE = 10;
const INK = "#15110d";

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
  const [deleteCvOpen, setDeleteCvOpen] = useState(false);
  const [isDeletingCv, setIsDeletingCv] = useState(false);
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authVersion, setAuthVersion] = useState(0);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<JobFilters>(EMPTY_FILTERS);
  const [filterOptions, setFilterOptions] = useState<JobFilterOptions>({ category_l2: [], category_l3: [], location: [] });
  const [uploadedCvName, setUploadedCvName] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("newest_first");

  const [filtersOpen, setFiltersOpen] = useState(false);

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

  // One saved-jobs lookup for the whole list (rows used to fetch it each).
  useEffect(() => {
    const profileId = localStorage.getItem("profile_id");
    if (profileId) {
      ProfileService.getSavedJobs(Number(profileId)).then(setSavedJobIds).catch(() => setSavedJobIds([]));
    } else {
      setSavedJobIds(getGuestSavedJobs().map(Number));
    }
  }, [authVersion]);

  const handleSavedChange = (jobId: number, saved: boolean) => {
    setSavedJobIds((prev) => (saved ? [...prev, jobId] : prev.filter((id) => id !== jobId)));
  };

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

  const handleDeleteCv = async () => {
    const storedCv = getStoredProfileCv(localStorage.getItem("email"));
    if (!storedCv?.id) {
      notifications.show({ color: "red", message: t("profile.cvDeleteFailed") });
      return;
    }

    setIsDeletingCv(true);
    try {
      await CvService.deleteCv(storedCv.id, localStorage.getItem("access_token"), storedCv.delete_token);

      clearStoredProfileCv(localStorage.getItem("email"));
      sessionStorage.removeItem(CV_NAME_STORAGE_KEY);
      sessionStorage.removeItem(SCORE_STORAGE_KEY);
      setUploadedCvName(null);
      setSortOption("newest_first");
      setJobs((prevJobs) => prevJobs.map((job) => ({ ...job, compatibility_score: null })));
      setDeleteCvOpen(false);
      notifications.show({ color: "green", message: t("profile.cvDeleted") });
    } catch (error) {
      console.error("CV delete error:", error);
      notifications.show({
        color: "red",
        message: error instanceof Error && error.message ? error.message : t("profile.cvDeleteFailed"),
      });
    } finally {
      setIsDeletingCv(false);
    }
  };

  const handleShare = async (jobId: number) => {
    const url = `${window.location.origin}/job-info/${jobId}`;

    await navigator.clipboard.writeText(url);

    // setCopiedUrl(url);
    setShareOpened(true);
  };

  const companyCount = useMemo(() => new Set(jobs.map((job) => job.company_name).filter(Boolean)).size, [jobs]);
  const locationCount = useMemo(() => new Set(jobs.map((job) => job.location).filter(Boolean)).size, [jobs]);

  const filterPanel = <JobFilterPanel filters={filters} onChange={setFilters} filterOptions={filterOptions} />;

  return (
    <div className={styles.page}>
      <JobSearchHero
        jobCount={isLoading ? null : jobs.length}
        companyCount={isLoading ? null : companyCount}
        locationCount={isLoading ? null : locationCount}
        isAdmin={isAdmin}
        uploadedCvName={uploadedCvName}
        onUploadCv={() => setModalOpen(true)}
        onDeleteCv={() => setDeleteCvOpen(true)}
        onAddJob={() => setAddJobOpen(true)}
      />

      <div className={styles.body}>
        <div className={styles.toolbar}>
          <TextInput
            placeholder={t("jobSearch.searchPlaceholder")}
            aria-label={t("jobSearch.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            leftSection={<IconSearch size={16} color={INK} />}
            classNames={{ root: styles.searchRoot, input: styles.searchInput }}
          />

          <button
            type="button"
            className={`${styles.chip} ${styles.filterToggle}`}
            onClick={() => setFiltersOpen(true)}
          >
            <IconAdjustmentsHorizontal size={16} />
            {t("jobFilter.title")}
          </button>

          {!isAdmin && (
            <>
              <button
                type="button"
                className={styles.chip}
                aria-pressed={showSavedOnly}
                onClick={() => setShowSavedOnly((prev) => !prev)}
              >
                {t("jobSearch.savedJobsButton")}
              </button>
              <button
                type="button"
                className={styles.chip}
                aria-pressed={compareMode}
                onClick={handleToggleCompareMode}
              >
                {t("jobSearch.compareJobsButton")}
              </button>
            </>
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
                disabled: !jobs.some((j) => j.compatibility_score),
              },
              { value: "newest_first", label: t("jobSearch.newestFirst") },
              { value: "company_az", label: t("jobSearch.companyAZ") },
            ]}
            w={190}
            radius={0}
            allowDeselect={false}
            classNames={{ input: styles.sortInput, option: styles.sortOption }}
          />
        </div>

        <div className={styles.layout}>
          <aside className={styles.filters}>{filterPanel}</aside>

          <div style={{ minWidth: 0 }}>
            <div className={styles.resultsHeader}>
              <span>{t("jobSearch.resultsCount", { count: filteredJobs.length })}</span>
              {sortOption === "best_match" && <span>{t("jobSearch.matchLabel")} ↓</span>}
            </div>

            {showEmptyState ? (
              <div className={styles.empty}>
                <div className={styles.emptyTitle}>{emptyStateContent.title}</div>
                {emptyStateContent.description && <p className={styles.emptyText}>{emptyStateContent.description}</p>}
                {emptyStateContent.showClearFilters && (
                  <button type="button" className={styles.chip} onClick={clearFilters}>
                    {t("jobSearch.clearFilters")}
                  </button>
                )}
              </div>
            ) : (
              <ul className={styles.list}>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <JobListingSkeleton key={i} />)
                  : currentJobs.map((job, i) => (
                      <JobListing
                        key={job.id}
                        job={job}
                        index={(page - 1) * JOBS_PER_PAGE + i + 1}
                        saved={savedJobIds.includes(job.id)}
                        onSavedChange={handleSavedChange}
                        onShare={handleShare}
                        isSelected={selectedJobs.has(job.id)}
                        onToggleSelect={compareMode ? () => handleToggleSelect(job.id) : undefined}
                        selectDisabled={selectedJobs.size >= MAX_COMPARE}
                        showSelectControl={compareMode}
                        hideSaveAction={isAdmin}
                      />
                    ))}
              </ul>
            )}

            {pageCount > 1 && (
              <nav className={styles.pager} aria-label={t("jobSearch.pageStatus", { page, pageCount, jobsPerPage: JOBS_PER_PAGE })}>
                <button
                  type="button"
                  className={styles.pageButton}
                  aria-label={t("jobSearch.previousPage")}
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <IconArrowLeft size={16} />
                </button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={styles.pageButton}
                    aria-current={page === pageNumber ? "page" : undefined}
                    onClick={() => setPage(pageNumber)}
                  >
                    {String(pageNumber).padStart(2, "0")}
                  </button>
                ))}
                <button
                  type="button"
                  className={styles.pageButton}
                  aria-label={t("jobSearch.nextPage")}
                  disabled={page === pageCount}
                  onClick={() => setPage(page + 1)}
                >
                  <IconArrowRight size={16} />
                </button>
              </nav>
            )}

            <p className={styles.pageStatus}>
              {t("jobSearch.pageStatus", { page, pageCount, jobsPerPage: JOBS_PER_PAGE })}
            </p>
          </div>
        </div>
      </div>

      <Drawer
        opened={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        aria-label={t("jobFilter.title")}
        closeButtonProps={{ "aria-label": t("common.close") }}
        padding="md"
        size="sm"
        radius={0}
        styles={{ content: { background: "#f7f3ee" }, header: { background: "#f7f3ee", minHeight: 0, paddingBottom: 0 } }}
      >
        <div className={styles.page} style={{ minHeight: 0 }}>
          {filterPanel}
        </div>
      </Drawer>

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

      <DeleteCvModal
        opened={deleteCvOpen}
        filename={uploadedCvName}
        deleting={isDeletingCv}
        onCancel={() => setDeleteCvOpen(false)}
        onConfirm={handleDeleteCv}
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
            radius={0}
            color={INK}
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

      {selectedJobs.size >= 2 && (
        <div className={styles.compareBar}>
          <button type="button" className={`${styles.chip} ${styles.chipSolid}`} onClick={handleCompare}>
            {t("jobSearch.compareCount", { count: selectedJobs.size })}
          </button>
          <button type="button" className={styles.chip} onClick={() => setSelectedJobs(new Set())}>
            {t("jobSearch.clear")}
          </button>
        </div>
      )}
    </div>
  );
}
