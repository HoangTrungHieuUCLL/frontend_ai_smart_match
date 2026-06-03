import {
    Divider,
    Group,
    Paper,
    Stack,
    Text,
    TextInput,
    Textarea, Button,
} from "@mantine/core";
import { ReactNode } from "react";
import {CV} from "../types";
import CvService, { CvConfirmReturn } from "../services/CvService";

const BROWN = "#774326";

interface Props {
    cv: CV;
    onClose: (scores: CvConfirmReturn[]) => void;
    profileId: number | null;
}

interface CVSummaryDetailsProps {
    cv: CV;
    footer?: ReactNode;
}

export function CVSummaryDetails({cv, footer}: CVSummaryDetailsProps) {
    const profile = cv?.candidate_profile;

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
                            readOnly
                        />
                        <TextInput
                            label="Middle Name"
                            value={profile?.middle_name ?? ""}
                            readOnly
                        />
                        <TextInput
                            label="Family Name"
                            value={profile?.family_name ?? ""}
                            readOnly
                        />
                    </Group>

                    <Group grow>
                        <TextInput
                            label="Current Title"
                            value={profile?.current_title ?? ""}
                            readOnly
                        />
                        <TextInput
                            label="Email"
                            value={profile?.email ?? ""}
                            readOnly
                        />
                    </Group>

                    <Group grow>
                        <TextInput
                            label="Phone"
                            value={profile?.phone ?? ""}
                            readOnly
                        />
                        <TextInput
                            label="Location"
                            value={profile?.location ?? ""}
                            readOnly
                        />
                    </Group>

                    <Textarea
                        label="Bio"
                        value={profile?.bio ?? ""}
                        autosize
                        readOnly
                    />

                    <TextInput
                        label="Skills"
                        value={profile?.skills ?? ""}
                        readOnly
                    />
                </Stack>
            </Paper>

            <Divider/>

            <Stack gap="md">
                <Text size="lg" fw={700} c={BROWN}>
                    Work Experience
                </Text>

                {profile?.work_experiences?.map((exp) => (
                    <Paper key={exp.id} p="md" radius="md" style={sectionStyle}>
                        <Stack gap="sm">
                            <TextInput
                                label="Job Title"
                                value={exp.job_title ?? ""}
                                readOnly
                            />

                            <TextInput
                                label="Company"
                                value={exp.company_name ?? ""}
                                readOnly
                            />

                            <Group grow>
                                <TextInput
                                    label="Start Date"
                                    value={exp.start_date ?? ""}
                                    readOnly
                                />
                                <TextInput
                                    label="End Date"
                                    value={exp.end_date ?? ""}
                                    readOnly
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

                {profile?.educations?.map((edu) => (
                    <Paper key={edu.id} p="md" radius="md" style={sectionStyle}>
                        <Stack gap="sm">
                            <TextInput
                                label="Institution"
                                value={edu.institution ?? ""}
                                readOnly
                            />

                            <TextInput
                                label="Degree"
                                value={edu.degree ?? ""}
                                readOnly
                            />

                            <TextInput
                                label="Field of Study"
                                value={edu.field_of_study ?? ""}
                                readOnly
                            />

                            <Group grow>
                                <TextInput
                                    label="Start Date"
                                    value={edu.start_date ?? ""}
                                    readOnly
                                />
                                <TextInput
                                    label="End Date"
                                    value={edu.end_date ?? ""}
                                    readOnly
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

                {profile?.projects?.map((project) => (
                    <Paper key={project.id} p="md" radius="md" style={sectionStyle}>
                        <Stack gap="sm">
                            <TextInput
                                label="Project Name"
                                value={project.project_name ?? ""}
                                readOnly
                            />

                            <Textarea
                                label="Description"
                                value={project.description ?? ""}
                                autosize
                                readOnly
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

                {profile?.languages?.map((lang) => (
                    <Paper key={lang.id} p="md" radius="md" style={sectionStyle}>
                        <Group grow>
                            <TextInput
                                label="Language"
                                value={lang.language_name ?? ""}
                                readOnly
                            />

                            <TextInput
                                label="Proficiency"
                                value={lang.proficiency_level ?? ""}
                                readOnly
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
                    profile.certifications.map((cert) => (
                        <Paper key={cert.id} p="md" radius="md" style={sectionStyle}>
                            <Stack gap="sm">
                                <TextInput
                                    label="Certification"
                                    value={cert.certification_name ?? ""}
                                    readOnly
                                />

                                <TextInput
                                    label="Issue Date"
                                    value={cert.issue_date ?? ""}
                                    readOnly
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

export default function CVUploadConfirmation({cv, onClose, profileId}: Props) {
    const onSubmit = async () => {
        if (!profileId) {
            throw new Error("Profile ID missing");
        }

        const response = await CvService.confirmCv({
            profileId,
            cv
        });
        console.log(response);

        const scores = response?.jobs ?? [];

        onClose(scores);
    };

    return (
        <CVSummaryDetails
            cv={cv}
            footer={
                <Button color={BROWN} onClick={onSubmit}>
                    Everything looks good!
                </Button>
            }
        />
    );
}
