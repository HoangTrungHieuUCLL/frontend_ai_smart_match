import {useMemo, useState} from "react";
import {Modal, Stack, Text, TextInput} from "@mantine/core";
import {Dropzone} from "@mantine/dropzone";
import {IconArrowUpRight, IconFileTypePdf, IconUpload, IconX} from "@tabler/icons-react";
import {useTranslation} from "../contexts/I18nContext";
import CvService, {CvConfirmReturn, ParsedCvResponse} from "../services/CvService";
import {CV, Certification, Education, Experience, Language, Project} from "../types";
import {getCvFormErrors, isCvFormValid} from "../utils/cvValidation";
import { saveStoredProfileCv } from "../utils/profileStorage";
import CVUploadConfirmation from "./CVUploadConfirmation";
import styles from "../styles/editorial.module.css";

export const modalClassNames = {
    content: styles.modalContent,
    header: styles.modalHeader,
    title: styles.modalTitle,
    close: styles.modalClose,
    body: styles.modalBody,
};

const formatSize = (bytes: number) =>
    bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function UploadSteps({current}: {current: 1 | 2 | 3}) {
    const {t} = useTranslation();
    const labels = [t("upload.stepDetails"), t("upload.stepPdf"), t("upload.stepReview")];

    return (
        <ol className={styles.steps} style={{listStyle: "none", padding: 0, marginTop: 0}}>
            {labels.map((label, index) => {
                const number = index + 1;
                return (
                    <li
                        key={label}
                        className={`${styles.stepItem} ${number < current ? styles.stepItemDone : ""}`}
                        aria-current={number === current ? "step" : undefined}
                    >
                        {String(number).padStart(2, "0")} {label}
                    </li>
                );
            })}
        </ol>
    );
}

type FileRejection = {
    errors: readonly { code: string }[];
};

export type CvFormData = {
    familyName: string;
    middleName: string;
    givenName: string;
    email: string;
};

type Props = {
    opened: boolean;
    onClose: (results: CvConfirmReturn[] | undefined, cvName?: string) => void;
};

