import { FormEvent, useEffect, useState } from "react";
import { Button, Group, Modal, Stack, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import JobService from "../services/JobService";
import { Job, JobCreatePayload } from "../types";
import { useTranslation } from "../contexts/I18nContext";

const BROWN = "#774326";

type JobFormState = {
    company_name: string;
    position: string;
    date: string;
    location: string;
    type: string;
    overview: string;
    responsibilities: string;
    requirements: string;
    offers: string;
    salary: string;
    notes: string;
};

type JobFormErrors = Partial<Record<"company_name" | "position", string>>;

type AddJobModalProps = {
    opened: boolean;
    onClose: () => void;
    adminToken: string;
    onJobSaved: () => Promise<void>;
    job?: Job | null;
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
    date: getTodayDate(),
    location: "",
    type: "",
    overview: "",
    responsibilities: "",
    requirements: "",
    offers: "",
    salary: "",
    notes: "",
});

const getJobForm = (job?: Job | null): JobFormState => {
    if (!job) {
        return getEmptyJobForm();
    }

    return {
        company_name: job.company_name ?? "",
        position: job.position ?? "",
        date: job.date || getTodayDate(),
        location: job.location ?? "",
        type: job.type ?? "",
        overview: job.overview ?? "",
        responsibilities: job.responsibilities ?? "",
        requirements: job.requirements ?? "",
        offers: job.offers ?? "",
        salary: job.salary ?? "",
        notes: job.notes ?? "",
    };
};

export default function AddJobModal({
    opened,
    onClose,
    adminToken,
    onJobSaved,
    job,
}: AddJobModalProps) {
    const { t } = useTranslation();
    const [jobForm, setJobForm] = useState<JobFormState>(() => getJobForm(job));
    const [errors, setErrors] = useState<JobFormErrors>({});
    const [isSaving, setIsSaving] = useState(false);
    const isEditing = Boolean(job);

    useEffect(() => {
        if (opened) {
            setJobForm(getJobForm(job));
            setErrors({});
        }
    }, [opened, job]);

    const updateJobForm = (field: keyof JobFormState, value: string) => {
        setJobForm((current) => ({
            ...current,
            [field]: value,
        }));

        if (field === "company_name" || field === "position") {
            setErrors((current) => ({
                ...current,
                [field]: undefined,
            }));
        }
    };

    const validate = () => {
        const nextErrors: JobFormErrors = {};

        if (!jobForm.company_name.trim()) {
            nextErrors.company_name = t("addJob.companyNameRequired");
        }

        if (!jobForm.position.trim()) {
            nextErrors.position = t("addJob.positionRequired");
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const buildPayload = (): JobCreatePayload => ({
        company_name: jobForm.company_name.trim(),
        position: jobForm.position.trim(),
        date: jobForm.date || getTodayDate(),
        location: jobForm.location.trim() || null,
        type: jobForm.type.trim() || null,
        overview: jobForm.overview.trim() || null,
        responsibilities: jobForm.responsibilities.trim() || null,
        requirements: jobForm.requirements.trim() || null,
        offers: jobForm.offers.trim() || null,
        salary: jobForm.salary.trim() || null,
        notes: jobForm.notes.trim() || null,
        requirements_simplified: jobForm.requirements.trim() || null,
    });

    const handleSaveJob = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setIsSaving(true);

            if (job) {
                await JobService.updateJob(job.id, buildPayload(), adminToken);
            } else {
                await JobService.createJob(buildPayload(), adminToken);
            }

            await onJobSaved();

            notifications.show({
                message: isEditing ? t("addJob.jobUpdatedSuccess") : t("addJob.jobCreatedSuccess"),
                autoClose: 3000,
            });

            onClose();
        } catch (error) {
            notifications.show({
                color: "red",
                message:
                    error instanceof Error
                        ? error.message
                        : isEditing
                            ? t("addJob.jobUpdateFailed")
                            : t("addJob.jobCreateFailed"),
                autoClose: 3000,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            size="lg"
            title={isEditing ? t("addJob.editTitle") : t("addJob.addTitle")}
        >
            <form onSubmit={handleSaveJob}>
                <Stack gap="sm">
                    <Group grow align="flex-start">
                        <TextInput
                            label={t("addJob.position")}
                            value={jobForm.position}
                            onChange={(e) => updateJobForm("position", e.currentTarget.value)}
                            error={errors.position}
                            required
                        />
                        <TextInput
                            label={t("addJob.companyName")}
                            value={jobForm.company_name}
                            onChange={(e) => updateJobForm("company_name", e.currentTarget.value)}
                            error={errors.company_name}
                            required
                        />
                    </Group>

                    <Group grow align="flex-start">
                        <TextInput
                            label={t("addJob.location")}
                            value={jobForm.location}
                            onChange={(e) => updateJobForm("location", e.currentTarget.value)}
                            placeholder={t("addJob.optional")}
                        />
                        <TextInput
                            label={t("addJob.jobType")}
                            value={jobForm.type}
                            onChange={(e) => updateJobForm("type", e.currentTarget.value)}
                            placeholder={t("addJob.optional")}
                        />
                    </Group>

                    <TextInput
                        label={t("addJob.salary")}
                        value={jobForm.salary}
                        onChange={(e) => updateJobForm("salary", e.currentTarget.value)}
                        placeholder={t("addJob.optional")}
                    />

                    <Textarea
                        label={t("addJob.overview")}
                        value={jobForm.overview}
                        onChange={(e) => updateJobForm("overview", e.currentTarget.value)}
                        minRows={3}
                        autosize
                        placeholder={t("addJob.optional")}
                    />

                    <Textarea
                        label={t("addJob.responsibilities")}
                        value={jobForm.responsibilities}
                        onChange={(e) => updateJobForm("responsibilities", e.currentTarget.value)}
                        minRows={3}
                        autosize
                        placeholder={t("addJob.optional")}
                    />

                    <Textarea
                        label={t("addJob.requirements")}
                        value={jobForm.requirements}
                        onChange={(e) => updateJobForm("requirements", e.currentTarget.value)}
                        minRows={3}
                        autosize
                        placeholder={t("addJob.optional")}
                    />

                    <Textarea
                        label={t("addJob.benefits")}
                        value={jobForm.offers}
                        onChange={(e) => updateJobForm("offers", e.currentTarget.value)}
                        minRows={3}
                        autosize
                        placeholder={t("addJob.optional")}
                    />

                    <Textarea
                        label={t("addJob.notes")}
                        value={jobForm.notes}
                        onChange={(e) => updateJobForm("notes", e.currentTarget.value)}
                        minRows={2}
                        autosize
                        placeholder={t("addJob.optional")}
                    />

                    <Group justify="flex-end" mt="sm">
                        <Button
                            type="button"
                            variant="light"
                            color={BROWN}
                            onClick={onClose}
                        >
                            {t("common.cancel")}
                        </Button>

                        <Button
                            type="submit"
                            style={{ backgroundColor: BROWN }}
                            loading={isSaving}
                        >
                            {isEditing ? t("addJob.saveChanges") : t("addJob.createJob")}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
