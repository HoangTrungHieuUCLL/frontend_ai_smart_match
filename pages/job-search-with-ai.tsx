import { useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Group, Stack, Text, Title, Modal, TextInput } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import JobListing from "../components/JobListing";
import { Job } from "../types";
import JobService from '../services/JobService';
import CVUploadButton from "../components/CVUploadButton";
import { getCvFormErrors, isCvFormValid } from "../utils/cvValidation";

const JOBS_PER_PAGE = 10;
const BROWN = "#774326";

export default function JobSearchWithAIPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [step, setStep] = useState<"form" | "upload">("form");
  const [formData, setFormData] = useState({ familyName: "", middleName: "", givenName: "", email: "" });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const pageCount = Math.max(1, Math.ceil(jobs.length / JOBS_PER_PAGE));
  const formErrors = getCvFormErrors(formData);
  const canContinue = isCvFormValid(formData);
  const currentJobs = useMemo(
    () => jobs.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE),
    [jobs, page]
  );

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await JobService.getAllJobs();
        setJobs(response);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      }
    };

    fetchJobs();
  }, []);

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

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#f7f2ef", padding: "28px 0" }}>
      <Container size="1100px">
        <Group justify="space-between" align="center" style={{ marginBottom: 24 }}>
          <Stack gap={4}>
            <Title order={2} style={{ color: "#623a26", fontWeight: 700 }}>
              Job Search with AI
            </Title>
            <Text color="dimmed" size="sm">
              Browse job listings, save the ones you like, and open the details page for each role.
            </Text>
          </Stack>
          <CVUploadButton onClick={handleOpenModal} />
        </Group>

        <Stack gap="md">
          {currentJobs.map((job) => (
            <JobListing key={job.id} job={job} />
          ))}
        </Stack>

        <Group justify="center" gap="xs" style={{ marginTop: 24 }}>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
            <Button
              key={pageNumber}
              radius="xl"
              size="sm"
              variant={page === pageNumber ? "filled" : "outline"}
              style={
                page === pageNumber
                  ? { backgroundColor: BROWN, borderColor: BROWN }
                  : { borderColor: BROWN, color: BROWN }
              }
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
        </Group>

        <Text color="dimmed" size="xs" style={{ marginTop: 12 }}>
          Page {page} of {pageCount}. Showing up to {JOBS_PER_PAGE} jobs per page.
        </Text>
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
