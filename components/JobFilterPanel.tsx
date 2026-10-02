import { Accordion, Button, Checkbox, Group, MultiSelect, NumberInput, Select, Stack, Text } from "@mantine/core";

import { Job, JobFilterOptions } from "../types";
import { useTranslation } from "../contexts/I18nContext";
import {
    CATEGORY_L1,
    COMPANY_INDUSTRY,
    EMPLOYMENT_TYPE,
    EXPERIENCE_LEVEL,
    SALARY_BANDS,
    SALARY_UNIT,
    SATURDAY_WORK,
    SENIORITY,
    TaxonomyEntry,
    WORK_ARRANGEMENT,
    WORK_SCHEDULE,
} from "../constants/jobTaxonomy";
import styles from "../styles/editorial.module.css";

const INK = "#15110d";

export type JobFilters = {
    categoryL1: string[];
    categoryL2: string[];
    categoryL3: string[];
    locations: string[];
    experienceLevels: string[];
    seniorities: string[];
    employmentTypes: string[];
    workArrangements: string[];
    saturdayWork: string | null;
    workSchedules: string[];
    companyIndustries: string[];
    featuredOnly: boolean;
    salaryUnit: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryNegotiableOnly: boolean;
};

export const EMPTY_FILTERS: JobFilters = {
    categoryL1: [],
    categoryL2: [],
    categoryL3: [],
    locations: [],
    experienceLevels: [],
    seniorities: [],
    employmentTypes: [],
    workArrangements: [],
    saturdayWork: null,
    workSchedules: [],
    companyIndustries: [],
    featuredOnly: false,
    salaryUnit: null,
    salaryMin: null,
    salaryMax: null,
    salaryNegotiableOnly: false,
};

export const hasActiveFilters = (filters: JobFilters): boolean =>
    filters.categoryL1.length > 0 ||
    filters.categoryL2.length > 0 ||
    filters.categoryL3.length > 0 ||
    filters.locations.length > 0 ||
    filters.experienceLevels.length > 0 ||
    filters.seniorities.length > 0 ||
    filters.employmentTypes.length > 0 ||
    filters.workArrangements.length > 0 ||
    filters.saturdayWork !== null ||
    filters.workSchedules.length > 0 ||
    filters.companyIndustries.length > 0 ||
    filters.featuredOnly ||
    filters.salaryUnit !== null ||
    filters.salaryMin !== null ||
    filters.salaryMax !== null ||
    filters.salaryNegotiableOnly;

const matchesMulti = (selected: string[], value: string | null | undefined): boolean =>
    selected.length === 0 || (value != null && selected.includes(value));

export const matchesJobFilters = (job: Job, filters: JobFilters): boolean => {
    if (!matchesMulti(filters.categoryL1, job.category_l1)) return false;
    if (!matchesMulti(filters.categoryL2, job.category_l2)) return false;
    if (!matchesMulti(filters.categoryL3, job.category_l3)) return false;
    if (!matchesMulti(filters.locations, job.location)) return false;
    if (!matchesMulti(filters.experienceLevels, job.experience_level)) return false;
    if (!matchesMulti(filters.seniorities, job.seniority)) return false;
    if (!matchesMulti(filters.employmentTypes, job.employment_type)) return false;
    if (!matchesMulti(filters.workArrangements, job.work_arrangement)) return false;
    if (!matchesMulti(filters.workSchedules, job.work_schedule)) return false;
    if (filters.saturdayWork !== null && job.saturday_work !== filters.saturdayWork) return false;
    if (!matchesMulti(filters.companyIndustries, job.company_industry)) return false;
    if (filters.featuredOnly && !job.is_featured_employer) return false;

    if (filters.salaryNegotiableOnly && !job.salary_negotiable) return false;

    if (filters.salaryMin !== null || filters.salaryMax !== null) {
        if (job.salary_min == null && job.salary_max == null) return false;

        const jobMin = job.salary_min ?? job.salary_max ?? 0;
        const jobMax = job.salary_max ?? job.salary_min ?? Infinity;
        const filterMin = filters.salaryMin ?? 0;
        const filterMax = filters.salaryMax ?? Infinity;

        if (jobMax < filterMin || jobMin > filterMax) return false;
    }

    return true;
};

const toSelectData = (entries: TaxonomyEntry[], lang: "VN" | "EN") =>
    entries.map((entry) => ({ value: entry.value, label: lang === "VN" ? entry.label_vn : entry.label_en }));