export default function CVUploadModal({opened, onClose}: Props) {
    const {t} = useTranslation();
    const [step, setStep] = useState<"form" | "upload">("form");
    const [formData, setFormData] = useState<CvFormData>({
        familyName: "",
        middleName: "",
        givenName: "",
        email: "",
    });
    // Errors show once a field has been left, not while the form is still blank.
    const [touched, setTouched] = useState<Partial<Record<keyof CvFormData, boolean>>>({});
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState("");
    const [cv, setCv] = useState<CV | null>(null);
    const [profileId, setProfileId] = useState<number | null>(null);
    const [cvFileName, setCvFileName] = useState<string | null>(null);
    const [loadingState, setLoadingState] = useState<{
        open: boolean;
        status: "loading" | "error";
        message: string;
    }>({
        open: false,
        status: "loading",
        message: "",
    });

    const validationMessages = useMemo(
        () => ({
            familyNameLabel: t("upload.familyName"),
            givenNameLabel: t("upload.givenName"),
            middleNameLabel: t("upload.middleName"),
            required: (label: string) => t("validation.required", {label}),
            nameLetters: (label: string) => t("validation.nameLetters", {label}),
            emailRequired: t("validation.emailRequired"),
            emailInvalid: t("validation.emailInvalid"),
        }),
        [t],
    );
    const formErrors = getCvFormErrors(formData, validationMessages);
    const canContinue = isCvFormValid(formData, validationMessages);

    const reset = () => {
        setStep("form");
        setFormData({familyName: "", middleName: "", givenName: "", email: ""});
        setTouched({});
        setUploadedFile(null);
        setFileError("");
    };

    const handleFormSubmit = () => {
        if (canContinue) setStep("upload");
    };

    const handleFileDrop = (files: File[]) => {
        if (files.length > 1) {
            setFileError(t("upload.singlePdf"));
            return;
        }

        if (uploadedFile) {
            setFileError(t("upload.replacePdf"));
            return;
        }

        if (files.length === 1) {
            setUploadedFile(files[0]);
            setFileError("");
        }
    };

    const handleFileReject = (fileRejections: FileRejection[]) => {
        if (
            fileRejections.length > 1 ||
            fileRejections.some((r) => r.errors.some((e) => e.code === "too-many-files"))
        ) {
            setFileError(t("upload.singlePdf"));
            return;
        }

        const firstErrorCode = fileRejections[0]?.errors[0]?.code;

        if (firstErrorCode === "file-too-large") {
            setFileError(t("upload.maxSize"));
            return;
        }

        setFileError(t("upload.onlyPdf"));
    };

    const handleUploadSubmit = async () => {
        if (!uploadedFile) {
            setFileError(t("upload.selectFile"));
            return;
        }

        try {
            setLoadingState({
                open: true,
                status: "loading",
                message: t("upload.sendingCv"),
            });

            const response = await CvService.uploadCv({
                familyName: formData.familyName,
                middleName: formData.middleName,
                givenName: formData.givenName,
                email: formData.email,
                cv: uploadedFile,
            });

            const confirmationCv = toConfirmationCv(response, response.cv_file_name ?? uploadedFile.name, formData);
            setCv(confirmationCv);
            saveStoredProfileCv(confirmationCv, localStorage.getItem("email"));
            setProfileId(response.profile_id);
            setCvFileName(response.cv_file_name ?? uploadedFile.name);

            setLoadingState((prev) => ({
                ...prev,
                open: false,
            }));

            reset();
        } catch (error) {
            console.error("Upload error:", error);

            setLoadingState({
                open: true,
                status: "error",
                message: error instanceof Error ? error.message : t("upload.uploadFailed"),
            });
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={() => onClose([])}
            centered
            size="md"
            radius={0}
            classNames={modalClassNames}
            closeButtonProps={{"aria-label": t("common.close")}}
            title={step === "form" ? t("upload.modalCvTitle") : t("upload.modalPdfTitle")}
        >
            <UploadSteps current={step === "form" ? 1 : 2} />

            {step === "form" ? (
                <Stack gap="md">
                    <TextInput
                        label={t("upload.familyName")}
                        placeholder={t("upload.familyNamePlaceholder")}
                        value={formData.familyName}
                        error={touched.familyName && formErrors.familyName}
                        onBlur={() => setTouched((prev) => ({...prev, familyName: true}))}
                        onChange={(e) => setFormData({...formData, familyName: e.currentTarget.value})}
                    />
                    <TextInput
                        label={t("upload.middleName")}
                        placeholder={t("upload.middleNamePlaceholder")}
                        value={formData.middleName}
                        error={touched.middleName && formErrors.middleName}
                        onBlur={() => setTouched((prev) => ({...prev, middleName: true}))}
                        onChange={(e) => setFormData({...formData, middleName: e.currentTarget.value})}
                    />
                    <TextInput
                        label={t("upload.givenName")}
                        placeholder={t("upload.givenNamePlaceholder")}
                        value={formData.givenName}
                        error={touched.givenName && formErrors.givenName}
                        onBlur={() => setTouched((prev) => ({...prev, givenName: true}))}
                        onChange={(e) => setFormData({...formData, givenName: e.currentTarget.value})}
                    />
                    <TextInput
                        label={t("upload.email")}
                        placeholder={t("upload.emailPlaceholder")}
                        type="email"
                        value={formData.email}
                        error={touched.email && formErrors.email}
                        onBlur={() => setTouched((prev) => ({...prev, email: true}))}
                        onChange={(e) => setFormData({...formData, email: e.currentTarget.value})}
                    />
                    <button
                        type="button"
                        className={`${styles.chip} ${styles.chipSolid} ${styles.primaryButton}`}
                        disabled={!canContinue}
                        onClick={handleFormSubmit}
                    >
                        {t("upload.continue")}
                        <IconArrowUpRight size={16} />
                    </button>
                </Stack>
            ) : (
                <Stack gap="md">
                    <Dropzone
                        className={styles.dropzone}
                        onDrop={handleFileDrop}
                        onReject={handleFileReject}
                        accept={["application/pdf"]}
                        maxSize={5 * 1024 * 1024}
                        multiple
                    >
                        <div className={styles.dropzoneInner}>
                            <Dropzone.Reject>
                                <IconX size={44} stroke={1.5} />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconUpload size={44} stroke={1.5} />
                            </Dropzone.Idle>
                            <Dropzone.Accept>
                                <IconUpload size={44} stroke={1.5} />
                            </Dropzone.Accept>
                            <span className={styles.dropzoneTitle}>{t("upload.dropPdf")}</span>
                            <span className={styles.dropzoneHint}>{t("upload.browsePdf")}</span>
                        </div>
                    </Dropzone>

                    {fileError && (
                        <div className={styles.errorRow} role="alert">
                            <IconX size={16} />
                            <span>{fileError}</span>
                        </div>
                    )}

                    {uploadedFile && (
                        <div className={styles.fileRow}>
                            <IconFileTypePdf size={20} />
                            <span className={styles.fileName}>
                                {t("upload.fileSelected", {fileName: uploadedFile.name})}
                            </span>
                            <span className={styles.fileSize}>{formatSize(uploadedFile.size)}</span>
                            <button
                                type="button"
                                className={styles.iconButton}
                                style={{width: 28, height: 28}}
                                aria-label={t("upload.removeSelectedPdf")}
                                onClick={() => {
                                    setUploadedFile(null);
                                    setFileError("");
                                }}
                            >
                                <IconX size={16} />
                            </button>
                        </div>
                    )}

                    <div style={{display: "flex", gap: 10}}>
                        <button
                            type="button"
                            className={styles.chip}
                            style={{height: 48}}
                            onClick={() => setStep("form")}
                        >
                            {t("common.previous")}
                        </button>
                        <button
                            type="button"
                            className={`${styles.chip} ${styles.chipSolid} ${styles.primaryButton}`}
                            disabled={!uploadedFile}
                            onClick={handleUploadSubmit}
                        >
                            {t("upload.submit")}
                        </button>
                    </div>
                </Stack>
            )}

            <Modal
                opened={loadingState.open}
                onClose={() => {}}
                centered
                closeOnClickOutside={false}
                closeOnEscape={false}
                withCloseButton={false}
                size="sm"
                radius={0}
                classNames={modalClassNames}
            >
                <Stack align="center" gap="lg" py="md" aria-live="polite">
                    {loadingState.status === "loading" ? (
                        <div className={styles.progressTrack} role="progressbar" aria-label={loadingState.message}>
                            <div className={styles.progressBar} />
                        </div>
                    ) : (
                        <div className={styles.statusIcon}>
                            <IconX size={30} />
                        </div>
                    )}

                    <Text className={styles.statusMessage}>{loadingState.message}</Text>

                    {loadingState.status === "loading" ? (
                        <Text className={styles.dropzoneHint} ta="center">
                            {t("upload.processingHint")}
                        </Text>
                    ) : (
                        <button
                            type="button"
                            className={`${styles.chip} ${styles.chipSolid}`}
                            onClick={() =>
                                setLoadingState((prev) => ({
                                    ...prev,
                                    open: false,
                                }))
                            }
                        >
                            {t("common.ok")}
                        </button>
                    )}
                </Stack>
            </Modal>

            <Modal
                opened={cv != null}
                onClose={() => setCv(null)}
                title={t("cvSummary.title")}
                size="xl"
                radius={0}
                classNames={modalClassNames}
                closeButtonProps={{"aria-label": t("common.close")}}
            >
                <UploadSteps current={3} />
                <CVUploadConfirmation
                    cv={cv!}
                    onClose={(scores) => {
                        setCv(null);
                        onClose(scores, cvFileName ?? undefined);
                    }}
                    profileId={profileId}
                />
            </Modal>
        </Modal>
    );
}

export function toConfirmationCv(
    response: ParsedCvResponse,
    filename: string,
    formData: CvFormData,
): CV {
    const aiResult = response.ai_result ?? {};
    const candidateProfile = aiResult.candidate_profile ?? {};
    const profileId = response.profile_id;

    return {
        id: response.cv_id,
        filename,
        delete_token: response.delete_token,
        uploaded_at: new Date().toISOString(),
        candidate_profile: {
            id: profileId,
            cv_id: response.cv_id,
            given_name: candidateProfile.given_name ?? formData.givenName,
            middle_name: (candidateProfile.middle_name ?? formData.middleName) || null,
            family_name: candidateProfile.family_name ?? formData.familyName,
            current_title: candidateProfile.current_title ?? null,
            skills: skillsToString(candidateProfile.skills),
            phone: candidateProfile.phone ?? null,
            location: candidateProfile.location ?? null,
            email: candidateProfile.email ?? formData.email,
            bio: candidateProfile.bio ?? null,
            work_experiences: mapCollection<Experience>(
                aiResult.work_experience,
                profileId,
                (item, id) => ({
                    id,
                    profile_id: profileId,
                    job_title: getString(item, "job_title"),
                    company_name: getString(item, "company_name"),
                    start_date: getString(item, "start_date"),
                    end_date: getString(item, "end_date"),
                }),
            ),
            educations: mapCollection<Education>(
                aiResult.education,
                profileId,
                (item, id) => ({
                    id,
                    profile_id: profileId,
                    institution: getString(item, "institution"),
                    degree: getString(item, "degree"),
                    field_of_study: getString(item, "field_of_study"),
                    start_date: getString(item, "start_date"),
                    end_date: getString(item, "end_date"),
                }),
            ),
            projects: mapCollection<Project>(
                aiResult.projects,
                profileId,
                (item, id) => ({
                    id,
                    profile_id: profileId,
                    project_name: getString(item, "project_name"),
                    description: getString(item, "description"),
                }),
            ),
            languages: mapCollection<Language>(
                aiResult.languages,
                profileId,
                (item, id) => ({
                    id,
                    profile_id: profileId,
                    language_name: getString(item, "language_name"),
                    proficiency_level: getString(item, "proficiency_level"),
                }),
            ),
            certifications: mapCollection<Certification>(
                aiResult.certifications,
                profileId,
                (item, id) => ({
                    id,
                    profile_id: profileId,
                    certification_name: getString(item, "certification_name"),
                    issue_date: getString(item, "issue_date"),
                }),
            ),
            compatibility_scores: [],
        },
        compatibility_scores: [],
    };
}

function mapCollection<T>(
    value: unknown,
    profileId: number,
    mapper: (item: Record<string, unknown>, id: number) => T,
): T[] {
    if (!Array.isArray(value)) return [];

    return value
        .filter((item): item is Record<string, unknown> => item !== null && typeof item === "object")
        .map((item, index) => mapper(item, profileId * 1000 + index + 1));
}

function getString(item: Record<string, unknown>, key: string): string | null {
    const value = item[key];

    return typeof value === "string" && value.trim() ? value : null;
}

function skillsToString(value: string[] | string | null | undefined): string | null {
    if (Array.isArray(value)) {
        return value.filter(Boolean).join(", ") || null;
    }

    return value || null;
}
