import {
    Divider,
    Group,
    Paper,
    Stack,
    TextInput,
    Textarea,
    Title
} from "@mantine/core";
import {useEffect, useState} from "react";
import {CV} from "../types";
import CvService from "../services/CvService";

export default function Test() {
    const [cv, setCv] = useState<CV | null>(null);

    useEffect(() => {
        const fetchCv = async () => {
            const cvJson = await CvService.getTestCv();
            setCv(cvJson);

            console.log(cvJson);
        };

        fetchCv();
    }, []);

    const profile = cv?.candidate_profile;

    return (
        <Stack align="center" m="auto" w="80%">
            <Title order={2}>Candidate Profile</Title>

            {/* Basic Info */}
            <Group grow w="100%">
                <TextInput
                    label="Given Name"
                    value={profile?.given_name ?? ""}
                    disabled
                />

                <TextInput
                    label="Middle Name"
                    value={profile?.middle_name ?? ""}
                    disabled
                />

                <TextInput
                    label="Family Name"
                    value={profile?.family_name ?? ""}
                    disabled
                />
            </Group>

            <Group grow w="100%">
                <TextInput
                    label="Current Title"
                    value={profile?.current_title ?? ""}
                    disabled
                />

                <TextInput
                    label="Email"
                    value={profile?.email ?? ""}
                    disabled
                />
            </Group>

            <Group grow w="100%">
                <TextInput
                    label="Phone"
                    value={profile?.phone ?? ""}
                    disabled
                />

                <TextInput
                    label="Location"
                    value={profile?.location ?? ""}
                    disabled
                />
            </Group>

            <Textarea
                label="Bio"
                value={profile?.bio ?? ""}
                autosize
                disabled
                w="100%"
            />

            <TextInput
                label="Skills"
                value={profile?.skills ?? ""}
                disabled
                w="100%"
            />

            <Divider w="100%" />

            {/* Work Experience */}
            <Title order={3}>Work Experience</Title>

            {profile?.work_experiences && (
                <>
                    {profile?.work_experiences.map((exp) => (
                        <Paper key={exp.id} withBorder p="md" w="100%">
                            <Stack>
                                <TextInput
                                    label="Job Title"
                                    value={exp.job_title ?? ""}
                                    disabled
                                />

                                <TextInput
                                    label="Company"
                                    value={exp.company_name ?? ""}
                                    disabled
                                />

                                <Group grow>
                                    <TextInput
                                        label="Start Date"
                                        value={exp.start_date ?? ""}
                                        disabled
                                    />

                                    <TextInput
                                        label="End Date"
                                        value={exp.end_date ?? ""}
                                        disabled
                                    />
                                </Group>
                            </Stack>
                        </Paper>
                    ))}
                </>
            )}

            <Divider w="100%" />

            {/* Education */}
            <Title order={3}>Education</Title>

            {profile?.educations && (
                <>
                    {profile?.educations.map((edu) => (
                        <Paper key={edu.id} withBorder p="md" w="100%">
                            <Stack>
                                <TextInput
                                    label="Institution"
                                    value={edu.institution ?? ""}
                                    disabled
                                />

                                <TextInput
                                    label="Degree"
                                    value={edu.degree ?? ""}
                                    disabled
                                />

                                <TextInput
                                    label="Field of Study"
                                    value={edu.field_of_study ?? ""}
                                    disabled
                                />

                                <Group grow>
                                    <TextInput
                                        label="Start Date"
                                        value={edu.start_date ?? ""}
                                        disabled
                                    />

                                    <TextInput
                                        label="End Date"
                                        value={edu.end_date ?? ""}
                                        disabled
                                    />
                                </Group>
                            </Stack>
                        </Paper>
                    ))}
                </>
            )}

            <Divider w="100%" />

            {/* Projects */}
            <Title order={3}>Projects</Title>

            {profile?.projects && (
                <>
                    {profile?.projects.map((project) => (
                        <Paper key={project.id} withBorder p="md" w="100%">
                            <Stack>
                                <TextInput
                                    label="Project Name"
                                    value={project.project_name ?? ""}
                                    disabled
                                />

                                <Textarea
                                    label="Description"
                                    value={project.description ?? ""}
                                    autosize
                                    disabled
                                />
                            </Stack>
                        </Paper>
                    ))}
                </>
            )}

            <Divider w="100%" />

            {/* Languages */}
            <Title order={3}>Languages</Title>

            {profile?.languages && (
                <>
                    {profile?.languages.map((lang) => (
                        <Paper key={lang.id} withBorder p="md" w="100%">
                            <Group grow>
                                <TextInput
                                    label="Language"
                                    value={lang.language_name ?? ""}
                                    disabled
                                />

                                <TextInput
                                    label="Proficiency"
                                    value={lang.proficiency_level ?? ""}
                                    disabled
                                />
                            </Group>
                        </Paper>
                    ))}
                </>
            )}

            <Divider w="100%" />

            {/* Certifications */}
            <Title order={3}>Certifications</Title>

            {profile?.certifications && profile.certifications.length ? (
                profile.certifications.map((cert) => (
                    <Paper key={cert.id} withBorder p="md" w="100%">
                        <Stack>
                            <TextInput
                                label="Certification"
                                value={cert.certification_name ?? ""}
                                disabled
                            />

                            <TextInput
                                label="Issue Date"
                                value={cert.issue_date ?? ""}
                                disabled
                            />
                        </Stack>
                    </Paper>
                ))
            ) : (
                <TextInput
                    value="No certifications"
                    disabled
                    w="100%"
                />
            )}
        </Stack>
    );
}