const toPlainData = (values: string[]) => values.map((value) => ({ value, label: value }));

type JobFilterPanelProps = {
    filters: JobFilters;
    onChange: (filters: JobFilters) => void;
    filterOptions: JobFilterOptions;
};

export default function JobFilterPanel({ filters, onChange, filterOptions }: JobFilterPanelProps) {
    const { t, language } = useTranslation();

    const set = <K extends keyof JobFilters>(field: K, value: JobFilters[K]) => {
        onChange({ ...filters, [field]: value });
    };

    const applySalaryBand = (band: (typeof SALARY_BANDS)[number]) => {
        onChange({ ...filters, salaryMin: band.min, salaryMax: band.max, salaryNegotiableOnly: false });
    };

    return (
        <Stack gap="sm">
            <Group justify="space-between" align="center">
                <Text className={styles.filterTitle}>
                    {t("jobFilter.title")}
                </Text>
                {hasActiveFilters(filters) && (
                    <Button variant="subtle" size="xs" radius={0} color={INK} onClick={() => onChange(EMPTY_FILTERS)}>
                        {t("jobFilter.clearAll")}
                    </Button>
                )}
            </Group>

            <Accordion
                multiple
                defaultValue={["category", "location"]}
                chevronPosition="right"
                classNames={{ item: styles.filterItem, control: styles.filterControl, content: styles.filterContent }}
            >
                <Accordion.Item value="category">
                    <Accordion.Control>{t("jobFilter.category")}</Accordion.Control>
                    <Accordion.Panel>
                        <Stack gap="xs">
                            <MultiSelect
                                placeholder={t("jobFilter.categoryL1Placeholder")}
                                data={toSelectData(CATEGORY_L1, language)}
                                value={filters.categoryL1}
                                onChange={(value) => set("categoryL1", value)}
                                searchable
                                clearable
                            />
                            {filterOptions.category_l2.length > 0 && (
                                <MultiSelect
                                    label={t("jobFilter.categoryL2Label")}
                                    data={toPlainData(filterOptions.category_l2)}
                                    value={filters.categoryL2}
                                    onChange={(value) => set("categoryL2", value)}
                                    searchable
                                    clearable
                                />
                            )}
                            {filterOptions.category_l3.length > 0 && (
                                <MultiSelect
                                    label={t("jobFilter.categoryL3Label")}
                                    data={toPlainData(filterOptions.category_l3)}
                                    value={filters.categoryL3}
                                    onChange={(value) => set("categoryL3", value)}
                                    searchable
                                    clearable
                                />
                            )}
                        </Stack>
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="location">
                    <Accordion.Control>{t("jobFilter.location")}</Accordion.Control>
                    <Accordion.Panel>
                        <MultiSelect
                            placeholder={t("jobFilter.locationPlaceholder")}
                            data={toPlainData(filterOptions.location)}
                            value={filters.locations}
                            onChange={(value) => set("locations", value)}
                            searchable
                            clearable
                        />
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="salary">
                    <Accordion.Control>{t("jobFilter.salary")}</Accordion.Control>
                    <Accordion.Panel>
                        <Stack gap="xs">
                            <Group gap="xs">
                                {SALARY_BANDS.map((band) => (
                                    <Button
                                        key={band.value}
                                        size="xs"
                                        radius={0}
                                        color={INK}
                                        variant={filters.salaryMin === band.min && filters.salaryMax === band.max ? "filled" : "outline"}
                                        onClick={() => applySalaryBand(band)}
                                    >
                                        {language === "VN" ? band.label_vn : band.label_en}
                                    </Button>
                                ))}
                            </Group>
                            <Group grow>
                                <NumberInput
                                    label={t("jobFilter.salaryFrom")}
                                    value={filters.salaryMin ?? ""}
                                    onChange={(value) => set("salaryMin", typeof value === "number" ? value : null)}
                                    disabled={filters.salaryNegotiableOnly}
                                />
                                <NumberInput
                                    label={t("jobFilter.salaryTo")}
                                    value={filters.salaryMax ?? ""}
                                    onChange={(value) => set("salaryMax", typeof value === "number" ? value : null)}
                                    disabled={filters.salaryNegotiableOnly}
                                />
                            </Group>
                            <Select
                                label={t("jobFilter.salaryUnit")}
                                data={toSelectData(SALARY_UNIT, language)}
                                value={filters.salaryUnit}
                                onChange={(value) => set("salaryUnit", value)}
                                clearable
                                disabled={filters.salaryNegotiableOnly}
                            />
                            <Checkbox
                                label={t("jobFilter.salaryNegotiable")}
                                checked={filters.salaryNegotiableOnly}
                                onChange={(e) =>
                                    onChange({
                                        ...filters,
                                        salaryNegotiableOnly: e.currentTarget.checked,
                                        salaryMin: e.currentTarget.checked ? null : filters.salaryMin,
                                        salaryMax: e.currentTarget.checked ? null : filters.salaryMax,
                                    })
                                }
                            />
                        </Stack>
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="experience">
                    <Accordion.Control>{t("jobFilter.experience")}</Accordion.Control>
                    <Accordion.Panel>
                        <Checkbox.Group value={filters.experienceLevels} onChange={(value) => set("experienceLevels", value)}>
                            <Stack gap={6}>
                                {EXPERIENCE_LEVEL.map((entry) => (
                                    <Checkbox key={entry.value} value={entry.value} label={language === "VN" ? entry.label_vn : entry.label_en} />
                                ))}
                            </Stack>
                        </Checkbox.Group>
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="seniority">
                    <Accordion.Control>{t("jobFilter.seniority")}</Accordion.Control>
                    <Accordion.Panel>
                        <Checkbox.Group value={filters.seniorities} onChange={(value) => set("seniorities", value)}>
                            <Stack gap={6}>
                                {SENIORITY.map((entry) => (
                                    <Checkbox key={entry.value} value={entry.value} label={language === "VN" ? entry.label_vn : entry.label_en} />
                                ))}
                            </Stack>
                        </Checkbox.Group>
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="employmentType">
                    <Accordion.Control>{t("jobFilter.employmentType")}</Accordion.Control>
                    <Accordion.Panel>
                        <Checkbox.Group value={filters.employmentTypes} onChange={(value) => set("employmentTypes", value)}>
                            <Stack gap={6}>
                                {EMPLOYMENT_TYPE.map((entry) => (
                                    <Checkbox key={entry.value} value={entry.value} label={language === "VN" ? entry.label_vn : entry.label_en} />
                                ))}
                            </Stack>
                        </Checkbox.Group>
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="workArrangement">
                    <Accordion.Control>{t("jobFilter.workArrangement")}</Accordion.Control>
                    <Accordion.Panel>
                        <Checkbox.Group value={filters.workArrangements} onChange={(value) => set("workArrangements", value)}>
                            <Stack gap={6}>
                                {WORK_ARRANGEMENT.map((entry) => (
                                    <Checkbox key={entry.value} value={entry.value} label={language === "VN" ? entry.label_vn : entry.label_en} />
                                ))}
                            </Stack>
                        </Checkbox.Group>
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="schedule">
                    <Accordion.Control>{t("jobFilter.workSchedule")}</Accordion.Control>
                    <Accordion.Panel>
                        <Stack gap="sm">
                            <Select
                                label={t("jobFilter.saturdayWork")}
                                placeholder={t("jobFilter.saturdayNoFilter")}
                                data={toSelectData(SATURDAY_WORK, language)}
                                value={filters.saturdayWork}
                                onChange={(value) => set("saturdayWork", value)}
                                clearable
                            />
                            <Checkbox.Group value={filters.workSchedules} onChange={(value) => set("workSchedules", value)}>
                                <Stack gap={6}>
                                    {WORK_SCHEDULE.map((entry) => (
                                        <Checkbox key={entry.value} value={entry.value} label={language === "VN" ? entry.label_vn : entry.label_en} />
                                    ))}
                                </Stack>
                            </Checkbox.Group>
                        </Stack>
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="company">
                    <Accordion.Control>{t("jobFilter.companyIndustry")}</Accordion.Control>
                    <Accordion.Panel>
                        <Stack gap="xs">
                            <MultiSelect
                                data={toSelectData(COMPANY_INDUSTRY, language)}
                                value={filters.companyIndustries}
                                onChange={(value) => set("companyIndustries", value)}
                                searchable
                                clearable
                            />
                            <Checkbox
                                label={t("jobFilter.featuredEmployerOnly")}
                                checked={filters.featuredOnly}
                                onChange={(e) => set("featuredOnly", e.currentTarget.checked)}
                            />
                        </Stack>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Stack>
    );
}
