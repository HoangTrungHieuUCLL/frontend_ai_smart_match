import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
    Badge,
    Box,
    Button,
    Container,
    Divider,
    Group,
    Paper,
    Stack,
    Text,
    Title,
    Modal,
    TextInput,
    RingProgress
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { Job } from "../../types";
import JobService from "../../services/JobService";
import CVUploadButton from "../../components/CVUploadButton";
import { getCvFormErrors, isCvFormValid } from "../../utils/cvValidation";
import CVUploadModal from "../../components/CVUploadModal";

const BROWN = "#774326";

const splitLines = (text?: string) => text?.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) ?? [];

export default function JobInfoDetailPage() {
    const router = useRouter();
    const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [compatabilityScore, setCompatabilityScore] = useState<number | null>(null);

    const fetchJob = async () => {
        setLoading(true);
        try {
            const response = await JobService.getJobById(Number(id));
            setJob(response);
        } catch {
            setJob(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchJob();
    }, [id]);

    if (loading) {
        return (
            <Container size="800px" style={{ padding: "48px 0" }}>
                <Text>Loading job details...</Text>
            </Container>
        );
    }

    if (!job) {
        return (
            <Container size="800px" style={{ padding: "48px 0" }}>
                <Text>Job not found.</Text>
            </Container>
        );
    }

    const responsibilities = splitLines(job.responsibilities);
    const requirements = splitLines(job.requirements);
    const benefits = splitLines(job.offers);
    const notes = splitLines(job.notes);

    const handleModalClose = (score?: number) => {
        setModalOpen(false);

        if (score !== undefined) {
            setCompatabilityScore(score);
        }
    };

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#f7f2ef", padding: "28px 0" }}>
      <Container size="1200px">
        <Paper style={{backgroundColor: "#f7f2ef"}}>
          <Stack gap="lg">
            <Group justify="space-between" align="stretch" wrap="wrap" style={{ marginBottom: 24 }}>
              {[
                {
                  number: "1",
                  title: "Job description",
                  description: job.overview,
                  button: "How much does this job suit me?",
                },
                {
                  number: "2",
                  title: "Your CV uploaded.",
                  description: "The system has your profile and can compare it with job requirements automatically.",
                  button: "Let's ask AI",
                },
                {
                  number: "3",
                  title: "Match score",
                  description: "This job is highly compatible with your profile based on skills and experience.",
                  button: "How compatible am I to this job?",
                },
              ].map((card) => (
                <Paper
                  key={card.number}
                  withBorder
                  radius="xl"
                  p="lg"
                  style={{
                    flex: "1 1 280px",
                    minWidth: 280,
                    backgroundColor: "#ffffff",
                    borderColor: "rgba(119, 67, 38, 0.16)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Stack gap="md">
                    <Group justify="apart" align="center">
                      <Box
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          backgroundColor: BROWN,
                          color: "#ffffff",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 700,
                          paddingTop: 1,
                        }}
                      >
                        {card.number}
                      </Box>
                    </Group>
                    <Stack gap={4}>
                      <Text size="sm" style={{ fontWeight: 700, color: BROWN, textTransform: "uppercase" }}>
                        {card.title}
                      </Text>
                      <Text color="dimmed" size="sm">
                        {card.description}
                      </Text>
                    </Stack>
                  </Stack>
                  <Button radius="xl" style={{ backgroundColor: BROWN, borderColor: BROWN, marginTop: 16 }}>
                    {card.button}
                  </Button>
                </Paper>
              ))}
            </Group>

                        <Paper withBorder radius="xl" p="xl" style={{ backgroundColor: "#ffffff", borderColor: "rgba(119, 67, 38, 0.16)" }}>
                            <Stack gap="lg">
                                <Group justify="apart" align="center" wrap="wrap">
                                    <Group align="center" gap="md" wrap="nowrap" style={{ flex: "1 1 520px", minWidth: 0 }}>
                                        <Box
                                            style={{
                                                width: 128,
                                                height: 128,
                                                minWidth: 128,
                                                borderRadius: 24,
                                                backgroundColor: "#f6f1ee",
                                                display: "grid",
                                                placeItems: "center",
                                                color: BROWN,
                                                fontWeight: 700,
                                                fontSize: 38,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {job.company_name
                                                .split(" ")
                                                .filter(Boolean)
                                                .slice(0, 2)
                                                .map((part) => part[0])
                                                .join("")}
                                        </Box>
                                        <Stack gap={4}>
                                            <Text size="xl" style={{ fontWeight: 700 }}>
                                                {job.position}
                                            </Text>
                                            <Text color="dimmed" size="xs">
                                                {job.company_name} • {job.date}
                                            </Text>

                                            <Group gap="xs" mt="sm">
                                                <Badge radius="lg" size="lg" variant="outline" style={{ borderColor: BROWN, color: BROWN }}>
                                                    {job.location}
                                                </Badge>
                                                <Badge radius="lg" size="lg" variant="outline" style={{ borderColor: BROWN, color: BROWN }}>
                                                    {job.type}
                                                </Badge>
                                            </Group>
                                        </Stack>
                                    </Group>

                                    <Group gap="md">
                                        {compatabilityScore !== null && (
                                            <RingProgress
                                                size={130}
                                                thickness={11}
                                                roundCaps
                                                label={
                                                    <Text
                                                        size="sm"
                                                        ta="center"
                                                        style={{ pointerEvents: 'none' }}
                                                        fw={700}
                                                    >
                                                        {compatabilityScore}% <Text size="xs">match</Text>
                                                    </Text>
                                                }
                                                sections={[
                                                    {
                                                        value: compatabilityScore,
                                                        color: compatabilityScore >= 70 ? '#34C759' : '#FF383C',
                                                    },
                                                ]}
                                            />
                                        )}

                                        <Stack gap="sm" justify="flex-end">
                                            <CVUploadButton onClick={() => setModalOpen(true)} style={{ width: 260, flexShrink: 0 }} />
                                            <Group grow>
                                                <Button
                                                    variant="filled"
                                                    size="sm"
                                                    color={BROWN}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    color={BROWN}
                                                >
                                                    Share
                                                </Button>
                                            </Group>
                                        </Stack>
                                    </Group>
                                </Group>

                                <Divider />

                                <Stack gap="sm">
                                    <Text size="lg" style={{ fontWeight: 700 }}>
                                        Job description
                                    </Text>
                                    <Text color="dimmed" size="sm">
                                        {job.overview}
                                    </Text>

                                    <Text size="sm" style={{ fontWeight: 600 }}>
                                        Key Responsibilities:
                                    </Text>
                                    <Stack gap={4}>
                                        {responsibilities.map((item, index) => (
                                            <Text key={index} color="dimmed" size="sm" component="div">
                                                • {item}
                                            </Text>
                                        ))}
                                    </Stack>

                                    <Text size="sm" style={{ fontWeight: 600 }}>
                                        Candidate Requirements:
                                    </Text>
                                    <Stack gap={4}>
                                        {requirements.map((item, index) => (
                                            <Text key={index} color="dimmed" size="sm" component="div">
                                                • {item}
                                            </Text>
                                        ))}
                                    </Stack>

                                    <Text size="sm" style={{ fontWeight: 600 }}>
                                        Benefits & Compensation:
                                    </Text>
                                    <Stack gap={4}>
                                        {benefits.map((item, index) => (
                                            <Text key={index} color="dimmed" size="sm" component="div">
                                                • {item}
                                            </Text>
                                        ))}
                                    </Stack>

                                    <Text size="sm" style={{ fontWeight: 600 }}>
                                        Notes:
                                    </Text>
                                    <Stack gap={4}>
                                        {notes.map((item, index) => (
                                            <Text key={index} color="dimmed" size="sm" component="div">
                                                • {item}
                                            </Text>
                                        ))}
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Stack>
                </Paper>
            </Container>

            <CVUploadModal
                opened={modalOpen}
                onClose={(scores) => {
                    setModalOpen(false);

                    const match = scores?.find(
                        (s) => s.job_id === job.id
                    );

                    setCompatabilityScore(
                        match?.compatability_score ?? null
                    );
                }}
            />
        </Box>
    );
}