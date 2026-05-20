import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Badge, Box, Button, Container, Divider, Group, Paper, Stack, Text, Title, Modal, TextInput } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { Job } from "../../types";
import JobService from "../../services/JobService";
import CVUploadButton from "../../components/CVUploadButton";
import { getCvFormErrors, isCvFormValid } from "../../utils/cvValidation";

const BROWN = "#774326";

const splitLines = (text?: string) => text?.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) ?? [];

export default function JobInfoDetailPage() {
  const router = useRouter();
  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [step, setStep] = useState<"form" | "upload">("form");
  const [formData, setFormData] = useState({ familyName: "", middleName: "", givenName: "", email: "" });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const formErrors = getCvFormErrors(formData);
  const canContinue = isCvFormValid(formData);

  useEffect(() => {
    if (!id) return;

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

    fetchJob();
  }, [id]);

  const handleOpenModal = () => {
    setUploadModalOpen(true);
    setStep("form");
    setFormData({ familyName: "", middleName: "", givenName: "", email: "" });
    setUploadedFile(null);
  };

  const handleCloseModal = () => {
    setUploadModalOpen(false);
    setStep("form");
  };

  const handleFormSubmit = () => {
    if (canContinue) {
      setStep("upload");
    }
  };

  const handleFileDrop = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
        setUploadedFile(file);
        void handleUploadSubmit(file);
      } else if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed");
      } else {
        alert("File size must not exceed 5MB");
      }
    }
  };

  const handleUploadSubmit = async (fileToUpload = uploadedFile) => {
    if (!fileToUpload) {
      alert("Please select a file");
      return;
    }

    try {
      const response = await JobService.uploadCv({
        ...formData,
        cv: fileToUpload,
      });

      if (response.ok) {
        alert("CV uploaded successfully!");
        console.log("CV file uploaded:", fileToUpload.name);
        handleCloseModal();
      } else {
        alert("Failed to upload CV");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading CV");
    }
  };

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
                <Group justify="apart" align="flex-start" wrap="wrap">
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
                      <Text color="dimmed" size="sm">
                        {job.overview}
                      </Text>
                      <Text color="dimmed" size="xs">
                        {job.company_name} • {job.date}
                      </Text>
                    </Stack>
                  </Group>

                  <Group gap="sm" justify="flex-end" wrap="wrap" style={{ flex: "0 1 460px", minWidth: 0 }}>
                    <CVUploadButton onClick={handleOpenModal} style={{ width: 260, flexShrink: 0 }} />
                    <Button
                      radius="xl"
                      size="sm"
                      style={{ minWidth: 78, backgroundColor: BROWN, borderColor: BROWN, flexShrink: 0 }}
                    >
                      Save
                    </Button>
                    <Button
                      radius="xl"
                      variant="outline"
                      size="sm"
                      style={{ minWidth: 82, flexShrink: 0, color: BROWN, borderColor: BROWN }}
                    >
                      Share
                    </Button>
                  </Group>
                </Group>

                <Group gap="xs">
                  <Badge radius="xl" variant="outline" style={{ borderColor: BROWN, color: BROWN }}>
                    {job.location}
                  </Badge>
                  <Badge radius="xl" variant="outline" style={{ borderColor: BROWN, color: BROWN }}>
                    {job.type}
                  </Badge>
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

      <Modal
        opened={uploadModalOpen}
        onClose={handleCloseModal}
        closeButtonProps={{
          icon: (
            <Box
              aria-hidden="true"
              style={{
                position: "relative",
                width: 22,
                height: 22,
                transform: "rotate(45deg)",
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  width: 7,
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor: "#ffffff",
                  transform: "translateX(-50%)",
                }}
              />
              <Box
                style={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  width: "100%",
                  height: 7,
                  borderRadius: 999,
                  backgroundColor: "#ffffff",
                  transform: "translateY(-50%)",
                }}
              />
            </Box>
          ),
          size: 40,
          radius: "xl",
          style: {
            backgroundColor: BROWN,
            color: "#ffffff",
            border: "none",
          },
        }}
        title={
          <Text size="xl" fw={800}>
            {step === "form" ? "Upload your CV" : "Upload your PDF"}
          </Text>
        }
        centered
        size="md"
      >
        {step === "form" ? (
          <Stack gap="md">
            <TextInput
              label="Family name"
              placeholder="Enter your family name"
              radius="md"
              value={formData.familyName}
              error={formData.familyName ? formErrors.familyName : undefined}
              onChange={(e) => setFormData({ ...formData, familyName: e.currentTarget.value })}
            />
            <TextInput
              label="Middle name"
              placeholder="Enter your middle name"
              radius="md"
              value={formData.middleName}
              error={formErrors.middleName}
              onChange={(e) => setFormData({ ...formData, middleName: e.currentTarget.value })}
            />
            <TextInput
              label="Given name"
              placeholder="Enter your given name"
              radius="md"
              value={formData.givenName}
              error={formData.givenName ? formErrors.givenName : undefined}
              onChange={(e) => setFormData({ ...formData, givenName: e.currentTarget.value })}
            />
            <TextInput
              label="Email address"
              placeholder="Enter your email"
              type="email"
              radius="md"
              value={formData.email}
              error={formData.email ? formErrors.email : undefined}
              onChange={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
            />
            <Button
              fullWidth
              radius="md"
              disabled={!canContinue}
              style={{ backgroundColor: BROWN, borderColor: BROWN }}
              onClick={handleFormSubmit}
            >
              Continue
            </Button>
          </Stack>
        ) : (
          <Stack gap="md">
            <Dropzone
              onDrop={handleFileDrop}
              accept={["application/pdf"]}
              maxSize={5 * 1024 * 1024}
              multiple={false}
            >
              <Group justify="center" gap="xl" style={{ minHeight: 220, pointerEvents: "none" }}>
                <Stack gap={0} align="center">
                  <Text size="xl" fw={500}>
                    Drop your PDF here
                  </Text>
                  <Text size="sm" c="dimmed">
                    or click to browse (max 5MB)
                  </Text>
                </Stack>
              </Group>
            </Dropzone>
            {uploadedFile && (
              <Text size="sm" c="green">
                File selected: {uploadedFile.name}
              </Text>
            )}
          </Stack>
        )}
      </Modal>
    </Box>
  );
}
