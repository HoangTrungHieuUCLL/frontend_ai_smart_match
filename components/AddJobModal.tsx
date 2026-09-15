import { FormEvent, useEffect, useState } from "react";
import { Button, Checkbox, Divider, Group, Modal, NumberInput, Select, Stack, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import JobService from "../services/JobService";
import { Job, JobCreatePayload, JobTaxonomyFields } from "../types";
import { useTranslation } from "../contexts/I18nContext";
import {
    CATEGORY_L1,
    COMPANY_INDUSTRY,
    EMPLOYMENT_TYPE,
    EXPERIENCE_LEVEL,
    SALARY_UNIT,
    SATURDAY_WORK,
    SENIORITY,
    WORK_ARRANGEMENT,
    WORK_SCHEDULE,
    TaxonomyEntry,
} from "../constants/jobTaxonomy";

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
} & { [K in keyof JobTaxonomyFields]: JobTaxonomyFields[K] };

const emptyTaxonomy: Required<Omit<JobTaxonomyFields, "salary_min" | "salary_max">> & Pick<JobTaxonomyFields, "salary_min" | "salary_max"> = {
    category_l1: null,
    category_l2: "",
    category_l3: "",
    experience_level: null,
    seniority: null,
    employment_type: null,
    work_arrangement: null,
    saturday_work: null,
    work_schedule: null,
    salary_min: null,
    salary_max: null,
    salary_unit: null,
    salary_negotiable: false,
    company_industry: null,
    is_featured_employer: false,
};

const selectData = (entries: TaxonomyEntry[], lang: "VN" | "EN") =>
    entries.map((entry) => ({ value: entry.value, label: lang === "VN" ? entry.label_vn : entry.label_en }));

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
    ...emptyTaxonomy,
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
        category_l1: job.category_l1 ?? null,
        category_l2: job.category_l2 ?? "",
        category_l3: job.category_l3 ?? "",
        experience_level: job.experience_level ?? null,
        seniority: job.seniority ?? null,
        employment_type: job.employment_type ?? null,
        work_arrangement: job.work_arrangement ?? null,
        saturday_work: job.saturday_work ?? null,
        work_schedule: job.work_schedule ?? null,
        salary_min: job.salary_min ?? null,
        salary_max: job.salary_max ?? null,
        salary_unit: job.salary_unit ?? null,
        salary_negotiable: job.salary_negotiable ?? false,
        company_industry: job.company_industry ?? null,
        is_featured_employer: job.is_featured_employer ?? false,
    };
};

