import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button, Modal, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
    IconArrowDown,
    IconArrowLeft,
    IconArrowUpRight,
    IconBookmark,
    IconBookmarkFilled,
    IconLink,
} from "@tabler/icons-react";

import { Job } from "../../types";
import JobService from "../../services/JobService";
import CVUploadModal from "../../components/CVUploadModal";
import JobInfoSkeleton from "../../components/skeleton/JobInfoSkeleton";
import { TranslationKey, useTranslation } from "../../contexts/I18nContext";
import ProfileService from "../../services/ProfileService";
import { CvConfirmReturn } from "../../services/CvService";
import {
    addGuestSavedJob,
    getGuestSavedJobs,
    removeGuestSavedJob,
} from "../../utils/savedJobs";
import { isAdminToken } from "../../utils/auth";
import styles from "../../styles/editorial.module.css";

const SCORE_STORAGE_KEY = "jobScores";
const CV_NAME_STORAGE_KEY = "cvName";

// One item per line; single-line text written as "a; b; c" is split on semicolons instead.
const splitLines = (text?: string | null) => {
    const value = text?.trim() ?? "";
    const separator = value.includes("\n") ? /\r?\n/ : /;\s*/;
    return value.split(separator).map((line) => line.trim().replace(/^[-•*+]\s*/, "")).filter(Boolean);
};

const formatDate = (value: string | null | undefined, locale: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(date);
};

