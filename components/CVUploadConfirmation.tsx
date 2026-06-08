import {
    Button,
    Divider,
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
import CvService, { CvConfirmReturn } from "../services/CvService";
import { CV, Profile } from "../types";

const BROWN = "#774326";

interface Props {
    cv: CV;
    onClose: (scores: CvConfirmReturn[]) => void;
    profileId: number | null;
}

interface CVSummaryDetailsProps {
    cv: CV;
    profile?: Profile | null;
    footer?: ReactNode;
    isEditing?: boolean;
    onProfileFieldChange?: (field: keyof Profile, value: string) => void;
    onCollectionItemChange?: (
        collection: "work_experiences" | "educations" | "projects" | "languages" | "certifications",
        index: number,
        field: string,
        value: string,
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
                                     onProfileFieldChange,
                                     onCollectionItemChange,
                                 }: CVSummaryDetailsProps) {
    const profile = profileOverride ?? cv?.candidate_profile;

    const sectionStyle = {
        border: "1px solid rgba(119, 67, 38, 0.18)",
        backgroundColor: "#fdf7ef",
    };

    const [skillInput, setSkillInput] = useState("");

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

    return (
        <Stack gap="lg">
            <Paper p="md" radius="md" style={sectionStyle}>
                <Stack gap="md">
                    <Text fw={700} c={BROWN}>
                        Basic Information
                    </Text>

                    <Group grow>
                        <TextInput
                            label="Given Name"
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
                            label="Middle Name"
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
                            label="Family Name"
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
                            label="Current Title"
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
                            label="Email"
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
                            label="Phone"
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
                            label="Location"
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
                        label="Bio"
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

                    <PillsInput label="Skills"
                                description="Add skills by writing them and pressing Enter or Tab in edit mode"
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
                                    placeholder="Add a skill..."
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

            {footer && <Group justify="flex-end">{footer}</Group>}
        </Stack>
    );
}

export default function CVUploadConfirmation({
                                                 cv,
                                                 onClose,
                                                 profileId,
                                             }: Props) {
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

            setIsEditing(false);
            await onSubmit();
        } catch (error) {
            console.error("Save CV changes error:", error);
            alert("Could not save CV changes.");
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

    return (
        <CVSummaryDetails
            cv={cv}
            profile={profile}
            isEditing={isEditing}
            onProfileFieldChange={updateProfileField}
            onCollectionItemChange={updateCollectionItem}
            footer={
                <>
                    {!isEditing && (
                        <Button
                            variant="outline"
                            color={BROWN}
                            onClick={() => setIsEditing(true)}
                            disabled={isSubmitting}
                        >
                            Edit
                        </Button>
                    )}

                    <Button
                        color={BROWN}
                        loading={isSaving || isSubmitting}
                        disabled={isSaving || isSubmitting}
                        onClick={isEditing ? onSaveChanges : onSubmit}
                    >
                        {isEditing ? "Save changes" : "Everything looks good!"}
                    </Button>
                </>
            }
        />
    );
}