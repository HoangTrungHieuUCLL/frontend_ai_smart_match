import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Job } from "../types";
import {
    Badge,
    Box,
    Button,
    Group,
    Paper,
    Stack,
    Text,
    RingProgress
} from "@mantine/core";
import { useTranslation } from "../contexts/I18nContext";
import { notifications } from "@mantine/notifications";
// import { isJobSaved, saveJob, removeJob } from "../utils/savedJobs";
import ProfileService from "../services/ProfileService";
import {
    addGuestSavedJob,
    removeGuestSavedJob,
} from "../utils/savedJobs";
import { getGuestSavedJobs } from "../utils/savedJobs";
interface Props {
    job: Job;
    onShare?: (jobId: number) => void;
}

const BROWN = "#774326";
const getInitials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();

const JobListing: React.FC<Props> = ({ job, onShare }) => {
    const router = useRouter();
    const { t } = useTranslation();

    const [saved, setSaved] = useState(false);

    const profileId =
        typeof window !== "undefined"
            ? Number(localStorage.getItem("profile_id"))
            : null;

    useEffect(() => {
        const fetchSaved = async () => {
            const profileId = localStorage.getItem("profile_id");

            // GUEST
            if (!profileId) {
                const guestSaved = getGuestSavedJobs();
                setSaved(guestSaved.map(Number).includes(job.id));
                return;
            }

            // LOGGED IN
            const savedJobs = await ProfileService.getSavedJobs(Number(profileId));
            setSaved(savedJobs.includes(job.id));
        };

        fetchSaved();
    }, [job.id]);
    const handleLearnMore = async (jobId: number) => {
        try {
            await router.push({ pathname: `/job-info/[id]`, query: { id: jobId } });
        } catch (e) {
            console.error("Navigation failed, falling back to full redirect:", e);
            // Fallback to full page load if client-side navigation fails
            window.location.href = `/job-info/${jobId}`;
        }
    };

    const handleSave = async () => {
        const profileId = localStorage.getItem("profile_id");

        // GUEST USER (localStorage)

        if (!profileId) {
            if (saved) {
                removeGuestSavedJob(job.id);
                setSaved(false);

                notifications.show({
                    message: (
                        <>
                            <strong>{job.position}</strong> removed from saved jobs (guest mode).
                        </>
                    ),
                    autoClose: 3000,
                });
            } else {
                addGuestSavedJob(job.id);
                setSaved(true);

                notifications.show({
                    message: (
                        <>
                            <strong>{job.position}</strong> saved locally.
                            Login to sync across devices.
                        </>
                    ),
                    autoClose: 3000,
                });
            }

            return;
        }
        // LOGGED IN USER (DB)
        try {
            if (saved) {
                await ProfileService.removeJob(Number(profileId), job.id);
                setSaved(false);

                notifications.show({
                    message: (
                        <>
                            <strong>{job.position}</strong> has been removed.
                        </>
                    ),
                    autoClose: 3000,
                });
            } else {
                await ProfileService.saveJob(Number(profileId), job.id);
                setSaved(true);

                notifications.show({
                    message: (
                        <>
                            <strong>{job.position}</strong> has been saved.
                        </>
                    ),
                    autoClose: 3000,
                });
            }
        } catch (err) {
            console.error(err);

            notifications.show({
                color: "red",
                message: "Something went wrong while saving job",
            });
        }
    };

    return (
        <Paper
            withBorder
            radius="lg"
            p="lg"
            style={{
                backgroundColor: "#fff",
                borderColor: "rgba(119, 67, 38, 0.15)",
            }}
        >
            <Stack gap="md">

                {/* HEADER */}
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Group gap="md" wrap="nowrap">
                        <Box
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: 14,
                                backgroundColor: "#f6f1ee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: 18,
                                color: BROWN,
                                flexShrink: 0,
                            }}
                        >
                            {getInitials(job.company_name)}
                        </Box>

                        <Stack gap={2}>
                            <Text size="md" fw={700} lineClamp={1}>
                                {job.position}
                            </Text>

                            <Group gap={6}>
                                <Text size="xs" c="dimmed">
                                    {job.company_name}
                                </Text>

                                <Text size="xs" c="dimmed">
                                    • {job.location}
                                </Text>
                            </Group>
                        </Stack>

                        {job.compatibility_score != null && (
                            <RingProgress
                                size={60}
                                thickness={6}
                                roundCaps
                                sections={[
                                    {
                                        value: job.compatibility_score,
                                        color:
                                            job.compatibility_score >= 70
                                                ? "#34C759"
                                                : "#FF383C",
                                    },
                                ]}
                                label={
                                    <Text size="xs" ta="center" fw={700}>
                                        {job.compatibility_score}%
                                    </Text>
                                }
                            />
                        )}
                    </Group>

                    <Group gap="sm" align="center">
                        <Badge
                            radius="xl"
                            variant="outline"
                            style={{
                                borderColor: BROWN,
                                color: BROWN,
                                fontWeight: 500,
                            }}
                        >
                            {job.type}
                        </Badge>
                    </Group>
                </Group>

                {/* BODY */}
                <Text size="sm" c="dimmed" lineClamp={2} style={{ lineHeight: 1.5 }}>
                    {job.requirements}
                </Text>

                {/* FOOTER */}
                <Group justify="space-between" align="center">
                    <Group gap={8}>
                        <Button
                            radius="xl"
                            size="xs"
                            style={{ backgroundColor: BROWN }}
                            onClick={() => handleLearnMore(job.id)}
                        >
                            {t("jobListing.learnMore")}
                        </Button>

                        <Button
                            radius="xl"
                            size="xs"
                            variant="light"
                            onClick={handleSave}
                            styles={{
                                root: {
                                    border: `1px solid ${BROWN}`,
                                    backgroundColor: saved ? BROWN : "transparent",
                                    transition: "all 150ms ease",
                                },
                                label: {
                                    color: saved ? "#ffffff" : BROWN,
                                    fontWeight: 500,
                                },
                            }}
                        >
                            {saved ? t("jobListing.saved") : t("jobListing.save")}
                        </Button>
                    </Group>

                    <Button
                        radius="xl"
                        size="xs"
                        variant="outline"
                        onClick={() => onShare?.(job.id)}
                    >
                        {t("jobListing.share")}
                    </Button>
                </Group>

            </Stack>
        </Paper>
    );
};

export default JobListing;
