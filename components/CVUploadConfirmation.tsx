import {
    Divider,
    Group,
    Paper,
    Stack,
    Text,
    TextInput,
    Textarea, Button,
} from "@mantine/core";
import {useState} from "react";
import {CV, Certification, Education, Experience, Language, Profile, Project} from "../types";
import JobService from "../services/JobService";
import CvService from "../services/CvService";

const BROWN = "#774326";

type Score = {
    job_id: number;
    compatability_score: number;
};

interface Props {
    cv: CV,
    onClose: (scores: Score[]) => void
}

export default function CVUploadConfirmation({cv, onClose}: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(cv?.candidate_profile ?? null);

    const sectionStyle = {
        border: "1px solid rgba(119, 67, 38, 0.18)",
        backgroundColor: "#fdf7ef",
    };

    const onSubmit = async () => {
        const response = await JobService.uploadCv(cv);
        const responseJson = await response.json();

        localStorage.setItem("compatabilityScores", JSON.stringify(responseJson));

        onClose(responseJson);
    }

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

            setIsEditing(false);
            await onSubmit();
        } catch (error) {
            console.error("Save CV changes error:", error);
            alert("Could not save CV changes.");
        } finally {
            setIsSaving(false);
        }
    };

    const updateProfileField = <K extends keyof Profile>(field: K, value: Profile[K]) => {
        setProfile((current) => current ? {...current, [field]: value} : current);
    };

    const updateCollectionItem = <
        K extends "work_experiences" | "educations" | "projects" | "languages" | "certifications",
        T extends Profile[K][number],
        F extends keyof T
    >(collection: K, index: number, field: F, value: T[F]) => {
        setProfile((current) => {
            if (!current) return current;

            const nextCollection = [...current[collection]] as T[];
            nextCollection[index] = {...nextCollection[index], [field]: value};

            return {
                ...current,
                [collection]: nextCollection,
            };
        });
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
                            onChange={(event) => updateProfileField("given_name", event.currentTarget.value)}
                        />
                        <TextInput
                            label="Middle Name"
                            value={profile?.middle_name ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) => updateProfileField("middle_name", event.currentTarget.value)}
                        />
                        <TextInput
                            label="Family Name"
                            value={profile?.family_name ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) => updateProfileField("family_name", event.currentTarget.value)}
                        />
                    </Group>

                    <Group grow>
                        <TextInput
                            label="Current Title"
                            value={profile?.current_title ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) => updateProfileField("current_title", event.currentTarget.value)}
                        />
                        <TextInput
                            label="Email"
                            value={profile?.email ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) => updateProfileField("email", event.currentTarget.value)}
                        />
                    </Group>

                    <Group grow>
                        <TextInput
                            label="Phone"
                            value={profile?.phone ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) => updateProfileField("phone", event.currentTarget.value)}
                        />
                        <TextInput
                            label="Location"
                            value={profile?.location ?? ""}
                            readOnly={!isEditing}
                            onChange={(event) => updateProfileField("location", event.currentTarget.value)}
                        />
                    </Group>

                    <Textarea
                        label="Bio"
                        value={profile?.bio ?? ""}
                        autosize
                        readOnly={!isEditing}
                        onChange={(event) => updateProfileField("bio", event.currentTarget.value)}
                    />

                    <TextInput
                        label="Skills"
                        value={profile?.skills ?? ""}
                        readOnly={!isEditing}
                        onChange={(event) => updateProfileField("skills", event.currentTarget.value)}
                    />
                </Stack>
            </Paper>

            <Divider/>

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
                                onChange={(event) => updateCollectionItem<"work_experiences", Experience, "job_title">("work_experiences", index, "job_title", event.currentTarget.value)}
                            />

                            <TextInput
                                label="Company"
                                value={exp.company_name ?? ""}
                                readOnly={!isEditing}
                                onChange={(event) => updateCollectionItem<"work_experiences", Experience, "company_name">("work_experiences", index, "company_name", event.currentTarget.value)}
                            />

                            <Group grow>
                                <TextInput
                                    label="Start Date"
                                    value={exp.start_date ?? ""}
                                    readOnly={!isEditing}
                                    onChange={(event) => updateCollectionItem<"work_experiences", Experience, "start_date">("work_experiences", index, "start_date", event.currentTarget.value)}
                                />
                                <TextInput
                                    label="End Date"
                                    value={exp.end_date ?? ""}
                                    readOnly={!isEditing}
                                    onChange={(event) => updateCollectionItem<"work_experiences", Experience, "end_date">("work_experiences", index, "end_date", event.currentTarget.value)}
                                />
                            </Group>
                        </Stack>
                    </Paper>
                ))}
            </Stack>

            <Divider/>

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
                                onChange={(event) => updateCollectionItem<"educations", Education, "institution">("educations", index, "institution", event.currentTarget.value)}
                            />

                            <TextInput
                                label="Degree"
                                value={edu.degree ?? ""}
                                readOnly={!isEditing}
                                onChange={(event) => updateCollectionItem<"educations", Education, "degree">("educations", index, "degree", event.currentTarget.value)}
                            />

                            <TextInput
                                label="Field of Study"
                                value={edu.field_of_study ?? ""}
                                readOnly={!isEditing}
                                onChange={(event) => updateCollectionItem<"educations", Education, "field_of_study">("educations", index, "field_of_study", event.currentTarget.value)}
                            />

                            <Group grow>
                                <TextInput
                                    label="Start Date"
                                    value={edu.start_date ?? ""}
                                    readOnly={!isEditing}
                                    onChange={(event) => updateCollectionItem<"educations", Education, "start_date">("educations", index, "start_date", event.currentTarget.value)}
                                />
                                <TextInput
                                    label="End Date"
                                    value={edu.end_date ?? ""}
                                    readOnly={!isEditing}
                                    onChange={(event) => updateCollectionItem<"educations", Education, "end_date">("educations", index, "end_date", event.currentTarget.value)}
                                />
                            </Group>
                        </Stack>
                    </Paper>
                ))}
            </Stack>

            <Divider/>

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
                                onChange={(event) => updateCollectionItem<"projects", Project, "project_name">("projects", index, "project_name", event.currentTarget.value)}
                            />

                            <Textarea
                                label="Description"
                                value={project.description ?? ""}
                                autosize
                                readOnly={!isEditing}
                                onChange={(event) => updateCollectionItem<"projects", Project, "description">("projects", index, "description", event.currentTarget.value)}
                            />
                        </Stack>
                    </Paper>
                ))}
            </Stack>

            <Divider/>

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
                                onChange={(event) => updateCollectionItem<"languages", Language, "language_name">("languages", index, "language_name", event.currentTarget.value)}
                            />

                            <TextInput
                                label="Proficiency"
                                value={lang.proficiency_level ?? ""}
                                readOnly={!isEditing}
                                onChange={(event) => updateCollectionItem<"languages", Language, "proficiency_level">("languages", index, "proficiency_level", event.currentTarget.value)}
                            />
                        </Group>
                    </Paper>
                ))}
            </Stack>

            <Divider/>

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
                                    onChange={(event) => updateCollectionItem<"certifications", Certification, "certification_name">("certifications", index, "certification_name", event.currentTarget.value)}
                                />

                                <TextInput
                                    label="Issue Date"
                                    value={cert.issue_date ?? ""}
                                    readOnly={!isEditing}
                                    onChange={(event) => updateCollectionItem<"certifications", Certification, "issue_date">("certifications", index, "issue_date", event.currentTarget.value)}
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

            <Group justify="flex-end">
                {!isEditing && (
                    <Button variant="outline"
                            color={BROWN}
                            onClick={() => setIsEditing(true)}
                    >
                        Edit
                    </Button>
                )}
                <Button color={BROWN}
                        loading={isSaving}
                        onClick={isEditing ? onSaveChanges : onSubmit}
                >
                    {isEditing ? "Save changes" : "Everything looks good!"}
                </Button>
            </Group>
        </Stack>
    );
}
