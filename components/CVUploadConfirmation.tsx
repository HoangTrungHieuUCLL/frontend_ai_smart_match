import {
    Pill,
    PillsInput,
    SimpleGrid,
    Stack,
    Textarea,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ReactNode, useState } from "react";
import { IconArrowUpRight, IconPlus, IconTrash } from "@tabler/icons-react";
import CvService, { CvConfirmReturn } from "../services/CvService";
import { CV, Profile } from "../types";
import { saveStoredProfileCv } from "../utils/profileStorage";
import { useTranslation } from "../contexts/I18nContext";
import styles from "../styles/editorial.module.css";

interface Props {
    cv: CV;
    onClose: (scores: CvConfirmReturn[]) => void;
    profileId: number | null;
    sourceBanner?: string;
}

interface CVSummaryDetailsProps {
    cv: CV;
    profile?: Profile | null;
    footer?: ReactNode;
    isEditing?: boolean;
    hideCollections?: boolean;
    onProfileFieldChange?: (field: keyof Profile, value: string) => void;
    onCollectionItemChange?: (
        collection: "work_experiences" | "educations" | "projects" | "languages" | "certifications",
        index: number,
        field: string,
        value: string,
    ) => void;
    onCollectionAdd?: (
        collection: "work_experiences" | "educations" | "projects" | "languages" | "certifications",
    ) => void;
    onCollectionDelete?: (
        collection: "work_experiences" | "educations" | "projects" | "languages" | "certifications",
        index: number,
    ) => void;
}

