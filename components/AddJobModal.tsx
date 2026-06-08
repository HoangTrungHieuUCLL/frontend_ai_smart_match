import { useState } from "react";
import { Button, Group, Modal, Stack, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import JobService from "../services/JobService";
import { JobCreatePayload } from "../types";

const BROWN = "#774326";

type JobFormState = {
    company_name: string;
    position: string;
    date_posted: string;
    location: string;
    job_type: string;
    overview: string;
    responsibilities: string;
    requirements: string;
    offers: string;
    salary_usd: string;
    notes: string;
    requirements_simplified: string;
};

type AddJobModalProps = {
    opened: boolean;
    onClose: () => void;
    adminToken: string;
    onJobCreated: () => Promise<void>;
};

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getEmptyJobForm = (): JobFormState => ({
    company_name: "",
    position: "",
    date_posted: getTodayDate(),
    location: "",
    job_type: "",
    overview: "",
    responsibilities: "",
    requirements: "",
    offers: "",
    salary_usd: "",
    notes: "",
    requirements_simplified: "",
});

const requiredJobFields: Array<keyof JobFormState> = [
    "company_name",
    "position",
    "date_posted",
    "location",
    "job_type",
    "overview",
    "responsibilities",
    "requirements",
    "offers",
    "requirements_simplified",
];

export default function AddJobModal({
                                        opened,
                                        onClose,
                                        adminToken,
                                        onJobCreated,
                                    }: AddJobModalProps) {
    const [jobForm, setJobForm] = useState<JobFormState>(getEmptyJobForm);
    const [isRegistering, setIsRegistering] = useState(false);

    const updateJobForm = (
        field: keyof JobFormState,
        value: string
    ) => {
        setJobForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleRegisterJob = async () => {
        const hasMissingRequiredField = requiredJobFields.some(
            (field) => !jobForm[field].trim()
        );

        if (hasMissingRequiredField) {
            notifications.show({
                color: "red",
                message: "Please complete all required job fields.",
                autoClose: 3000,
            });
            return;
        }

        const payload: JobCreatePayload = {
            company_name: jobForm.company_name.trim(),
            position: jobForm.position.trim(),
            date: jobForm.date_posted,
            location: jobForm.location.trim(),
            type: jobForm.job_type.trim(),
            overview: jobForm.overview.trim(),
            responsibilities: jobForm.responsibilities.trim(),
            requirements: jobForm.requirements.trim(),
            offers: jobForm.offers.trim(),
            salary: jobForm.salary_usd.trim() || null,
            notes: jobForm.notes.trim() || null,
            requirements_simplified:
                jobForm.requirements_simplified.trim(),
        };

        try {
            setIsRegistering(true);

            await JobService.createJob(payload, adminToken);
            await onJobCreated();

            setJobForm(getEmptyJobForm());

            notifications.show({
                message: "Job registered successfully.",
                autoClose: 3000,
            });

            onClose();
        } catch (error) {
            notifications.show({
                color: "red",
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to register job.",
                autoClose: 3000,
            });
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            size="lg"
            title="Add a new job"
        >
            <Stack gap="sm">
                <Group grow align="flex-start">
                    <TextInput
                        label="Company name"
                        value={jobForm.company_name}
                        onChange={(e) =>
                            updateJobForm(
                                "company_name",
                                e.currentTarget.value
                            )
                        }
                        required
                    />
                    <TextInput
                        label="Position"
                        value={jobForm.position}
                        onChange={(e) =>
                            updateJobForm(
                                "position",
                                e.currentTarget.value
                            )
                        }
                        required
                    />
                </Group>

                <Group grow align="flex-start">
                    <TextInput
                        label="Date posted"
                        value={jobForm.date_posted}
                        readOnly
                        required
                    />
                    <TextInput
                        label="Location"
                        value={jobForm.location}
                        onChange={(e) =>
                            updateJobForm(
                                "location",
                                e.currentTarget.value
                            )
                        }
                        required
                    />
                </Group>

                <Group grow align="flex-start">
                    <TextInput
                        label="Job type"
                        value={jobForm.job_type}
                        onChange={(e) =>
                            updateJobForm(
                                "job_type",
                                e.currentTarget.value
                            )
                        }
                        required
                    />
                    <TextInput
                        label="Salary USD"
                        value={jobForm.salary_usd}
                        onChange={(e) =>
                            updateJobForm(
                                "salary_usd",
                                e.currentTarget.value
                            )
                        }
                        placeholder="Optional"
                    />
                </Group>

                <Textarea
                    label="Overview"
                    value={jobForm.overview}
                    onChange={(e) =>
                        updateJobForm(
                            "overview",
                            e.currentTarget.value
                        )
                    }
                    minRows={3}
                    autosize
                    required
                />

                <Textarea
                    label="Responsibilities"
                    value={jobForm.responsibilities}
                    onChange={(e) =>
                        updateJobForm(
                            "responsibilities",
                            e.currentTarget.value
                        )
                    }
                    minRows={3}
                    autosize
                    required
                />

                <Textarea
                    label="Requirements"
                    value={jobForm.requirements}
                    onChange={(e) =>
                        updateJobForm(
                            "requirements",
                            e.currentTarget.value
                        )
                    }
                    minRows={3}
                    autosize
                    required
                />

                <Textarea
                    label="Offers"
                    value={jobForm.offers}
                    onChange={(e) =>
                        updateJobForm(
                            "offers",
                            e.currentTarget.value
                        )
                    }
                    minRows={3}
                    autosize
                    required
                />

                <Textarea
                    label="Notes"
                    value={jobForm.notes}
                    onChange={(e) =>
                        updateJobForm(
                            "notes",
                            e.currentTarget.value
                        )
                    }
                    minRows={2}
                    autosize
                    placeholder="Optional"
                />

                <Textarea
                    label="Requirements simplified"
                    value={jobForm.requirements_simplified}
                    onChange={(e) =>
                        updateJobForm(
                            "requirements_simplified",
                            e.currentTarget.value
                        )
                    }
                    minRows={3}
                    autosize
                    required
                />

                <Group justify="flex-end" mt="sm">
                    <Button
                        variant="light"
                        color={BROWN}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        style={{ backgroundColor: BROWN }}
                        loading={isRegistering}
                        onClick={handleRegisterJob}
                    >
                        Register
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}