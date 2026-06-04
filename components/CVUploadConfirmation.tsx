import {
    Button,
    Divider,
    Group,
    Paper,
    Stack,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import { ReactNode, useEffect, useState } from "react";
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
                            onChange={(event) => onProfileFieldChange?.("given_name", event.currentTarget.value)}
                        />
                        <TextInput
                            label="Middle Name"
                            value={profile?.middle_name ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) => onProfileFieldChange?.("middle_name", event.currentTarget.value)}
                        />
                        <TextInput
                            label="Family Name"
                            value={profile?.family_name ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) => onProfileFieldChange?.("family_name", event.currentTarget.value)}
                        />
                    </Group>

                    <Group grow>
                        <TextInput
                            label="Current Title"
                            value={profile?.current_title ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) => onProfileFieldChange?.("current_title", event.currentTarget.value)}
                        />
                        <TextInput
                            label="Email"
                            value={profile?.email ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) => onProfileFieldChange?.("email", event.currentTarget.value)}
                        />
                    </Group>

                    <Group grow>
                        <TextInput
                            label="Phone"
                            value={profile?.phone ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) => onProfileFieldChange?.("phone", event.currentTarget.value)}
                        />
                        <TextInput
                            label="Location"
                            value={profile?.location ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) => onProfileFieldChange?.("location", event.currentTarget.value)}
                        />
                    </Group>

                    <Textarea
                        label="Bio"
                        value={profile?.bio ?? ""}
                        autosize
                        readOnly={!isEditing}
                        onChange={(event) => onProfileFieldChange?.("bio", event.currentTarget.value)}
                    />

                    <TextInput
                        label="Skills"
                        value={profile?.skills ?? ""}
                        readOnly={!isEditing}
                        onChange={(event) => onProfileFieldChange?.("skills", event.currentTarget.value)}
                    />
                </Stack>
            </Paper>

            <Divider />

            <Stack gap="md">
                <Text size="lg" fw={700} c={BROWN}>
                    Work Experience
                </Text>

                {profile?.work_experiences?.map((exp, index) => (
                    <Paper key={exp.id} p="md" radius="md" style={sectionStyle}>
                        <Stack gap="sm">
                            <TextInput
                                label="Job Title"
                                value={exp.job_title ?? ""}
                                readOnly={!isEditing}
                                onChange={(event) => onCollectionItemChange?.("work_experiences", index, "job_title", event.currentTarget.value)}
                            />

                            <TextInput
                                label="Company"
                                value={exp.company_name ?? ""}
                                readOnly={!isEditing}
                                onChange={(event) => onCollectionItemChange?.("work_experiences", index, "company_name", event.currentTarget.value)}
                            />

                            <Group grow>
                                <TextInput
                                    label="Start Date"
                                    value={exp.start_date ?? ""}
                                    readOnly={!isEditing}
                                    onChange={(event) => onCollectionItemChange?.("work_experiences", index, "start_date", event.currentTarget.value)}
                                />
                                <TextInput
                                    label="End Date"
                                    value={exp.end_date ?? ""}
                                    readOnly={!isEditing}
                                    onChange={(event) => onCollectionItemChange?.("work_experiences", index, "end_date", event.currentTarget.value)}
                                />
                            </Group>
                        </Stack>
                    </Paper>
                ))}
            </Stack>

            <Divider />

            <Stack gap="md">
                <Text size="lg" fw={700} c={BROWN}>
                    Education
                </Text>

                {profile?.educations?.map((edu, index) => (
                    <Paper key={edu.id} p="md" radius="md" style={sectionStyle}>
                        <Stack gap="sm">
                            <TextInput
                                label="Institution"
                                value={edu.institution ?? ""}
                                readOnly={!isEditing}
                                onChange={(event) => onCollectionItemChange?.("educations", index, "institution", event.currentTarget.value)}
                            />

                            <TextInput
                                label="Degree"
                                value={edu.degree ?? ""}
                                readOnly={!isEditing}
                                onChange={(event) => onCollectionItemChange?.("educations", index, "degree", event.currentTarget.value)}
                            />

                            <TextInput
                                label="Field of Study"
                                value={edu.field_of_study ?? ""}
                                readOnly={!isEditing}
                                onChange={(event) => onCollectionItemChange?.("educations", index, "field_of_study", event.currentTarget.value)}
                            />

                            <Group grow>
                                <TextInput
                                    label="Start Date"
                                    value={edu.start_date ?? ""}
                                    readOnly={!isEditing}
                                    onChange={(event) => onCollectionItemChange?.("educations", index, "start_date", event.currentTarget.value)}
                                />
                                <TextInput
                                    label="End Date"
                                    value={edu.end_date ?? ""}
                                    readOnly={!isEditing}
                                    onChange={(event) => onCollectionItemChange?.("educations", index, "end_date", event.currentTarget.value)}
                                />
                            </Group>
                        </Stack>
                    </Paper>
                ))}
            </Stack>

            <Divider />

            <Stack gap="md">
                <Text size="lg" fw={700} c={BROWN}>
                    Projects
                </Text>

                {profile?.projects?.map((project, index) => (
                    <Paper key={project.id} p="md" radius="md" style={sectionStyle}>
                        <Stack gap="sm">
                            <TextInput
                                label="Project Name"
                                value={project.project_name ?? ""}
                                readOnly={!isEditing}
                                onChange={(event) => onCollectionItemChange?.("projects", index, "project_name", event.currentTarget.value)}
                            />

                            <Textarea
                                label="Description"
                                value={project.description ?? ""}
                                autosize
                                readOnly={!isEditing}
                                onChange={(event) => onCollectionItemChange?.("projects", index, "description", event.currentTarget.value)}
                            />
                        </Stack>
                    </Paper>
                ))}
            </Stack>

            <Divider />

            <Stack gap="md">
                <Text size="lg" fw={700} c={BROWN}>
                    Languages
                </Text>

                {profile?.languages?.map((lang, index) => (
                    <Paper key={lang.id} p="md" radius="md" style={sectionStyle}>
                        <Group grow>
                            <TextInput
                                label="Language"
                                value={lang.language_name ?? ""}
                                readOnly={!isEditing}
                                onChange={(event) => onCollectionItemChange?.("languages", index, "language_name", event.currentTarget.value)}
                            />

                            <TextInput
                                label="Proficiency"
                                value={lang.proficiency_level ?? ""}
                                readOnly={!isEditing}
                                onChange={(event) => onCollectionItemChange?.("languages", index, "proficiency_level", event.currentTarget.value)}
                            />
                        </Group>
                    </Paper>
                ))}
            </Stack>

            <Divider />

            <Stack gap="md">
                <Text size="lg" fw={700} c={BROWN}>
                    Certifications
                </Text>

                {profile?.certifications?.length ? (
                    profile.certifications.map((cert, index) => (
                        <Paper key={cert.id} p="md" radius="md" style={sectionStyle}>
                            <Stack gap="sm">
                                <TextInput
                                    label="Certification"
                                    value={cert.certification_name ?? ""}
                                    readOnly={!isEditing}
                                    onChange={(event) => onCollectionItemChange?.("certifications", index, "certification_name", event.currentTarget.value)}
                                />

                                <TextInput
                                    label="Issue Date"
                                    value={cert.issue_date ?? ""}
                                    readOnly={!isEditing}
                                    onChange={(event) => onCollectionItemChange?.("certifications", index, "issue_date", event.currentTarget.value)}
                                />
                            </Stack>
                        </Paper>
                    ))
                ) : (
                    <Paper p="md" radius="md" style={sectionStyle}>
                        <Text size="sm" c="dimmed">
                            No certifications available
                        </Text>
                    </Paper>
                )}
            </Stack>

            {footer && (
                <Group justify="flex-end">
                    {footer}
                </Group>
            )}
        </Stack>
    );
}