const parseSkills = (skillsStr?: string | null): string[] =>
    (skillsStr ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

const serializeSkills = (skills: string[]) =>
    skills.map((s) => s.trim()).filter(Boolean);

export function CVSummaryDetails({
                                     cv,
                                     profile: profileOverride,
                                     footer,
                                     isEditing = false,
                                     hideCollections = false,
                                     onProfileFieldChange,
                                     onCollectionItemChange,
                                     onCollectionAdd,
                                     onCollectionDelete,
                                 }: CVSummaryDetailsProps) {
    const { t } = useTranslation();
    const profile = profileOverride ?? cv?.candidate_profile;

    const [skillInput, setSkillInput] = useState("");
    const [pendingDelete, setPendingDelete] = useState<{
        collection: "work_experiences" | "educations" | "projects" | "languages" | "certifications";
        index: number;
    } | null>(null);

    const skills = parseSkills(profile?.skills);

    const updateSkills = (nextSkills: string[]) => {
        const normalized = serializeSkills(nextSkills);
        onProfileFieldChange?.("skills", normalized.join(", "));
    };

    const addSkill = (rawSkill: string) => {
        const skill = rawSkill.trim();

        setSkillInput("");

        if (!skill) return;

        const exists = skills.some(
            (s) => s.toLowerCase() === skill.toLowerCase(),
        );

        if (exists) return;

        updateSkills([...skills, skill]);
    };

    const removeSkill = (skillToRemove: string) => {
        updateSkills(
            skills.filter(
                (s) => s.toLowerCase() !== skillToRemove.toLowerCase(),
            ),
        );
    };

    const renderEditableField = (
        label: string,
        value: string | null | undefined,
        onChange: (value: string) => void,
        multiline = false,
    ) => {
        if (multiline) {
            return (
                <Textarea
                    label={label}
                    value={value ?? ""}
                    readOnly={!isEditing}
                    autosize
                    minRows={2}
                    onChange={(event) => onChange(event.currentTarget.value)}
                />
            );
        }

        return (
            <TextInput
                label={label}
                value={value ?? ""}
                readOnly={!isEditing}
                onChange={(event) => onChange(event.currentTarget.value)}
            />
        );
    };

    const collectionConfigs = [
        {
            key: "work_experiences" as const,
            title: t("cvSummary.workExperience"),
            empty: t("cvSummary.noWorkExperience"),
            fields: [
                ["job_title", t("cvSummary.jobTitle")],
                ["company_name", t("cvSummary.company")],
                ["start_date", t("cvSummary.startDate")],
                ["end_date", t("cvSummary.endDate")],
            ],
        },
        {
            key: "educations" as const,
            title: t("cvSummary.education"),
            empty: t("cvSummary.noEducation"),
            fields: [
                ["institution", t("cvSummary.institution")],
                ["degree", t("cvSummary.degree")],
                ["field_of_study", t("cvSummary.fieldOfStudy")],
                ["start_date", t("cvSummary.startDate")],
                ["end_date", t("cvSummary.endDate")],
            ],
        },
        {
            key: "projects" as const,
            title: t("cvSummary.projects"),
            empty: t("cvSummary.noProjects"),
            fields: [
                ["project_name", t("cvSummary.projectName")],
                ["description", t("cvSummary.description")],
            ],
        },
        {
            key: "languages" as const,
            title: t("cvSummary.languages"),
            empty: t("cvSummary.noLanguages"),
            fields: [
                ["language_name", t("cvSummary.language")],
                ["proficiency_level", t("cvSummary.proficiency")],
            ],
        },
        {
            key: "certifications" as const,
            title: t("cvSummary.certifications"),
            empty: t("cvSummary.noCertifications"),
            fields: [
                ["certification_name", t("cvSummary.certification")],
                ["issue_date", t("cvSummary.issueDate")],
            ],
        },
    ];

    const renderCollectionSection = (config: typeof collectionConfigs[number]) => {
        const items = profile?.[config.key] ?? [];

        return (
            <section key={config.key} className={styles.summarySection}>
                <h3 className={styles.sectionHeading}>{config.title}</h3>

                <Stack gap="sm">
                    {items.length === 0 && <span className={styles.emptyNote}>{config.empty}</span>}

                    {items.map((item, index) => {
                        const isPendingDelete =
                            pendingDelete?.collection === config.key &&
                            pendingDelete.index === index;

                        return (
                            <div key={`${config.key}-${item.id ?? index}`} className={styles.summaryItem}>
                                <div className={styles.summaryItemHeader}>
                                    <span>
                                        {String(index + 1).padStart(2, "0")} {config.title}
                                    </span>

                                    {isEditing && (
                                        isPendingDelete ? (
                                            <span style={{ display: "flex", gap: 6 }}>
                                                <button
                                                    type="button"
                                                    className={`${styles.chip} ${styles.chipSmall}`}
                                                    style={{ borderColor: "#c92a2a", color: "#c92a2a" }}
                                                    onClick={() => {
                                                        onCollectionDelete?.(config.key, index);
                                                        setPendingDelete(null);
                                                    }}
                                                >
                                                    {t("cvSummary.confirmDelete")}
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`${styles.chip} ${styles.chipSmall}`}
                                                    onClick={() => setPendingDelete(null)}
                                                >
                                                    {t("common.cancel")}
                                                </button>
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                                aria-label={t("cvSummary.deleteItemAria", { title: config.title, index: index + 1 })}
                                                onClick={() => setPendingDelete({ collection: config.key, index })}
                                            >
                                                <IconTrash size={16} />
                                            </button>
                                        )
                                    )}
                                </div>

                                <SimpleGrid cols={{ base: 1, sm: Math.min(config.fields.length, 3) }} spacing="sm">
                                    {config.fields.map(([field, label]) => (
                                        <div key={field} style={field === "description" ? { gridColumn: "1 / -1" } : undefined}>
                                            {renderEditableField(
                                                label,
                                                (item as Record<string, string | null | undefined>)[field],
                                                (value) => onCollectionItemChange?.(config.key, index, field, value),
                                                field === "description",
                                            )}
                                        </div>
                                    ))}
                                </SimpleGrid>
                            </div>
                        );
                    })}

                    {isEditing && (
                        <button
                            type="button"
                            className={`${styles.chip} ${styles.chipSmall}`}
                            style={{ alignSelf: "flex-start" }}
                            onClick={() => onCollectionAdd?.(config.key)}
                        >
                            <IconPlus size={14} />
                            {t("cvSummary.addItem", { title: config.title })}
                        </button>
                    )}
                </Stack>
            </section>
        );
    };

    return (
        <Stack gap={0}>
            <section className={styles.summarySection} style={{ borderTop: 0, paddingTop: 0 }}>
                <h3 className={styles.sectionHeading}>{t("cvSummary.basicInformation")}</h3>

                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" verticalSpacing="sm">
                    <TextInput
                        label={t("cvSummary.givenName")}
                        value={profile?.given_name ?? ""}
                        readOnly={!isEditing}
                        onChange={(event) => onProfileFieldChange?.("given_name", event.currentTarget.value)}
                    />
                    <TextInput
                        label={t("cvSummary.middleName")}
                        value={profile?.middle_name ?? ""}
                        readOnly={!isEditing}
                        onChange={(event) => onProfileFieldChange?.("middle_name", event.currentTarget.value)}
                    />
                    <TextInput
                        label={t("cvSummary.familyName")}
                        value={profile?.family_name ?? ""}
                        readOnly={!isEditing}
                        onChange={(event) => onProfileFieldChange?.("family_name", event.currentTarget.value)}
                    />
                    <TextInput
                        label={t("cvSummary.currentTitle")}
                        value={profile?.current_title ?? ""}
                        readOnly={!isEditing}
                        onChange={(event) => onProfileFieldChange?.("current_title", event.currentTarget.value)}
                    />
                    <TextInput
                        label={t("cvSummary.email")}
                        value={profile?.email ?? ""}
                        readOnly={!isEditing}
                        onChange={(event) => onProfileFieldChange?.("email", event.currentTarget.value)}
                    />
                    <TextInput
                        label={t("cvSummary.phone")}
                        value={profile?.phone ?? ""}
                        readOnly={!isEditing}
                        onChange={(event) => onProfileFieldChange?.("phone", event.currentTarget.value)}
                    />
                    <TextInput
                        label={t("cvSummary.location")}
                        value={profile?.location ?? ""}
                        readOnly={!isEditing}
                        onChange={(event) => onProfileFieldChange?.("location", event.currentTarget.value)}
                    />
                </SimpleGrid>

                <Textarea
                    mt="sm"
                    label={t("cvSummary.bio")}
                    value={profile?.bio ?? ""}
                    autosize
                    minRows={2}
                    readOnly={!isEditing}
                    onChange={(event) => onProfileFieldChange?.("bio", event.currentTarget.value)}
                />
            </section>

            <section className={styles.summarySection}>
                <h3 className={styles.sectionHeading}>{t("cvSummary.skills")}</h3>
                <PillsInput
                    description={isEditing ? t("cvSummary.skillsHint") : undefined}
                    aria-label={t("cvSummary.skills")}
                    styles={{ input: { borderColor: isEditing ? "var(--ink)" : "transparent", background: isEditing ? "#fff" : "transparent", paddingLeft: isEditing ? undefined : 0 } }}
                >
                    <Pill.Group>
                        {skills.length === 0 && !isEditing && <span className={styles.emptyNote}>—</span>}
                        {skills.map((skill) => {
                            const pill = (
                                <Pill
                                    key={skill}
                                    className={styles.skillPill}
                                    withRemoveButton={isEditing}
                                    onRemove={() => removeSkill(skill)}
                                >
                                    <span
                                        style={{
                                            display: "inline-block",
                                            maxWidth: 250,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {skill}
                                    </span>
                                </Pill>
                            );

                            return skill.length > 60 ? (
                                <Tooltip key={skill} label={skill}>
                                    {pill}
                                </Tooltip>
                            ) : (
                                pill
                            );
                        })}

                        {isEditing && (
                            <PillsInput.Field
                                value={skillInput}
                                placeholder={t("profile.addSkillPlaceholder")}
                                onChange={(event) => setSkillInput(event.currentTarget.value)}
                                onBlur={() => addSkill(skillInput)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === "Tab") {
                                        event.preventDefault();
                                        addSkill(skillInput);
                                        return;
                                    }

                                    if (event.key === "Backspace" && !skillInput.trim() && skills.length > 0) {
                                        event.preventDefault();
                                        removeSkill(skills[skills.length - 1]);
                                    }
                                }}
                            />
                        )}
                    </Pill.Group>
                </PillsInput>
            </section>

            {!hideCollections && collectionConfigs.map(renderCollectionSection)}

            {footer && <div className={styles.footerBar}>{footer}</div>}
        </Stack>
    );
}

