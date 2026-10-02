import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Checkbox } from "@mantine/core";
import { IconArrowUpRight, IconBookmark, IconBookmarkFilled, IconLink } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

import { Job } from "../types";
import { useTranslation } from "../contexts/I18nContext";
import ProfileService from "../services/ProfileService";
import {
    addGuestSavedJob,
    getGuestSavedJobs,
    removeGuestSavedJob,
} from "../utils/savedJobs";
import styles from "../styles/editorial.module.css";

interface Props {
    job: Job;
    index?: number;
    onShare?: (jobId: number) => void;
    isSelected?: boolean;
    onToggleSelect?: () => void;
    selectDisabled?: boolean;
    showSelectControl?: boolean;
    hideSaveAction?: boolean;
}

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 28;

// Requirements are free text. Only list-like text (mostly short items) becomes
// skill tags; prose stays a two-line summary instead of being chopped up.
export const extractTags = (requirements?: string | null): string[] => {
    const parts = (requirements ?? "")
        .split(/[;,\n•]+/)
        .map((part) => part.trim().replace(/\.$/, ""))
        .filter((part) => part.length > 1);
    const tags = parts.filter(
        (part) =>
            part.length <= MAX_TAG_LENGTH &&
            /^[\p{Lu}\d]/u.test(part) &&
            part.split("(").length === part.split(")").length,
    );

    if (parts.length === 0 || tags.length / parts.length < 0.6) return [];
    return Array.from(new Set(tags)).slice(0, MAX_TAGS);
};

const JobListing: React.FC<Props> = ({
    job,
    index,
    onShare,
    isSelected = false,
    onToggleSelect,
    selectDisabled = false,
    showSelectControl = false,
    hideSaveAction = false,
}) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchSaved = async () => {
            const profileId = localStorage.getItem("profile_id");

            if (!profileId) {
                setSaved(getGuestSavedJobs().map(Number).includes(job.id));
                return;
            }

            const savedJobs = await ProfileService.getSavedJobs(Number(profileId));
            setSaved(savedJobs.includes(job.id));
        };

        fetchSaved();

        window.addEventListener("storage", fetchSaved);
        window.addEventListener("auth-change", fetchSaved);

        return () => {
            window.removeEventListener("storage", fetchSaved);
            window.removeEventListener("auth-change", fetchSaved);
        };
    }, [job.id]);

    const handleLearnMore = async () => {
        try {
            await router.push({ pathname: `/job-info/[id]`, query: { id: job.id } });
        } catch (e) {
            console.error("Navigation failed, falling back to full redirect:", e);
            window.location.href = `/job-info/${job.id}`;
        }
    };

    const notify = (messageKey: Parameters<typeof t>[0]) =>
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

    // Buttons inside the row must not also trigger the row's navigation.
    const stop = (action: () => void) => (event: React.MouseEvent) => {
        event.stopPropagation();
        action();
    };

    const tags = extractTags(job.requirements);
    const score = job.compatibility_score;
    const canSelect = Boolean(onToggleSelect) && (showSelectControl || isSelected);

    return (
        <li
            className={`${styles.row} ${isSelected ? styles.rowSelected : ""}`}
            onClick={canSelect ? () => (!selectDisabled || isSelected) && onToggleSelect?.() : handleLearnMore}
        >
            <div className={styles.index} onClick={(event) => canSelect && event.stopPropagation()}>
                {canSelect ? (
                    <Checkbox
                        color="dark"
                        radius={0}
                        checked={isSelected}
                        disabled={selectDisabled && !isSelected}
                        aria-label={job.position}
                        onChange={() => onToggleSelect?.()}
                    />
                ) : index != null ? (
                    String(index).padStart(2, "0")
                ) : null}
            </div>

            <div style={{ minWidth: 0 }}>
                <h3 className={styles.title}>{job.position}</h3>
                <div className={styles.meta}>
                    <span>{job.company_name}</span>
                    {job.location && <span> · {job.location}</span>}
                </div>
                {tags.length > 0 ? (
                    <div className={styles.tags}>
                        {tags.map((tag) => (
                            <span key={tag} className={styles.tag}>
                                {tag}
                            </span>
                        ))}
                    </div>
                ) : (
                    job.requirements && (
                        <div className={styles.summary} style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {job.requirements}
                        </div>
                    )
                )}
            </div>

            <div className={styles.category}>{job.type}</div>

            <div className={styles.score}>
                {score != null ? (
                    <>
                        <div className={styles.scoreValue}>{Math.round(score)}%</div>
                        <div className={styles.scoreBar}>
                            <div className={styles.scoreFill} style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
                        </div>
                        <div className={styles.scoreLabel}>{t("jobSearch.matchLabel")}</div>
                    </>
                ) : (
                    <div className={styles.scoreEmpty} title={t("jobSearch.noScoreHint")}>
                        —
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                {!hideSaveAction && (
                    <button
                        type="button"
                        className={styles.iconButton}
                        aria-label={saved ? t("jobListing.saved") : t("jobListing.save")}
                        aria-pressed={saved}
                        title={saved ? t("jobListing.saved") : t("jobListing.save")}
                        onClick={stop(handleSave)}
                    >
                        {saved ? <IconBookmarkFilled size={18} /> : <IconBookmark size={18} />}
                    </button>
                )}
                <button
                    type="button"
                    className={styles.iconButton}
                    aria-label={t("jobListing.share")}
                    title={t("jobListing.share")}
                    onClick={stop(() => onShare?.(job.id))}
                >
                    <IconLink size={18} />
                </button>
                <button type="button" className={styles.learnMore} onClick={stop(handleLearnMore)}>
                    {t("jobListing.learnMore")}
                    <IconArrowUpRight size={16} />
                </button>
            </div>
        </li>
    );
};

export default JobListing;
