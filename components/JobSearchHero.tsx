import { IconTrash } from "@tabler/icons-react";

import { useTranslation } from "../contexts/I18nContext";
import styles from "../styles/editorial.module.css";
import { ArrowUpRight, GradientBackdrop } from "./GrainGradient";

type Props = {
    jobCount: number;
    companyCount: number;
    locationCount: number;
    isAdmin: boolean;
    uploadedCvName: string | null;
    onUploadCv: () => void;
    onDeleteCv: () => void;
    onAddJob: () => void;
};

export default function JobSearchHero({
    jobCount,
    companyCount,
    locationCount,
    isAdmin,
    uploadedCvName,
    onUploadCv,
    onDeleteCv,
    onAddJob,
}: Props) {
    const { t } = useTranslation();

    return (
        <section className={styles.hero}>
            <GradientBackdrop />

            <div className={styles.heroInner}>
                <div className={styles.heroTop}>
                    <div className={styles.plusGrid} aria-hidden="true">
                        {Array.from({ length: 8 }, (_, i) => (
                            <span key={i}>+</span>
                        ))}
                    </div>
                </div>

                <h1 className={styles.headline}>
                    <span>{t("jobSearch.heroLine1")}</span>
                    <span className={styles.headlineSecond}>{t("jobSearch.heroLine2")}</span>
                </h1>

                <div className={styles.columns}>
                    <div className={styles.column}>
                        <div className={styles.columnLabel}>{t("jobSearch.statJobs")}</div>
                        <div className={styles.columnValue}>{jobCount}</div>
                    </div>
                    <div className={styles.column}>
                        <div className={styles.columnLabel}>{t("jobSearch.statCompanies")}</div>
                        <div className={styles.columnValue}>{companyCount}</div>
                    </div>
                    <div className={styles.column}>
                        <div className={styles.columnLabel}>{t("jobSearch.statLocations")}</div>
                        <div className={styles.columnValue}>{locationCount}</div>
                    </div>
                    <div className={styles.column}>
                        {isAdmin ? (
                            <button type="button" className={styles.cta} onClick={onAddJob}>
                                <ArrowUpRight className={styles.ctaArrow} />
                                <span className={styles.ctaLabel}>{t("jobSearch.addNewJob")}</span>
                            </button>
                        ) : uploadedCvName ? (
                            <div>
                                <div className={styles.columnLabel}>{t("jobSearch.yourCv")}</div>
                                <div className={styles.cvName} style={{ marginTop: 8 }}>{uploadedCvName}</div>
                                <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                                    <button type="button" className={`${styles.chip} ${styles.chipSmall}`} onClick={onUploadCv}>
                                        {t("jobSearch.replaceCv")}
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                        style={{ width: 30, height: 30 }}
                                        aria-label={t("profile.deleteCv")}
                                        title={t("profile.deleteCv")}
                                        onClick={onDeleteCv}
                                    >
                                        <IconTrash size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button type="button" className={styles.cta} onClick={onUploadCv}>
                                <ArrowUpRight className={styles.ctaArrow} />
                                <span className={styles.ctaLabel}>{t("upload.cvButton")}</span>
                                <span className={styles.ctaHint}>{t("jobSearch.ctaHint")}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
