import { useState } from "react";
import { Box, Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import JobService from "../services/JobService";
import { getCvFormErrors, isCvFormValid } from "../utils/cvValidation";
import { Job } from "../types";

const BROWN = "#774326";

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

    const formErrors = getCvFormErrors(formData);
    const canContinue = isCvFormValid(formData);

    const reset = () => {
        setStep("form");
        setFormData({
            familyName: "",
            middleName: "",
            givenName: "",
            email: "",
        });
        setUploadedFile(null);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleFormSubmit = () => {
        if (canContinue) setStep("upload");
    };

    const handleFileDrop = (files: File[]) => {
        if (!files.length) return;

        const file = files[0];

        if (file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
            setUploadedFile(file);
        } else if (file.type !== "application/pdf") {
            alert("Only PDF files are allowed");
        } else {
            alert("File size must not exceed 5MB");
        }
    };

    const handleUploadSubmit = async () => {
        if (!uploadedFile) {
            alert("Please select a file");
            return;
        }

        try {
            const response = await JobService.uploadCv({
                ...formData,
                cv: uploadedFile,
            });

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
                style: {
                    backgroundColor: BROWN,
                    color: "#fff",
                    border: "none",
                },
            }}
        >
            {step === "form" ? (
                <Stack gap="md">
                    <TextInput
                        label="Family name"
                        value={formData.familyName}
                        error={formErrors.familyName}
                        onChange={(e) =>
                            setFormData({ ...formData, familyName: e.currentTarget.value })
                        }
                    />

                    <TextInput
                        label="Middle name"
                        value={formData.middleName}
                        error={formErrors.middleName}
                        onChange={(e) =>
                            setFormData({ ...formData, middleName: e.currentTarget.value })
                        }
                    />

                    <TextInput
                        label="Given name"
                        value={formData.givenName}
                        error={formErrors.givenName}
                        onChange={(e) =>
                            setFormData({ ...formData, givenName: e.currentTarget.value })
                        }
                    />

                    <TextInput
                        label="Email address"
                        type="email"
                        value={formData.email}
                        error={formErrors.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.currentTarget.value })
                        }
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
                        accept={["application/pdf"]}
                        maxSize={5 * 1024 * 1024}
                        multiple={false}
                    >
                        <Group justify="center" style={{ minHeight: 220 }}>
                            <Stack align="center">
                                <Text size="md">Drop PDF or click to browse</Text>
                                <Text size="xs" c="dimmed">
                                    Max 5MB
                                </Text>
                            </Stack>
                        </Group>
                    </Dropzone>

                    {uploadedFile && (
                        <Text size="sm" c="green">
                            {uploadedFile.name}
                        </Text>
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