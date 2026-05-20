import { useState } from "react";
import { ActionIcon, Box, Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import JobService from "../services/JobService";
import { getCvFormErrors, isCvFormValid } from "../utils/cvValidation";
import { Job } from "../types";

const BROWN = "#774326";
const SINGLE_PDF_MESSAGE = "Please upload only one PDF file.";
const REPLACE_PDF_MESSAGE = "Remove the selected PDF before choosing another one.";

type FileRejection = {
    errors: readonly { code: string }[];
};

type Props = {
    opened: boolean;
    onClose: (updatedJobs?: Job[]) => void;
};

export default function CVUploadModal({ opened, onClose }: Props) {
    const [step, setStep] = useState<"form" | "upload">("form");
    const [formData, setFormData] = useState({
        familyName: "",
        middleName: "",
        givenName: "",
        email: "",
    });
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState("");

    const formErrors = getCvFormErrors(formData);
    const canContinue = isCvFormValid(formData);

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
            setFileError(SINGLE_PDF_MESSAGE);
            return;
        }

        if (uploadedFile) {
            setFileError(REPLACE_PDF_MESSAGE);
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
            setFileError(SINGLE_PDF_MESSAGE);
            return;
        }

        const firstErrorCode = fileRejections[0]?.errors[0]?.code;

        if (firstErrorCode === "file-too-large") {
            setFileError("File size must not exceed 5MB");
            return;
        }

        setFileError("Only PDF files are allowed");
    };

    const handleUploadSubmit = async () => {
        if (!uploadedFile) {
            alert("Please select a file");
            return;
        }

        try {
            const response = await JobService.uploadCv({ ...formData, cv: uploadedFile });

            if (response.ok) {
                alert("CV uploaded successfully!");
                reset();
            } else {
                alert("Failed to upload CV");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading CV");
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
                    {step === "form" ? "Upload your CV" : "Upload your PDF"}
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
                        label="Family name"
                        value={formData.familyName}
                        error={formErrors.familyName}
                        onChange={(e) => setFormData({ ...formData, familyName: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Middle name"
                        value={formData.middleName}
                        error={formErrors.middleName}
                        onChange={(e) => setFormData({ ...formData, middleName: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Given name"
                        value={formData.givenName}
                        error={formErrors.givenName}
                        onChange={(e) => setFormData({ ...formData, givenName: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Email address"
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
                        Continue
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
                                <Text size="md">Drop PDF or click to browse</Text>
                                <Text size="xs" c="dimmed">Max 5MB</Text>
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
                                File selected: {uploadedFile.name}
                            </Text>
                            <ActionIcon
                                variant="subtle"
                                radius="xl"
                                color="brown"
                                aria-label="Remove selected PDF"
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
                        Upload
                    </Button>
                </Stack>
            )}
        </Modal>
    );
}