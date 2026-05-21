import { useMemo, useState } from "react";
import { ActionIcon, Box, Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import JobService from "../services/JobService";
import { getCvFormErrors, isCvFormValid } from "../utils/cvValidation";
import { Job } from "../types";
import { useTranslation } from "../contexts/I18nContext";

const BROWN = "#774326";

type FileRejection = {
    errors: readonly { code: string }[];
};

type Props = {
    opened: boolean;
    onClose: (updatedJobs?: Job[]) => void;
};

export default function CVUploadModal({ opened, onClose }: Props) {
    const { t } = useTranslation();
    const [step, setStep] = useState<"form" | "upload">("form");
    const [formData, setFormData] = useState({
        familyName: "",
        middleName: "",
        givenName: "",
        email: "",
    });
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState("");

    const validationMessages = useMemo(
        () => ({
            familyNameLabel: t("upload.familyName"),
            givenNameLabel: t("upload.givenName"),
            middleNameLabel: t("upload.middleName"),
            required: (label: string) => t("validation.required", { label }),
            nameLetters: (label: string) => t("validation.nameLetters", { label }),
            emailRequired: t("validation.emailRequired"),
            emailInvalid: t("validation.emailInvalid"),
        }),
        [t]
    );
    const formErrors = getCvFormErrors(formData, validationMessages);
    const canContinue = isCvFormValid(formData, validationMessages);

    const reset = () => {
        setStep("form");
        setFormData({ familyName: "", middleName: "", givenName: "", email: "" });
        setUploadedFile(null);
        setFileError("");
    };

    const handleClose = () => {
        reset();
        onClose();
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
            const response = await JobService.uploadCv({ ...formData, cv: uploadedFile });

            if (response.ok) {
                alert(t("upload.success"));
                reset();
                onClose();
            } else {
                alert(t("upload.failed"));
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert(t("upload.error"));
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
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
                style: { backgroundColor: BROWN, color: "#fff", border: "none" },
            }}
        >
            {step === "form" ? (
                <Stack gap="md">
                    <TextInput
                        label={t("upload.familyName")}
                        placeholder={t("upload.familyNamePlaceholder")}
                        value={formData.familyName}
                        error={formErrors.familyName}
                        onChange={(e) => setFormData({ ...formData, familyName: e.currentTarget.value })}
                    />
                    <TextInput
                        label={t("upload.middleName")}
                        placeholder={t("upload.middleNamePlaceholder")}
                        value={formData.middleName}
                        error={formErrors.middleName}
                        onChange={(e) => setFormData({ ...formData, middleName: e.currentTarget.value })}
                    />
                    <TextInput
                        label={t("upload.givenName")}
                        placeholder={t("upload.givenNamePlaceholder")}
                        value={formData.givenName}
                        error={formErrors.givenName}
                        onChange={(e) => setFormData({ ...formData, givenName: e.currentTarget.value })}
                    />
                    <TextInput
                        label={t("upload.email")}
                        placeholder={t("upload.emailPlaceholder")}
                        type="email"
                        value={formData.email}
                        error={formErrors.email}
                        onChange={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
                    />
                    <Button
                        fullWidth
                        radius="md"
                        disabled={!canContinue}
                        style={{ backgroundColor: BROWN }}
                        onClick={handleFormSubmit}
                    >
                        {t("upload.continue")}
                    </Button>
                </Stack>
            ) : (
                <Stack gap="md">
                    <Dropzone
                        onDrop={handleFileDrop}
                        onReject={handleFileReject}
                        accept={["application/pdf"]}
                        maxSize={5 * 1024 * 1024}
                        multiple
                    >
                        <Group justify="center" style={{ minHeight: 220 }}>
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
                                {t("upload.fileSelected", { fileName: uploadedFile.name })}
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
                        style={{ backgroundColor: BROWN }}
                    >
                        {t("upload.submit")}
                    </Button>
                </Stack>
            )}
        </Modal>
    );
}
