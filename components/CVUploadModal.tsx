import { useState } from "react";
import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import JobService from "../services/JobService";
import { getCvFormErrors, isCvFormValid } from "../utils/cvValidation";

const BROWN = "#774326";

type Props = {
    opened: boolean;
    onClose: () => void;
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

    const handleClose = () => {
        setStep("form");
        setFormData({
            familyName: "",
            middleName: "",
            givenName: "",
            email: "",
        });
        setUploadedFile(null);
        onClose();
    };

    const handleFormSubmit = () => {
        if (canContinue) {
            setStep("upload");
        }
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
                handleClose();
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
            title={
                <Text size="xl" fw={800}>
                    {step === "form" ? "Upload your CV" : "Upload your PDF"}
                </Text>
            }
            centered
            size="md"
        >
            {step === "form" ? (
                <Stack gap="md">
                    <TextInput
                        label="Family name"
                        placeholder="Enter your family name"
                        radius="md"
                        value={formData.familyName}
                        error={formData.familyName ? formErrors.familyName : undefined}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                familyName: e.currentTarget.value,
                            })
                        }
                    />

                    <TextInput
                        label="Middle name"
                        placeholder="Enter your middle name"
                        radius="md"
                        value={formData.middleName}
                        error={formErrors.middleName}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                middleName: e.currentTarget.value,
                            })
                        }
                    />

                    <TextInput
                        label="Given name"
                        placeholder="Enter your given name"
                        radius="md"
                        value={formData.givenName}
                        error={formData.givenName ? formErrors.givenName : undefined}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                givenName: e.currentTarget.value,
                            })
                        }
                    />

                    <TextInput
                        label="Email address"
                        placeholder="Enter your email"
                        type="email"
                        radius="md"
                        value={formData.email}
                        error={formData.email ? formErrors.email : undefined}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                email: e.currentTarget.value,
                            })
                        }
                    />

                    <Button
                        fullWidth
                        radius="md"
                        disabled={!canContinue}
                        style={{ backgroundColor: BROWN, borderColor: BROWN }}
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
                        <Group
                            justify="center"
                            gap="xl"
                            style={{ minHeight: 220, pointerEvents: "none" }}
                        >
                            <Stack gap={0} align="center">
                                <Text size="xl" fw={500}>
                                    Drop your PDF here
                                </Text>

                                <Text size="sm" c="dimmed">
                                    or click to browse (max 5MB)
                                </Text>
                            </Stack>
                        </Group>
                    </Dropzone>

                    {uploadedFile && (
                        <Text size="sm" c="green">
                            File selected: {uploadedFile.name}
                        </Text>
                    )}

                    <Button
                        fullWidth
                        radius="md"
                        style={{ backgroundColor: BROWN, borderColor: BROWN }}
                        onClick={handleUploadSubmit}
                    >
                        Upload CV
                    </Button>
                </Stack>
            )}
        </Modal>
    );
}