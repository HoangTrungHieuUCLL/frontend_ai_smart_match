import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import {
    ActionIcon,
    Avatar,
    Badge,
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
import { IconBrandLinkedin, IconCamera, IconCheck, IconEdit, IconLogout, IconPlus, IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";

import CVUploadModal from "../components/CVUploadModal";
import AuthService from "../services/AuthService";
import CvService, { CvConfirmReturn } from "../services/CvService";
import type { CV, Profile } from "../types";
import {
    ensureAccountCreatedAt,
    getAccountCreatedAt,
    getLinkedInAccountMetadata,
    getStoredProfileCv,
    type LinkedInAccountMetadata,
    saveStoredProfileCv,
} from "../utils/profileStorage";

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

const formatDate = (value: string | null) => {
    if (!value) return "Not available";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";

    return new Intl.DateTimeFormat("en", {
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
    const [email, setEmail] = useState("");
    const [accountCreatedAt, setAccountCreatedAt] = useState<string | null>(null);
    const [linkedInMetadata, setLinkedInMetadata] = useState<LinkedInAccountMetadata | null>(null);
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

        const linkedInAccount = getLinkedInAccountMetadata(storedEmail);
        const storedCv = getStoredProfileCv(storedEmail) ?? emptyCv(storedEmail);
        const cvWithLinkedInDefaults = cloneCv(storedCv);

        if (linkedInAccount?.linked && cvWithLinkedInDefaults.candidate_profile) {
            cvWithLinkedInDefaults.candidate_profile.given_name =
                cvWithLinkedInDefaults.candidate_profile.given_name || linkedInAccount.givenName || "";
            cvWithLinkedInDefaults.candidate_profile.family_name =
                cvWithLinkedInDefaults.candidate_profile.family_name || linkedInAccount.familyName || "";
            cvWithLinkedInDefaults.candidate_profile.email =
                cvWithLinkedInDefaults.candidate_profile.email || linkedInAccount.email || storedEmail;
        }

        setEmail(storedEmail);
        setLinkedInMetadata(linkedInAccount);
        setAccountCreatedAt(getAccountCreatedAt(storedEmail) ?? ensureAccountCreatedAt(storedEmail));
        setSavedCv(cvWithLinkedInDefaults);
        setDraftCv(cloneCv(cvWithLinkedInDefaults));
    }, [router]);

    const profile = draftCv?.candidate_profile ?? null;
    const skills = useMemo(() => parseSkills(profile?.skills), [profile?.skills]);
    const fullName = useMemo(() => {
        const parts = [
            profile?.given_name,
            profile?.middle_name,
            profile?.family_name,
        ].filter(Boolean);

        return parts.length ? parts.join(" ") : linkedInMetadata?.fullName || email || "My profile";
    }, [email, linkedInMetadata?.fullName, profile]);

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
                if (Array.isArray(body?.top_10_compatibility_scores)) {
                    saveScoresToStorage(body.top_10_compatibility_scores);
                }
            }

            saveStoredProfileCv(draftCv, email);
            setSavedCv(cloneCv(draftCv));
            setSkillInput("");
            setIsEditing(false);
            notifications.show({
                color: "green",
                message: "Profile updated.",
            });
        } catch (error) {
            console.error("Profile save error:", error);
            notifications.show({
                color: "red",
                message: "Profile could not be updated.",
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
            setPasswordError("New password must be at least 8 characters and include one uppercase letter and one number.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
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
                message: "Password changed.",
            });
            setChangePasswordOpen(false);
            resetPasswordForm();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Current password is incorrect.";
            setPasswordError(message === "INVALID_CURRENT_PASSWORD" ? "Current password is incorrect." : message);
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

    const cvLabel = draftCv?.filename || "click here to upload your CV";

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
                                aria-label="Profile photo"
                                variant="filled"
                                radius="50%"
                                size={220}
                                style={{
                                    backgroundColor: "#f4dfc6",
                                    color: BROWN,
                                    cursor: "pointer",
                                }}
                            >
                                {linkedInMetadata?.picture ? (
                                    <Avatar
                                        src={linkedInMetadata.picture}
                                        alt={fullName}
                                        size={220}
                                        radius="50%"
                                    />
                                ) : (
                                    <IconCamera size={48} />
                                )}
                            </ActionIcon>

                            <Text size="xl" fw={800} c={BROWN}>
                                {fullName}
                            </Text>
                            {linkedInMetadata?.linked && (
                                <Badge
                                    leftSection={<IconBrandLinkedin size={14} />}
                                    rightSection={linkedInMetadata.emailVerified ? <IconCheck size={12} /> : undefined}
                                    color="blue"
                                    variant="filled"
                                    radius="sm"
                                >
                                    LinkedIn linked
                                </Badge>
                            )}
                        </Stack>

                        <Group justify="space-between" align="center">
                            <Stack gap={0}>
                                <Text size="xl" fw={800} c={BROWN}>
                                    My profile
                                </Text>
                                <Text size="sm" c="dimmed">
                                    Manage your name, email, bio, and skills.
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
                                            Cancel
                                        </Button>
                                        <Button
                                            color={BROWN}
                                            loading={isSaving}
                                            onClick={handleSave}
                                        >
                                            Save changes
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        leftSection={<IconEdit size={16} />}
                                        color={BROWN}
                                        onClick={handleEdit}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </Group>
                        </Group>

                        <Paper p="lg" radius="md" style={{ backgroundColor: "#fff", border: "1px solid rgba(119, 67, 38, 0.16)" }}>
                            <Stack gap="lg">
                                <SimpleGrid cols={{ base: 1, sm: 3 }}>
                                    <TextInput
                                        label="Family name"
                                        value={profile?.family_name ?? ""}
                                        readOnly={!isEditing}
                                        onChange={(event) => updateProfileField("family_name", event.currentTarget.value)}
                                    />
                                    <TextInput
                                        label="Middle name"
                                        value={profile?.middle_name ?? ""}
                                        readOnly={!isEditing}
                                        onChange={(event) => updateProfileField("middle_name", event.currentTarget.value)}
                                    />
                                    <TextInput
                                        label="Given name"
                                        value={profile?.given_name ?? ""}
                                        readOnly={!isEditing}
                                        onChange={(event) => updateProfileField("given_name", event.currentTarget.value)}
                                    />
                                </SimpleGrid>

                                <TextInput
                                    label="Email address"
                                    value={profile?.email ?? email}
                                    readOnly={!isEditing}
                                    onChange={(event) => updateProfileField("email", event.currentTarget.value)}
                                />

                                <Textarea
                                    label="Bio"
                                    value={profile?.bio ?? ""}
                                    readOnly={!isEditing}
                                    autosize
                                    minRows={3}
                                    onChange={(event) => updateProfileField("bio", event.currentTarget.value)}
                                />

                                <Stack gap={8}>
                                    <Group gap="sm" align="center">
                                        <Text size="lg" fw={800} c={BROWN}>
                                            My CV
                                        </Text>
                                        <ActionIcon
                                            radius="xl"
                                            size="lg"
                                            aria-label="Upload CV"
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
                                            {draftCv?.filename || "No CV uploaded yet"}
                                        </Text>
                                    </Paper>
                                </Stack>

                                <PillsInput
                                    label="My skills"
                                    description={isEditing ? "Type a skill and press Enter or Tab." : undefined}
                                >
                                    <Pill.Group>
                                        {skills.length === 0 && (
                                            <PillsInput.Field
                                                value=""
                                                placeholder="This field will be autofilled once you have uploaded your CV"
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
                                                placeholder="Add a skill..."
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
                                    Account
                                </Text>

                                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                                    <Paper p="md" radius="sm" style={{ backgroundColor: "#fdf7ef" }}>
                                        <Text size="xs" c="dimmed">
                                            LinkedIn
                                        </Text>
                                        <Group gap="xs">
                                            {linkedInMetadata?.linked ? (
                                                <>
                                                    <IconCheck size={16} color="#0A66C2" />
                                                    <Text fw={700}>Account linked</Text>
                                                </>
                                            ) : (
                                                <Text fw={700}>Not linked</Text>
                                            )}
                                        </Group>
                                    </Paper>
                                    <Paper p="md" radius="sm" style={{ backgroundColor: "#fdf7ef" }}>
                                        <Text size="xs" c="dimmed">
                                            Registered email
                                        </Text>
                                        <Text fw={700}>{email || "Not available"}</Text>
                                    </Paper>
                                    <Paper p="md" radius="sm" style={{ backgroundColor: "#fdf7ef" }}>
                                        <Text size="xs" c="dimmed">
                                            Account creation date
                                        </Text>
                                        <Text fw={700}>{formatDate(accountCreatedAt)}</Text>
                                    </Paper>
                                </SimpleGrid>

                                <Group justify="space-between">
                                    <Button
                                        variant="outline"
                                        color={BROWN}
                                        onClick={() => setChangePasswordOpen(true)}
                                    >
                                        Change password
                                    </Button>
                                    <Button
                                        leftSection={<IconLogout size={16} />}
                                        color={BROWN}
                                        onClick={handleLogout}
                                    >
                                        Log out
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
                title="Change password"
                centered
            >
                <Stack gap="md">
                    <PasswordInput
                        label="Current password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.currentTarget.value)}
                    />
                    <PasswordInput
                        label="New password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.currentTarget.value)}
                    />
                    <PasswordInput
                        label="Confirm new password"
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
                        Save password
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