export default function CVUploadConfirmation({ cv, onClose, profileId }: Props) {
    const STORAGE_KEY = `cv-upload-confirmation-profile-${profileId ?? cv?.candidate_profile?.id ?? "new"}`;

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }

        return cv?.candidate_profile ?? null;
    });

    useEffect(() => {
        if (profile) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [profile, STORAGE_KEY]);

    const onSubmit = async () => {
        const id = profileId ?? profile?.id;

        if (!id) {
            throw new Error("Profile ID missing");
        }

        setIsSubmitting(true);

        try {
            const response = await CvService.confirmCv({
                profileId: id,
                cv,
            });

            localStorage.removeItem(STORAGE_KEY);
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
                    given_name: profile.given_name,
                    middle_name: profile.middle_name,
                    family_name: profile.family_name,
                    current_title: profile.current_title,
                    email: profile.email,
                    phone: profile.phone,
                    location: profile.location,
                    bio: profile.bio,
                    skills: profile.skills,
                    work_experiences: profile.work_experiences,
                    educations: profile.educations,
                    projects: profile.projects,
                    languages: profile.languages,
                    certifications: profile.certifications,
                },
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            localStorage.removeItem(STORAGE_KEY);
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
            current ? { ...current, [field]: value } : current
        );
    };

    const updateCollectionItem = (
        collection: "work_experiences" | "educations" | "projects" | "languages" | "certifications",
        index: number,
        field: string,
        value: string,
    ) => {
        setProfile((current) => {
            if (!current) return current;

            const nextCollection = [...current[collection]] as unknown as Array<Record<string, unknown>>;

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