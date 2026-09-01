import {
    ActionIcon,
    Button,
    Group,
    Paper,
    Pill,
    PillsInput,
    Stack,
    Text,
    Textarea,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { ReactNode, useState } from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import CvService, { CvConfirmReturn } from "../services/CvService";
import { CV, Profile } from "../types";
import { saveStoredProfileCv } from "../utils/profileStorage";
import { useTranslation } from "../contexts/I18nContext";

const BROWN = "#774326";

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
    headerAction?: ReactNode;
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
                                     headerAction,
                                     isEditing = false,
                                     hideCollections = false,
                                     onProfileFieldChange,
                                     onCollectionItemChange,
                                     onCollectionAdd,
                                     onCollectionDelete,
                                 }: CVSummaryDetailsProps) {
    const { t } = useTranslation();
    const profile = profileOverride ?? cv?.candidate_profile;

    const sectionStyle = {
        border: "1px solid rgba(119, 67, 38, 0.18)",
        backgroundColor: "#fdf7ef",
    };

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
            <Paper key={config.key} p="md" radius="md" style={sectionStyle}>
                <Stack gap="md">
                    <Group justify="space-between" align="center">
                        <Text fw={700} c={BROWN}>
                            {config.title}
                        </Text>
                    </Group>

                    {items.length === 0 && (
                        <Text size="sm" c="dimmed" fs="italic">
                            {config.empty}
                        </Text>
                    )}

                    {items.map((item, index) => {
                        const isPendingDelete =
                            pendingDelete?.collection === config.key &&
                            pendingDelete.index === index;

                        return (
                            <Paper
                                key={`${config.key}-${item.id ?? index}`}
                                p="sm"
                                radius="sm"
                                style={{
                                    backgroundColor: "#ffffff",
                                    border: "1px solid rgba(119, 67, 38, 0.12)",
                                }}
                            >
                                <Stack gap="sm">
                                    <Group justify="space-between" align="center">
                                        <Text size="sm" fw={600} c={BROWN}>
                                            {config.title} {index + 1}
                                        </Text>

                                        {isEditing && (
                                            isPendingDelete ? (
                                                <Group gap="xs">
                                                    <Button
                                                        size="xs"
                                                        variant="light"
                                                        color="red"
                                                        onClick={() => {
                                                            onCollectionDelete?.(config.key, index);
                                                            setPendingDelete(null);
                                                        }}
                                                    >
                                                        {t("cvSummary.confirmDelete")}
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        variant="subtle"
                                                        color="gray"
                                                        onClick={() => setPendingDelete(null)}
                                                    >
                                                        {t("common.cancel")}
                                                    </Button>
                                                </Group>
                                            ) : (
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="red"
                                                    aria-label={t("cvSummary.deleteItemAria", { title: config.title, index: index + 1 })}
                                                    onClick={() =>
                                                        setPendingDelete({
                                                            collection: config.key,
                                                            index,
                                                        })
                                                    }
                                                >
                                                    <IconTrash size={18} />
                                                </ActionIcon>
                                            )
                                        )}
                                    </Group>

                                    <Group grow align="flex-start">
                                        {config.fields.map(([field, label]) => (
                                            <div key={field}>
                                                {renderEditableField(
                                                    label,
                                                    (item as Record<string, string | null | undefined>)[field],
                                                    (value) =>
                                                        onCollectionItemChange?.(
                                                            config.key,
                                                            index,
                                                            field,
                                                            value,
                                                        ),
                                                    field === "description",
                                                )}
                                            </div>
                                        ))}
                                    </Group>
                                </Stack>
                            </Paper>
                        );
                    })}

                    {isEditing && (
                        <Button
                            leftSection={<IconPlus size={16} />}
                            variant="outline"
                            color={BROWN}
                            onClick={() => onCollectionAdd?.(config.key)}
                        >
                            {t("cvSummary.addItem", { title: config.title })}
                        </Button>
                    )}
                </Stack>
            </Paper>
        );
    };

    return (
        <Stack gap="lg">
            {headerAction && (
                <Group justify="flex-end">
                    {headerAction}
                </Group>
            )}

            <Paper p="md" radius="md" style={sectionStyle}>
                <Stack gap="md">
                    <Text fw={700} c={BROWN}>
                        {t("cvSummary.basicInformation")}
                    </Text>

                    <Group grow>
                        <TextInput
                            label={t("cvSummary.givenName")}
                            value={profile?.given_name ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) =>
                                onProfileFieldChange?.(
                                    "given_name",
                                    event.currentTarget.value,
                                )
                            }
                        />
                        <TextInput
                            label={t("cvSummary.middleName")}
                            value={profile?.middle_name ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) =>
                                onProfileFieldChange?.(
                                    "middle_name",
                                    event.currentTarget.value,
                                )
                            }
                        />
                        <TextInput
                            label={t("cvSummary.familyName")}
                            value={profile?.family_name ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) =>
                                onProfileFieldChange?.(
                                    "family_name",
                                    event.currentTarget.value,
                                )
                            }
                        />
                    </Group>

                    <Group grow>
                        <TextInput
                            label={t("cvSummary.currentTitle")}
                            value={profile?.current_title ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) =>
                                onProfileFieldChange?.(
                                    "current_title",
                                    event.currentTarget.value,
                                )
                            }
                        />
                        <TextInput
                            label={t("cvSummary.email")}
                            value={profile?.email ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) =>
                                onProfileFieldChange?.(
                                    "email",
                                    event.currentTarget.value,
                                )
                            }
                        />
                    </Group>

                    <Group grow>
                        <TextInput
                            label={t("cvSummary.phone")}
                            value={profile?.phone ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) =>
                                onProfileFieldChange?.(
                                    "phone",
                                    event.currentTarget.value,
                                )
                            }
                        />
                        <TextInput
                            label={t("cvSummary.location")}
                            value={profile?.location ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) =>
                                onProfileFieldChange?.(
                                    "location",
                                    event.currentTarget.value,
                                )
                            }
                        />
                    </Group>

                    <Textarea
                        label={t("cvSummary.bio")}
                        value={profile?.bio ?? ""}
                        autosize
                        readOnly={!isEditing}
                        onChange={(event) =>
                            onProfileFieldChange?.(
                                "bio",
                                event.currentTarget.value,
                            )
                        }
                    />

                    <PillsInput label={t("cvSummary.skills")}
                                description={t("cvSummary.skillsHint")}
                    >
                        <Pill.Group>
                            {skills.map((skill) => {
                                const isLong = skill.length > 60;

                                const pill = (
                                    <Pill
                                        key={skill}
                                        radius="sm"
                                        color={BROWN}
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

                                return isLong ? (
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
                                    onChange={(event) =>
                                        setSkillInput(
                                            event.currentTarget.value,
                                        )
                                    }
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === "Enter" ||
                                            event.key === "Tab"
                                        ) {
                                            event.preventDefault();
                                            addSkill(skillInput);
                                            return;
                                        }

                                        if (
                                            event.key === "Backspace" &&
                                            !skillInput.trim() &&
                                            skills.length > 0
                                        ) {
                                            event.preventDefault();
                                            removeSkill(
                                                skills[skills.length - 1],
                                            );
                                        }
                                    }}
                                />
                            )}
                        </Pill.Group>
                    </PillsInput>
                </Stack>
            </Paper>

            {!hideCollections && collectionConfigs.map(renderCollectionSection)}

            {footer}
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
            alert(t("cvSummary.saveChangesFailed"));
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
            headerAction={
                !isEditing && (
                    <Button
                        variant="outline"
                        color={BROWN}
                        onClick={() => setIsEditing(true)}
                        disabled={isSubmitting}
                    >
                        {t("common.edit")}
                    </Button>
                )
            }
            footer={
                <Button
                    color={BROWN}
                    fullWidth
                    loading={isSaving || isSubmitting}
                    disabled={isSaving || isSubmitting}
                    onClick={isEditing ? onSaveChanges : onSubmit}
                >
                    {isEditing ? t("addJob.saveChanges") : t("cvSummary.everythingLooksGood")}
                </Button>
            }
        />
    );
}