export default function AddJobModal({
    opened,
    onClose,
    adminToken,
    onJobSaved,
    job,
}: AddJobModalProps) {
    const { t, language } = useTranslation();
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

    type StringFormField =
        | "company_name"
        | "position"
        | "date"
        | "location"
        | "type"
        | "overview"
        | "responsibilities"
        | "requirements"
        | "offers"
        | "salary"
        | "notes"
        | "category_l2"
        | "category_l3";

    const updateJobForm = (field: StringFormField, value: string) => {
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

    const updateField = <K extends keyof JobFormState>(field: K, value: JobFormState[K]) => {
        setJobForm((current) => ({
            ...current,
            [field]: value,
        }));
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
        category_l1: jobForm.category_l1 || null,
        category_l2: jobForm.category_l2?.trim() || null,
        category_l3: jobForm.category_l3?.trim() || null,
        experience_level: jobForm.experience_level || null,
        seniority: jobForm.seniority || null,
        employment_type: jobForm.employment_type || null,
        work_arrangement: jobForm.work_arrangement || null,
        saturday_work: jobForm.saturday_work || null,
        work_schedule: jobForm.work_schedule || null,
        salary_min: jobForm.salary_min ?? null,
        salary_max: jobForm.salary_max ?? null,
        salary_unit: jobForm.salary_unit || null,
        salary_negotiable: jobForm.salary_negotiable ?? false,
        company_industry: jobForm.company_industry || null,
        is_featured_employer: jobForm.is_featured_employer ?? false,
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

                    <Divider label={t("addJob.taxonomySectionTitle")} labelPosition="left" mt="sm" />

                    <Group grow align="flex-start">
                        <Select
                            label={t("jobFilter.category")}
                            placeholder={t("jobFilter.categoryL1Placeholder")}
                            data={selectData(CATEGORY_L1, language)}
                            value={jobForm.category_l1}
                            onChange={(value) => updateField("category_l1", value)}
                            clearable
                            searchable
                        />
                        <Select
                            label={t("jobFilter.companyIndustry")}
                            data={selectData(COMPANY_INDUSTRY, language)}
                            value={jobForm.company_industry}
                            onChange={(value) => updateField("company_industry", value)}
                            clearable
                            searchable
                        />
                    </Group>

                    <Group grow align="flex-start">
                        <TextInput
                            label={t("jobFilter.categoryL2Label")}
                            value={jobForm.category_l2 ?? ""}
                            onChange={(e) => updateJobForm("category_l2", e.currentTarget.value)}
                            placeholder={t("addJob.optional")}
                        />
                        <TextInput
                            label={t("jobFilter.categoryL3Label")}
                            value={jobForm.category_l3 ?? ""}
                            onChange={(e) => updateJobForm("category_l3", e.currentTarget.value)}
                            placeholder={t("addJob.optional")}
                        />
                    </Group>

                    <Group grow align="flex-start">
                        <Select
                            label={t("jobFilter.experience")}
                            data={selectData(EXPERIENCE_LEVEL, language)}
                            value={jobForm.experience_level}
                            onChange={(value) => updateField("experience_level", value)}
                            clearable
                        />
                        <Select
                            label={t("jobFilter.seniority")}
                            data={selectData(SENIORITY, language)}
                            value={jobForm.seniority}
                            onChange={(value) => updateField("seniority", value)}
                            clearable
                        />
                    </Group>

                    <Group grow align="flex-start">
                        <Select
                            label={t("jobFilter.employmentType")}
                            data={selectData(EMPLOYMENT_TYPE, language)}
                            value={jobForm.employment_type}
                            onChange={(value) => updateField("employment_type", value)}
                            clearable
                        />
                        <Select
                            label={t("jobFilter.workArrangement")}
                            data={selectData(WORK_ARRANGEMENT, language)}
                            value={jobForm.work_arrangement}
                            onChange={(value) => updateField("work_arrangement", value)}
                            clearable
                        />
                    </Group>

                    <Group grow align="flex-start">
                        <Select
                            label={t("jobFilter.saturdayWork")}
                            data={selectData(SATURDAY_WORK, language)}
                            value={jobForm.saturday_work}
                            onChange={(value) => updateField("saturday_work", value)}
                            clearable
                        />
                        <Select
                            label={t("jobFilter.workSchedule")}
                            data={selectData(WORK_SCHEDULE, language)}
                            value={jobForm.work_schedule}
                            onChange={(value) => updateField("work_schedule", value)}
                            clearable
                        />
                    </Group>

                    <Group grow align="flex-start">
                        <NumberInput
                            label={t("jobFilter.salaryFrom")}
                            value={jobForm.salary_min ?? ""}
                            onChange={(value) => updateField("salary_min", typeof value === "number" ? value : null)}
                            disabled={Boolean(jobForm.salary_negotiable)}
                        />
                        <NumberInput
                            label={t("jobFilter.salaryTo")}
                            value={jobForm.salary_max ?? ""}
                            onChange={(value) => updateField("salary_max", typeof value === "number" ? value : null)}
                            disabled={Boolean(jobForm.salary_negotiable)}
                        />
                        <Select
                            label={t("jobFilter.salaryUnit")}
                            data={selectData(SALARY_UNIT, language)}
                            value={jobForm.salary_unit}
                            onChange={(value) => updateField("salary_unit", value)}
                            disabled={Boolean(jobForm.salary_negotiable)}
                            clearable
                        />
                    </Group>

                    <Group>
                        <Checkbox
                            label={t("jobFilter.salaryNegotiable")}
                            checked={Boolean(jobForm.salary_negotiable)}
                            onChange={(e) => updateField("salary_negotiable", e.currentTarget.checked)}
                        />
                        <Checkbox
                            label={t("jobFilter.featuredEmployerOnly")}
                            checked={Boolean(jobForm.is_featured_employer)}
                            onChange={(e) => updateField("is_featured_employer", e.currentTarget.checked)}
                        />
                    </Group>

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
