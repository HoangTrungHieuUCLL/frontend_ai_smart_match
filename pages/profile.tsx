import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import {
    ActionIcon,
    Box,
    Button,
    Container,
    Group,
    Modal,
    Paper,
    PasswordInput,
    Pill,
    PillsInput,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCamera, IconEdit, IconLogout, IconPlus, IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";

import CVUploadModal from "../components/CVUploadModal";
import AuthService from "../services/AuthService";
import CvService, { CvConfirmReturn } from "../services/CvService";
import type { CV, Profile } from "../types";
import {
    ensureAccountCreatedAt,
    getAccountCreatedAt,
    getStoredProfileCv,
    saveStoredProfileCv,
} from "../utils/profileStorage";
import { useTranslation } from "../contexts/I18nContext";

const BROWN = "#774326";
const SCORE_STORAGE_KEY = "jobScores";

const emptyProfile = (email: string): Profile => ({
    id: 0,
    cv_id: null,
    given_name: "",
    middle_name: "",
    family_name: "",
    current_title: "",
    skills: "",
    phone: "",
    location: "",
    email,
    bio: "",
    work_experiences: [],
    educations: [],
    projects: [],
    languages: [],
    certifications: [],
    compatibility_scores: [],
});

const emptyCv = (email: string): CV => ({
    id: 0,
    filename: "",
    uploaded_at: new Date().toISOString(),
    candidate_profile: emptyProfile(email),
    compatibility_scores: [],
});

const cloneCv = (cv: CV): CV => JSON.parse(JSON.stringify(cv));

const parseSkills = (value?: string | null) =>
    (value ?? "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

const serializeSkills = (skills: string[]) =>
    skills.map((skill) => skill.trim()).filter(Boolean).join(", ");

const formatDate = (value: string | null, locale: string, notAvailableLabel: string) => {
    if (!value) return notAvailableLabel;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return notAvailableLabel;

    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
};

const passwordMeetsRequirements = (password: string) =>
    password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);

const saveScoresToStorage = (results: CvConfirmReturn[]) => {
    const existing: CvConfirmReturn[] = JSON.parse(sessionStorage.getItem(SCORE_STORAGE_KEY) ?? "[]");
    const merged = new Map(existing.map((r) => [r.job_id, r.compatibility_score]));
    results.forEach((r) => merged.set(r.job_id, r.compatibility_score));
    sessionStorage.setItem(
        SCORE_STORAGE_KEY,
        JSON.stringify(Array.from(merged.entries()).map(([job_id, compatibility_score]) => ({ job_id, compatibility_score }))),
    );
};

export default function ProfilePage() {
    const router = useRouter();
    const { t, language } = useTranslation();
    const [email, setEmail] = useState("");
    const [accountCreatedAt, setAccountCreatedAt] = useState<string | null>(null);
    const [savedCv, setSavedCv] = useState<CV | null>(null);
    const [draftCv, setDraftCv] = useState<CV | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [skillInput, setSkillInput] = useState("");
    const [cvUploadOpen, setCvUploadOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const storedEmail = localStorage.getItem("email") ?? "";

        if (!token) {
            router.replace("/");
            return;
        }

        const storedCv = cloneCv(getStoredProfileCv(storedEmail) ?? emptyCv(storedEmail));

        setEmail(storedEmail);
        setAccountCreatedAt(getAccountCreatedAt(storedEmail) ?? ensureAccountCreatedAt(storedEmail));
        setSavedCv(storedCv);
        setDraftCv(cloneCv(storedCv));
    }, [router]);

    const profile = draftCv?.candidate_profile ?? null;
    const skills = useMemo(() => parseSkills(profile?.skills), [profile?.skills]);
    const fullName = useMemo(() => {
        const parts = [
            profile?.given_name,
            profile?.middle_name,
            profile?.family_name,
        ].filter(Boolean);

        return parts.length ? parts.join(" ") : email || t("profile.title");
    }, [email, profile, t]);

    const updateProfile = (updater: (profile: Profile) => Profile) => {
        setDraftCv((current) => {
            if (!current?.candidate_profile) return current;

            return {
                ...current,
                candidate_profile: updater(current.candidate_profile),
            };
        });
    };

    const updateProfileField = (field: keyof Profile, value: string) => {
        updateProfile((current) => ({ ...current, [field]: value }));
    };

    const setSkills = (nextSkills: string[]) => {
        updateProfileField("skills", serializeSkills(nextSkills));
    };

    const addSkill = () => {
        const nextSkill = skillInput.trim();
        setSkillInput("");

        if (!nextSkill) return;
        if (skills.some((skill) => skill.toLowerCase() === nextSkill.toLowerCase())) return;

        setSkills([...skills, nextSkill]);
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter((skill) => skill.toLowerCase() !== skillToRemove.toLowerCase()));
    };

    const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === "Tab") {
            event.preventDefault();
            addSkill();
        }

        if (event.key === "Backspace" && !skillInput.trim() && skills.length > 0) {
            event.preventDefault();
            removeSkill(skills[skills.length - 1]);
        }
    };

    const handleEdit = () => {
        if (savedCv) setDraftCv(cloneCv(savedCv));
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (savedCv) setDraftCv(cloneCv(savedCv));
        setSkillInput("");
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!draftCv?.candidate_profile) return;

        setIsSaving(true);
        try {
            if (draftCv.candidate_profile.id) {
                const response = await CvService.updateExtractedData(
                    draftCv.candidate_profile.id,
                    {
                        candidate_profile: {
                            given_name: draftCv.candidate_profile.given_name,
                            middle_name: draftCv.candidate_profile.middle_name,
                            family_name: draftCv.candidate_profile.family_name,
                            email: draftCv.candidate_profile.email,
                            bio: draftCv.candidate_profile.bio,
                            skills: draftCv.candidate_profile.skills ?? "",
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const body = await response.json();
                if (Array.isArray(body?.compatibility_scores)) {
                    saveScoresToStorage(body.compatibility_scores);
                }
            }

            saveStoredProfileCv(draftCv, email);
            setSavedCv(cloneCv(draftCv));
            setSkillInput("");
            setIsEditing(false);
            notifications.show({
                color: "green",
                message: t("profile.profileUpdated"),
            });
        } catch (error) {
            console.error("Profile save error:", error);
            notifications.show({
                color: "red",
                message: t("profile.profileUpdateFailed"),
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("email");
        window.dispatchEvent(new Event("auth-change"));
        await router.push("/");
    };

    const resetPasswordForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
    };

    const handleChangePassword = async () => {
        setPasswordError("");

        if (!passwordMeetsRequirements(newPassword)) {
            setPasswordError(t("profile.passwordRequirementsError"));
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(t("profile.newPasswordsDoNotMatch"));
            return;
        }

        setIsChangingPassword(true);
        try {
            await AuthService.changePassword({
                currentPassword,
                newPassword,
            });
            notifications.show({
                color: "green",
                message: t("profile.passwordChanged"),
            });
            setChangePasswordOpen(false);
            resetPasswordForm();
        } catch (error) {
            const message = error instanceof Error ? error.message : t("profile.currentPasswordIncorrect");
            setPasswordError(message === "INVALID_CURRENT_PASSWORD" ? t("profile.currentPasswordIncorrect") : message);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const refreshProfileFromStorage = () => {
        const storedCv = getStoredProfileCv(email);
        if (!storedCv) return;

        setSavedCv(storedCv);
        setDraftCv(cloneCv(storedCv));
        setEmail(storedCv.candidate_profile?.email ?? email);
        setIsEditing(false);
        setSkillInput("");
    };

    const cvLabel = draftCv?.filename || t("profile.clickToUpload");

    return (
        <Box style={{ minHeight: "100vh", backgroundColor: "#f7f2ef", padding: "32px 0" }}>
            <Container size="1040px">
                <Paper
                    p={{ base: "lg", md: 42 }}
                    radius="md"
                    style={{
                        backgroundColor: "#f5f1ee",
                        border: "1px solid rgba(119, 67, 38, 0.12)",
                    }}
                >
                    <Stack gap={34}>
                        <Stack align="center" gap="sm">
                            <ActionIcon
                                component="button"
                                type="button"
                                aria-label={t("profile.photoAlt")}
                                variant="filled"
                                radius="50%"
                                size={220}
                                style={{
                                    backgroundColor: "#f4dfc6",
                                    color: BROWN,
                                    cursor: "pointer",
                                }}
                            >
                                <IconCamera size={48} />
                            </ActionIcon>

                            <Text size="xl" fw={800} c={BROWN}>
                                {fullName}
                            </Text>
                        </Stack>

                        <Group justify="space-between" align="center">
                            <Stack gap={0}>
                                <Text size="xl" fw={800} c={BROWN}>
                                    {t("profile.title")}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    {t("profile.subtitle")}
                                </Text>
                            </Stack>

                            <Group gap="sm">
                                {isEditing ? (
                                    <>
                                        <Button
                                            leftSection={<IconX size={16} />}
                                            variant="outline"
                                            color={BROWN}
                                            onClick={handleCancel}
                                            disabled={isSaving}
                                        >
                                            {t("common.cancel")}
                                        </Button>
                                        <Button
                                            color={BROWN}
                                            loading={isSaving}
                                            onClick={handleSave}
                                        >
                                            {t("addJob.saveChanges")}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        leftSection={<IconEdit size={16} />}
                                        color={BROWN}
                                        onClick={handleEdit}
                                    >
                                        {t("common.edit")}
                                    </Button>
                                )}
                            </Group>
                        </Group>

                        <Paper p="lg" radius="md" style={{ backgroundColor: "#fff", border: "1px solid rgba(119, 67, 38, 0.16)" }}>
                            <Stack gap="lg">
                                <SimpleGrid cols={{ base: 1, sm: 3 }}>
                                    <TextInput
                                        label={t("profile.familyName")}
                                        value={profile?.family_name ?? ""}
                                        readOnly={!isEditing}
                                        onChange={(event) => updateProfileField("family_name", event.currentTarget.value)}
                                    />
                                    <TextInput
                                        label={t("profile.middleName")}
                                        value={profile?.middle_name ?? ""}
                                        readOnly={!isEditing}
                                        onChange={(event) => updateProfileField("middle_name", event.currentTarget.value)}
                                    />
                                    <TextInput
                                        label={t("profile.givenName")}
                                        value={profile?.given_name ?? ""}
                                        readOnly={!isEditing}
                                        onChange={(event) => updateProfileField("given_name", event.currentTarget.value)}
                                    />
                                </SimpleGrid>

                                <TextInput
                                    label={t("profile.emailAddress")}
                                    value={profile?.email ?? email}
                                    readOnly={!isEditing}
                                    onChange={(event) => updateProfileField("email", event.currentTarget.value)}
                                />

                                <Textarea
                                    label={t("profile.bio")}
                                    value={profile?.bio ?? ""}
                                    readOnly={!isEditing}
                                    autosize
                                    minRows={3}
                                    onChange={(event) => updateProfileField("bio", event.currentTarget.value)}
                                />

                                <Stack gap={8}>
                                    <Group gap="sm" align="center">
                                        <Text size="lg" fw={800} c={BROWN}>
                                            {t("profile.myCv")}
                                        </Text>
                                        <ActionIcon
                                            radius="xl"
                                            size="lg"
                                            aria-label={t("profile.uploadCv")}
                                            style={{ backgroundColor: BROWN, color: "#ffffff" }}
                                            onClick={() => setCvUploadOpen(true)}
                                        >
                                            <IconPlus size={22} />
                                        </ActionIcon>
                                        <Text
                                            component="button"
                                            type="button"
                                            c={draftCv?.filename ? BROWN : "dimmed"}
                                            fs={draftCv?.filename ? "normal" : "italic"}
                                            style={{
                                                border: 0,
                                                background: "transparent",
                                                cursor: "pointer",
                                                padding: 0,
                                            }}
                                            onClick={() => setCvUploadOpen(true)}
                                        >
                                            {cvLabel}
                                        </Text>
                                    </Group>

                                    <Paper
                                        component="button"
                                        type="button"
                                        radius="md"
                                        p="md"
                                        style={{
                                            minHeight: 58,
                                            width: "100%",
                                            border: "none",
                                            backgroundColor: "#ffffff",
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}
                                        onClick={() => setCvUploadOpen(true)}
                                    >
                                        <Text c={draftCv?.filename ? BROWN : "dimmed"} fs={draftCv?.filename ? "normal" : "italic"}>
                                            {draftCv?.filename || t("profile.noCvUploaded")}
                                        </Text>
                                    </Paper>
                                </Stack>

                                <PillsInput
                                    label={t("profile.mySkills")}
                                    description={isEditing ? t("profile.skillsHint") : undefined}
                                >
                                    <Pill.Group>
                                        {skills.length === 0 && (
                                            <PillsInput.Field
                                                value=""
                                                placeholder={t("profile.skillsAutofillHint")}
                                                readOnly
                                            />
                                        )}

                                        {skills.map((skill) => (
                                            <Pill
                                                key={skill}
                                                withRemoveButton={isEditing}
                                                onRemove={() => removeSkill(skill)}
                                            >
                                                {skill}
                                            </Pill>
                                        ))}

                                        {isEditing && (
                                            <PillsInput.Field
                                                value={skillInput}
                                                placeholder={t("profile.addSkillPlaceholder")}
                                                onChange={(event) => setSkillInput(event.currentTarget.value)}
                                                onKeyDown={handleSkillKeyDown}
                                                onBlur={addSkill}
                                            />
                                        )}
                                    </Pill.Group>
                                </PillsInput>
                            </Stack>
                        </Paper>

                        <Paper
                            p="lg"
                            radius="md"
                            style={{
                                backgroundColor: "#fff",
                                border: "1px solid rgba(119, 67, 38, 0.16)",
                            }}
                        >
                            <Stack gap="md">
                                <Text size="lg" fw={800} c={BROWN}>
                                    {t("profile.account")}
                                </Text>

                                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                                    <Paper p="md" radius="sm" style={{ backgroundColor: "#fdf7ef" }}>
                                        <Text size="xs" c="dimmed">
                                            {t("profile.registeredEmail")}
                                        </Text>
                                        <Text fw={700}>{email || t("profile.notAvailable")}</Text>
                                    </Paper>
                                    <Paper p="md" radius="sm" style={{ backgroundColor: "#fdf7ef" }}>
                                        <Text size="xs" c="dimmed">
                                            {t("profile.accountCreationDate")}
                                        </Text>
                                        <Text fw={700}>
                                            {formatDate(accountCreatedAt, language === "VN" ? "vi" : "en", t("profile.notAvailable"))}
                                        </Text>
                                    </Paper>
                                </SimpleGrid>

                                <Group justify="space-between">
                                    <Button
                                        variant="outline"
                                        color={BROWN}
                                        onClick={() => setChangePasswordOpen(true)}
                                    >
                                        {t("profile.changePassword")}
                                    </Button>
                                    <Button
                                        leftSection={<IconLogout size={16} />}
                                        color={BROWN}
                                        onClick={handleLogout}
                                    >
                                        {t("profile.logOut")}
                                    </Button>
                                </Group>
                            </Stack>
                        </Paper>
                    </Stack>
                </Paper>
            </Container>

            <Modal
                opened={changePasswordOpen}
                onClose={() => {
                    setChangePasswordOpen(false);
                    resetPasswordForm();
                }}
                title={t("profile.changePassword")}
                centered
            >
                <Stack gap="md">
                    <PasswordInput
                        label={t("profile.currentPassword")}
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.currentTarget.value)}
                    />
                    <PasswordInput
                        label={t("profile.newPassword")}
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.currentTarget.value)}
                    />
                    <PasswordInput
                        label={t("profile.confirmNewPassword")}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                    />

                    {passwordError && (
                        <Text c="red" size="sm">
                            {passwordError}
                        </Text>
                    )}

                    <Button
                        color={BROWN}
                        loading={isChangingPassword}
                        onClick={handleChangePassword}
                    >
                        {t("profile.savePassword")}
                    </Button>
                </Stack>
            </Modal>

            <CVUploadModal
                opened={cvUploadOpen}
                onClose={(results) => {
                    setCvUploadOpen(false);

                    if (results?.length) {
                        saveScoresToStorage(results);
                    }

                    refreshProfileFromStorage();
                }}
            />
        </Box>
    );
}
