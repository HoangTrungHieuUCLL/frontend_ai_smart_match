import { useState } from "react";
import { Button, Group, Select, SegmentedControl, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "../contexts/I18nContext";

const BROWN = "#774326";

type Path = "candidate" | "business";

export default function ConsultationForm() {
  const { t } = useTranslation();
  const [path, setPath] = useState<Path>("candidate");
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [candidate, setCandidate] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentProfession: "",
    desiredProfession: "",
    desiredLevel: "",
  });

  const [business, setBusiness] = useState({
    companyName: "",
    industry: "",
    companySize: "",
    serviceInterest: "",
    needsDescription: "",
  });

  const handleSubmit = () => {
    notifications.show({
      color: "green",
      title: t("contact.submitSuccess"),
      message: "",
    });

    setCvFile(null);
    setCandidate({
      fullName: "",
      email: "",
      phone: "",
      currentProfession: "",
      desiredProfession: "",
      desiredLevel: "",
    });
    setBusiness({
      companyName: "",
      industry: "",
      companySize: "",
      serviceInterest: "",
      needsDescription: "",
    });
  };

  return (
    <Stack gap="lg">
      <SegmentedControl
        value={path}
        onChange={(value) => setPath(value as Path)}
        color="brown"
        data={[
          { label: t("contact.candidate.heading"), value: "candidate" },
          { label: t("contact.business.heading"), value: "business" },
        ]}
      />

      {path === "candidate" ? (
        <Stack gap="md">
          <TextInput
            required
            label={t("contact.candidate.fullName")}
            value={candidate.fullName}
            onChange={(e) => setCandidate({ ...candidate, fullName: e.currentTarget.value })}
          />
          <Group grow>
            <TextInput
              required
              type="email"
              label={t("contact.candidate.email")}
              value={candidate.email}
              onChange={(e) => setCandidate({ ...candidate, email: e.currentTarget.value })}
            />
            <TextInput
              required
              label={t("contact.candidate.phone")}
              value={candidate.phone}
              onChange={(e) => setCandidate({ ...candidate, phone: e.currentTarget.value })}
            />
          </Group>
          <Group grow>
            <TextInput
              required
              label={t("contact.candidate.currentProfession")}
              value={candidate.currentProfession}
              onChange={(e) => setCandidate({ ...candidate, currentProfession: e.currentTarget.value })}
            />
            <TextInput
              required
              label={t("contact.candidate.desiredProfession")}
              value={candidate.desiredProfession}
              onChange={(e) => setCandidate({ ...candidate, desiredProfession: e.currentTarget.value })}
            />
          </Group>
          <TextInput
            required
            label={t("contact.candidate.desiredLevel")}
            value={candidate.desiredLevel}
            onChange={(e) => setCandidate({ ...candidate, desiredLevel: e.currentTarget.value })}
          />

          <Stack gap={6}>
            <Text size="sm" fw={500}>
              {t("contact.candidate.cvUpload")} <Text component="span" c="red">*</Text>
            </Text>
            <Dropzone
              onDrop={(files) => setCvFile(files[0] ?? null)}
              accept={["application/pdf"]}
              maxSize={5 * 1024 * 1024}
              multiple={false}
            >
              <Group justify="center" style={{ minHeight: 120 }}>
                <Text size="sm" c={cvFile ? "green" : "dimmed"}>
                  {cvFile ? cvFile.name : t("upload.dropPdf")}
                </Text>
              </Group>
            </Dropzone>
          </Stack>

          <Text size="xs" c="dimmed">
            {t("contact.consentNotice")}
          </Text>

          <Button
            radius="xl"
            style={{ backgroundColor: BROWN, alignSelf: "flex-start" }}
            onClick={handleSubmit}
          >
            {t("contact.candidate.submit")}
          </Button>
        </Stack>
      ) : (
        <Stack gap="md">
          <Group grow>
            <TextInput
              required
              label={t("contact.business.companyName")}
              value={business.companyName}
              onChange={(e) => setBusiness({ ...business, companyName: e.currentTarget.value })}
            />
            <TextInput
              required
              label={t("contact.business.industry")}
              value={business.industry}
              onChange={(e) => setBusiness({ ...business, industry: e.currentTarget.value })}
            />
          </Group>
          <TextInput
            required
            label={t("contact.business.companySize")}
            value={business.companySize}
            onChange={(e) => setBusiness({ ...business, companySize: e.currentTarget.value })}
          />
          <Select
            required
            label={t("contact.business.serviceInterest")}
            value={business.serviceInterest}
            onChange={(value) => setBusiness({ ...business, serviceInterest: value ?? "" })}
            data={[
              { value: "hr", label: t("services.hr.title") },
              { value: "legal", label: t("services.legal.title") },
              { value: "finance", label: t("services.finance.title") },
            ]}
          />
          <Textarea
            required
            minRows={3}
            label={t("contact.business.needsDescription")}
            value={business.needsDescription}
            onChange={(e) => setBusiness({ ...business, needsDescription: e.currentTarget.value })}
          />

          <Text size="xs" c="dimmed">
            {t("contact.consentNotice")}
          </Text>

          <Button
            radius="xl"
            style={{ backgroundColor: BROWN, alignSelf: "flex-start" }}
            onClick={handleSubmit}
          >
            {t("contact.business.submit")}
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