export default function JobInfoDetailPage() {
    const router = useRouter();
    const { t, language } = useTranslation();
    const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [compatibilityScore, setCompatibilityScore] = useState<number | null>(null);
    const [saved, setSaved] = useState(false);
    const [shareOpened, setShareOpened] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [cvUploaded, setCvUploaded] = useState(false);

    const descriptionRef = useRef<HTMLElement | null>(null);
    const isAdmin = isAdminToken(authToken);

    useEffect(() => {
        if (!id) return;

        // Coming from the job list: show the cached job at once, then refresh it.
        const cached = JobService.getCachedJob(Number(id));
        setJob(cached);
        setLoading(!cached);
        JobService.getJobById(Number(id))
            .then(setJob)
            .catch(() => {
                if (!cached) setJob(null);
            })
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        const syncAuth = () => setAuthToken(localStorage.getItem("access_token"));

        syncAuth();
        window.addEventListener("storage", syncAuth);
        window.addEventListener("auth-change", syncAuth);

        return () => {
            window.removeEventListener("storage", syncAuth);
            window.removeEventListener("auth-change", syncAuth);
        };
    }, []);

    useEffect(() => {
        if (!job) return;

        const savedScores: CvConfirmReturn[] = JSON.parse(sessionStorage.getItem(SCORE_STORAGE_KEY) ?? "[]");
        const match = savedScores.find((s) => s.job_id === job.id);
        setCompatibilityScore(match?.compatibility_score ?? null);
        setCvUploaded(Boolean(match) || Boolean(sessionStorage.getItem(CV_NAME_STORAGE_KEY)));

        const fetchSaved = async () => {
            const profileId = localStorage.getItem("profile_id");

            if (!profileId) {
                setSaved(getGuestSavedJobs().includes(job.id));
            } else {
                const savedJobs = await ProfileService.getSavedJobs(Number(profileId));
                setSaved(savedJobs.includes(job.id));
            }
        };

        fetchSaved();
    }, [job]);

    if (loading) {
        return <JobInfoSkeleton />;
    }

    if (!job) {
        return (
            <div className={styles.page}>
                <div className={styles.body}>
                    <div className={styles.empty}>
                        <div className={styles.emptyTitle}>{t("jobInfo.notFound")}</div>
                        <p className={styles.emptyText} />
                        <Link href="/job-search-with-ai" className={styles.back}>
                            <IconArrowLeft size={16} />
                            {t("jobInfo.backToJobs")}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const notify = (messageKey: TranslationKey) =>
        notifications.show({ title: job.position, message: t(messageKey), autoClose: 3000 });

    const handleSave = async () => {
        const profileId = localStorage.getItem("profile_id");

        if (!profileId) {
            if (saved) {
                removeGuestSavedJob(job.id);
                setSaved(false);
                notify("jobListing.removedToast");
            } else {
                addGuestSavedJob(job.id);
                setSaved(true);
                notify("jobListing.savedGuestToast");
            }
            return;
        }

        try {
            if (saved) {
                await ProfileService.removeJob(Number(profileId), job.id);
                setSaved(false);
                notify("jobListing.removedToast");
            } else {
                await ProfileService.saveJob(Number(profileId), job.id);
                setSaved(true);
                notify("jobListing.savedToast");
            }
        } catch (err) {
            console.error(err);
            notifications.show({ color: "red", message: t("jobSearch.saveJobFailed") });
        }
    };

    const handleShare = async () => {
        await navigator.clipboard.writeText(window.location.href);
        setShareOpened(true);
    };

    const scrollToDescription = () => descriptionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const sections: { title: string; paragraph?: string; items?: string[] }[] = [
        { title: t("jobInfo.sectionOverview"), paragraph: job.overview },
        { title: t("jobInfo.sectionResponsibilities"), items: splitLines(job.responsibilities) },
        { title: t("jobInfo.sectionRequirements"), items: splitLines(job.requirements) },
        { title: t("jobInfo.sectionBenefits"), items: splitLines(job.offers) },
        { title: t("jobInfo.sectionNotes"), items: splitLines(job.notes) },
    ].filter((section) => section.paragraph?.trim() || section.items?.length);

    const postedOn = formatDate(job.date, language === "VN" ? "vi" : "en");
    const meta = [job.company_name, postedOn && t("jobInfo.postedOn", { date: postedOn })].filter(Boolean).join(" · ");

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroInner}>
                    <Link href="/job-search-with-ai" className={styles.back}>
                        <IconArrowLeft size={16} />
                        {t("jobInfo.backToJobs")}
                    </Link>

                    <div className={styles.jobMeta}>{meta}</div>
                    <h1 className={styles.jobTitle}>{job.position}</h1>

                    <div className={styles.columns}>
                        <div className={styles.column}>
                            <div className={styles.columnLabel}>{t("jobFilter.location")}</div>
                            <div className={styles.columnText}>{job.location || t("common.notSpecified")}</div>
                        </div>
                        <div className={styles.column}>
                            <div className={styles.columnLabel}>{t("jobFilter.salary")}</div>
                            <div className={styles.columnText}>{job.salary || t("common.notSpecified")}</div>
                        </div>
                        <div className={styles.column}>
                            <div className={styles.columnLabel}>{t("jobInfo.factCategory")}</div>
                            <div className={styles.columnText}>{job.type || t("common.notSpecified")}</div>
                        </div>
                        <div className={styles.column}>
                            {compatibilityScore !== null ? (
                                <div className={styles.score}>
                                    <div className={styles.columnLabel}>{t("jobInfo.stepScore")}</div>
                                    <div className={styles.columnValue}>{Math.round(compatibilityScore)}%</div>
                                    <div className={styles.scoreBar} style={{ maxWidth: 200 }}>
                                        <div className={styles.scoreFill} style={{ width: `${Math.min(100, Math.max(0, compatibilityScore))}%` }} />
                                    </div>
                                </div>
                            ) : (
                                !isAdmin && (
                                    <button type="button" className={styles.cta} onClick={() => setModalOpen(true)}>
                                        <IconArrowUpRight className={styles.ctaArrow} stroke={2.25} />
                                        <span className={styles.ctaLabel}>{t("upload.cvButton")}</span>
                                        <span className={styles.ctaHint}>{t("jobInfo.stepScoreText")}</span>
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className={styles.body}>
                <div className={styles.actionBar}>
                    {!isAdmin && (
                        <button type="button" className={styles.chip} aria-pressed={saved} onClick={handleSave}>
                            {saved ? <IconBookmarkFilled size={16} /> : <IconBookmark size={16} />}
                            {saved ? t("jobInfo.savedLabel") : t("jobInfo.save")}
                        </button>
                    )}
                    <button type="button" className={styles.chip} onClick={handleShare}>
                        <IconLink size={16} />
                        {t("jobInfo.share")}
                    </button>
                </div>

                <div className={styles.detailLayout}>
                    <article ref={descriptionRef}>
                        {sections.map((section, index) => (
                            <section key={section.title} className={styles.section}>
                                <h2 className={styles.sectionHeading}>
                                    <span className={styles.sectionNumber}>{String(index + 1).padStart(2, "0")}</span>
                                    {section.title}
                                </h2>
                                {section.paragraph ? (
                                    <p className={styles.prose}>{section.paragraph}</p>
                                ) : (
                                    <ul className={styles.bulletList}>
                                        {section.items?.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                )}
                            </section>
                        ))}
                    </article>

                    {!isAdmin && (
                        <aside className={styles.aside}>
                            <div className={styles.asideTitle}>{t("jobInfo.aiTitle")}</div>

                            <div className={styles.step}>
                                <span className={styles.stepNumber}>01</span>
                                <span className={styles.stepTitle}>{t("jobInfo.stepRead")}</span>
                                <p className={styles.stepText}>{t("jobInfo.stepReadText")}</p>
                                <button type="button" className={`${styles.chip} ${styles.chipSmall} ${styles.stepAction}`} onClick={scrollToDescription}>
                                    {t("jobInfo.stepReadButton")}
                                    <IconArrowDown size={14} />
                                </button>
                            </div>

                            <div className={styles.step}>
                                <span className={styles.stepNumber}>02</span>
                                <span className={styles.stepTitle}>{t("upload.cvButton")}</span>
                                <p className={styles.stepText}>{cvUploaded ? t("jobInfo.stepCvDoneText") : t("jobInfo.stepCvText")}</p>
                                <button
                                    type="button"
                                    className={`${styles.chip} ${styles.chipSmall} ${styles.stepAction} ${cvUploaded ? "" : styles.chipSolid}`}
                                    onClick={() => setModalOpen(true)}
                                >
                                    {cvUploaded ? t("jobInfo.reuploadCv") : t("upload.cvButton")}
                                </button>
                            </div>

                            <div className={styles.step}>
                                <span className={styles.stepNumber}>03</span>
                                <span className={styles.stepTitle}>{t("jobInfo.stepScore")}</span>
                                {compatibilityScore !== null ? (
                                    <div className={`${styles.score} ${styles.stepScore}`}>
                                        <div className={styles.scoreValue}>{Math.round(compatibilityScore)}%</div>
                                        <div className={styles.scoreBar}>
                                            <div className={styles.scoreFill} style={{ width: `${Math.min(100, Math.max(0, compatibilityScore))}%` }} />
                                        </div>
                                    </div>
                                ) : (
                                    <p className={styles.stepText}>{t("jobInfo.stepScoreText")}</p>
                                )}
                            </div>
                        </aside>
                    )}
                </div>
            </div>

            <CVUploadModal
                opened={modalOpen}
                onClose={(results, cvName) => {
                    setModalOpen(false);

                    if (!results || results.length === 0) return;

                    const existing: CvConfirmReturn[] = JSON.parse(sessionStorage.getItem(SCORE_STORAGE_KEY) ?? "[]");
                    const merged = new Map(existing.map((r) => [r.job_id, r.compatibility_score]));
                    results.forEach((r) => merged.set(r.job_id, r.compatibility_score));
                    sessionStorage.setItem(
                        SCORE_STORAGE_KEY,
                        JSON.stringify(Array.from(merged.entries()).map(([job_id, compatibility_score]) => ({ job_id, compatibility_score }))),
                    );
                    // Lets the job search page show this CV too.
                    if (cvName) sessionStorage.setItem(CV_NAME_STORAGE_KEY, cvName);

                    setCvUploaded(true);
                    setCompatibilityScore(results.find((r) => r.job_id === job.id)?.compatibility_score ?? null);
                }}
            />

            <Modal opened={shareOpened} onClose={() => setShareOpened(false)} centered radius={0} title={t("jobSearch.shareJobTitle")}>
                <Stack>
                    <Text>{t("jobSearch.linkCopied")}</Text>
                    <Button radius={0} color="dark" onClick={() => setShareOpened(false)}>
                        {t("common.ok")}
                    </Button>
                </Stack>
            </Modal>
        </div>
    );
}
