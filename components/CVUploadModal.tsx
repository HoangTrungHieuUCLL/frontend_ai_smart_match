import {useEffect, useMemo, useState} from "react";
import {
    ActionIcon,
    Box,
    Button,
    Divider,
    Group,
    Loader,
    Modal,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import {Dropzone} from "@mantine/dropzone";
import {useTranslation} from "../contexts/I18nContext";
import CvService, {CvConfirmReturn, ParsedCvResponse} from "../services/CvService";
import {CV, Certification, Education, Experience, Language, Project} from "../types";
import {getCvFormErrors, isCvFormValid} from "../utils/cvValidation";
import { saveStoredProfileCv } from "../utils/profileStorage";
import CVUploadConfirmation from "./CVUploadConfirmation";
import LinkedInImportButton from "./LinkedInImportButton";

const BROWN = "#774326";

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
    initialUploadError?: string;
};

export default function CVUploadModal({opened, onClose, initialUploadError}: Props) {
    const {t} = useTranslation();
    const [step, setStep] = useState<"form" | "upload">("form");
    const [formData, setFormData] = useState<CvFormData>({
        familyName: "",
        middleName: "",
        givenName: "",
        email: "",
    });
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

    useEffect(() => {
        if (!opened || !initialUploadError) return;

        setStep("upload");
        setFileError(initialUploadError);
    }, [initialUploadError, opened]);

    const reset = () => {
        setStep("form");
        setFormData({familyName: "", middleName: "", givenName: "", email: ""});
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

            setLoadingState((prev) => ({
                ...prev,
                message: t("upload.extractingData"),
            }));

            setLoadingState((prev) => ({
                ...prev,
                message: t("upload.calculatingScore"),
            }));

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

    const handleLinkedInImport = () => {
        const hasExistingCv = Boolean(localStorage.getItem("cvName"));

        if (
            hasExistingCv &&
            !window.confirm(t("upload.linkedinReplaceConfirm"))
        ) {
            return;
        }

        window.location.href = CvService.getLinkedInImportUrl();
    };

    return (
        <Modal
            opened={opened}
            onClose={() => onClose([])}
            centered
            size="md"
            title={
                <Text size="xl" fw={800}>
                    {step === "form" ? t("upload.modalCvTitle") : t("upload.modalPdfTitle")}
                </Text>
            }
            closeButtonProps={{
                size: 40,
                radius: "xl",
                style: {backgroundColor: BROWN, color: "#fff", border: "none"},
            }}
        >
            {step === "form" ? (
                <Stack gap="md">
                    <TextInput
                        label={t("upload.familyName")}
                        placeholder={t("upload.familyNamePlaceholder")}
                        value={formData.familyName}
                        error={formErrors.familyName}
                        onChange={(e) => setFormData({...formData, familyName: e.currentTarget.value})}
                    />
                    <TextInput
                        label={t("upload.middleName")}
                        placeholder={t("upload.middleNamePlaceholder")}
                        value={formData.middleName}
                        error={formErrors.middleName}
                        onChange={(e) => setFormData({...formData, middleName: e.currentTarget.value})}
                    />
                    <TextInput
                        label={t("upload.givenName")}
                        placeholder={t("upload.givenNamePlaceholder")}
                        value={formData.givenName}
                        error={formErrors.givenName}
                        onChange={(e) => setFormData({...formData, givenName: e.currentTarget.value})}
                    />
                    <TextInput
                        label={t("upload.email")}
                        placeholder={t("upload.emailPlaceholder")}
                        type="email"
                        value={formData.email}
                        error={formErrors.email}
                        onChange={(e) => setFormData({...formData, email: e.currentTarget.value})}
                    />
                    <Button
                        fullWidth
                        radius="md"
                        disabled={!canContinue}
                        style={{backgroundColor: BROWN}}
                        onClick={handleFormSubmit}
                    >
                        {t("upload.continue")}
                    </Button>
                    <Divider label="or" labelPosition="center" />
                    <LinkedInImportButton onClick={handleLinkedInImport} />
                </Stack>
            ) : (
                <Stack gap="md">
                    <LinkedInImportButton onClick={handleLinkedInImport} />
                    <Divider label="or upload a PDF" labelPosition="center" />
                    <Dropzone
                        onDrop={handleFileDrop}
                        onReject={handleFileReject}
                        accept={["application/pdf"]}
                        maxSize={5 * 1024 * 1024}
                        multiple
                    >
                        <Group justify="center" style={{minHeight: 220}}>
                            <Stack align="center">
                                <Text size="md">{t("upload.dropPdf")}</Text>
                                <Text size="xs" c="dimmed">{t("upload.browsePdf")}</Text>
                            </Stack>
                        </Group>
                    </Dropzone>

                    {fileError && (
                        <Group
                            gap="sm"
                            wrap="nowrap"
                            style={{
                                border: "1px solid rgba(119, 67, 38, 0.22)",
                                borderRadius: 8,
                                padding: "10px 12px",
                                backgroundColor: "#fff4ed",
                                color: BROWN,
                            }}
                        >
                            <Box
                                style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: "50%",
                                    backgroundColor: BROWN,
                                    color: "#ffffff",
                                    display: "grid",
                                    placeItems: "center",
                                    fontWeight: 800,
                                    flexShrink: 0,
                                }}
                            >
                                !
                            </Box>
                            <Text size="sm" fw={600}>{fileError}</Text>
                        </Group>
                    )}

                    {uploadedFile && (
                        <Group
                            justify="space-between"
                            gap="sm"
                            wrap="nowrap"
                            style={{
                                border: "1px solid rgba(119, 67, 38, 0.18)",
                                borderRadius: 8,
                                padding: "10px 12px",
                                backgroundColor: "#fdf7ef",
                            }}
                        >
                            <Text size="sm" c="green" lineClamp={1}>
                                {t("upload.fileSelected", {fileName: uploadedFile.name})}
                            </Text>
                            <ActionIcon
                                variant="subtle"
                                radius="xl"
                                color="brown"
                                aria-label={t("upload.removeSelectedPdf")}
                                onClick={() => {
                                    setUploadedFile(null);
                                    setFileError("");
                                }}
                            >
                                ×
                            </ActionIcon>
                        </Group>
                    )}

                    <Button
                        fullWidth
                        radius="md"
                        disabled={!uploadedFile}
                        onClick={handleUploadSubmit}
                        style={{backgroundColor: BROWN}}
                    >
                        {t("upload.submit")}
                    </Button>
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
            >
                <Stack align="center" gap="md" py="md">
                    {loadingState.status === "loading" ? (
                        <Loader color={BROWN} size="xl" type="oval" />
                    ) : (
                        <Text c="#E03131" fw={900} fz={56} lh={1}>
                            ×
                        </Text>
                    )}

                    <Text ta="center" fw={600}>
                        {loadingState.message}
                    </Text>

                    {loadingState.status === "error" && (
                        <Button
                            style={{backgroundColor: BROWN}}
                            onClick={() =>
                                setLoadingState((prev) => ({
                                    ...prev,
                                    open: false,
                                }))
                            }
                        >
                            OK
                        </Button>
                    )}
                </Stack>
            </Modal>

            <Modal
                opened={cv != null}
                onClose={() => setCv(null)}
                title={<Text fw={700} size="lg">CV Summary</Text>}
                size="xl"
            >
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