export default function CVUploadConfirmation({
                                                 cv,
                                                 onClose,
                                                 profileId,
                                             }: Props) {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(
        cv?.candidate_profile ?? null,
    );

    const onSubmit = async () => {
        const id = profileId ?? profile?.id;

        if (!id) throw new Error("Profile ID missing");

        setIsSubmitting(true);

        try {
            const response = await CvService.confirmCv({
                profileId: id,
                cv,
            });

            onClose(response?.jobs ?? []);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSaveChanges = async () => {
        if (!profile) return;

        setIsSaving(true);

        try {
            const response = await CvService.updateExtractedData(profile.id, {
                candidate_profile: {
                    ...profile,
                    skills: serializeSkills(parseSkills(profile.skills)).join(", "),
                },
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            saveStoredProfileCv({
                ...cv,
                candidate_profile: profile,
            }, localStorage.getItem("email"));
            setIsEditing(false);
            await onSubmit();
        } catch (error) {
            console.error("Save CV changes error:", error);
            notifications.show({ color: "red", message: t("cvSummary.saveChangesFailed") });
        } finally {
            setIsSaving(false);
        }
    };

    const updateProfileField = (field: keyof Profile, value: string) => {
        setProfile((current) =>
            current ? { ...current, [field]: value } : current,
        );
    };

    const updateCollectionItem = (
        collection:
            | "work_experiences"
            | "educations"
            | "projects"
            | "languages"
            | "certifications",
        index: number,
        field: string,
        value: string,
    ) => {
        setProfile((current) => {
            if (!current) return current;

            const nextCollection = [
                ...current[collection],
            ] as unknown as Array<Record<string, unknown>>;

            nextCollection[index] = {
                ...nextCollection[index],
                [field]: value,
            };

            return {
                ...current,
                [collection]: nextCollection,
            };
        });
    };

    const addCollectionItem = (
        collection:
            | "work_experiences"
            | "educations"
            | "projects"
            | "languages"
            | "certifications",
    ) => {
        setProfile((current) => {
            if (!current) return current;

            const nextId = Date.now();
            const base = { id: nextId, profile_id: current.id };
            const factories = {
                work_experiences: {
                    ...base,
                    job_title: "",
                    company_name: "",
                    start_date: "",
                    end_date: "",
                },
                educations: {
                    ...base,
                    institution: "",
                    degree: "",
                    field_of_study: "",
                    start_date: "",
                    end_date: "",
                },
                projects: {
                    ...base,
                    project_name: "",
                    description: "",
                },
                languages: {
                    ...base,
                    language_name: "",
                    proficiency_level: "",
                },
                certifications: {
                    ...base,
                    certification_name: "",
                    issue_date: "",
                },
            };

            return {
                ...current,
                [collection]: [...current[collection], factories[collection]],
            };
        });
    };

    const deleteCollectionItem = (
        collection:
            | "work_experiences"
            | "educations"
            | "projects"
            | "languages"
            | "certifications",
        index: number,
    ) => {
        setProfile((current) => {
            if (!current) return current;

            return {
                ...current,
                [collection]: current[collection].filter((_, itemIndex) => itemIndex !== index),
            };
        });
    };

    return (
        <CVSummaryDetails
            cv={cv}
            profile={profile}
            isEditing={isEditing}
            hideCollections
            onProfileFieldChange={updateProfileField}
            onCollectionItemChange={updateCollectionItem}
            onCollectionAdd={addCollectionItem}
            onCollectionDelete={deleteCollectionItem}
            footer={
                <>
                    <button
                        type="button"
                        className={styles.chip}
                        style={{ height: 48 }}
                        disabled={isSaving || isSubmitting}
                        onClick={() => {
                            if (isEditing) {
                                setProfile(cv?.candidate_profile ?? null);
                                setIsEditing(false);
                            } else {
                                setIsEditing(true);
                            }
                        }}
                    >
                        {isEditing ? t("common.cancel") : t("common.edit")}
                    </button>
                    <button
                        type="button"
                        className={`${styles.chip} ${styles.chipSolid} ${styles.primaryButton}`}
                        style={{ flex: 2 }}
                        disabled={isSaving || isSubmitting}
                        aria-busy={isSaving || isSubmitting}
                        onClick={isEditing ? onSaveChanges : onSubmit}
                    >
                        {isSaving || isSubmitting
                            ? t("cvSummary.working")
                            : isEditing
                              ? t("addJob.saveChanges")
                              : t("cvSummary.everythingLooksGood")}
                        {!isSaving && !isSubmitting && !isEditing && <IconArrowUpRight size={16} />}
                    </button>
                </>
            }
        />
    );
}
