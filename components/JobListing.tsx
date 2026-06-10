import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Job } from "../types";
import {
    Badge,
    Box,
    Button,
    Checkbox,
    Group,
    Paper,
    Stack,
    Text,
    Tooltip,
    RingProgress
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "../contexts/I18nContext";
import { isJobSaved, saveJob, removeJob } from "../utils/savedJobs";
import { notifications } from "@mantine/notifications";

interface Props {
    job: Job;
    onShare?: (jobId: number) => void;
    isSelected?: boolean;
    onToggleSelect?: () => void;
    selectDisabled?: boolean;
    hideSaveAction?: boolean;
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

const JobListing: React.FC<Props> = ({
                                         job,
                                         onShare,
                                         isSelected = false,
                                         onToggleSelect,
                                         selectDisabled = false,
                                         hideSaveAction = false
                                     }) => {
    const router = useRouter();
    const { t } = useTranslation();

    const [saved, setSaved] = useState(false);
    const [hovered, setHovered] = useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

    useEffect(() => {
        const syncSaved = () => setSaved(isJobSaved(job.id));

        syncSaved();
        window.addEventListener("storage", syncSaved);
        window.addEventListener("auth-change", syncSaved);

        return () => {
            window.removeEventListener("storage", syncSaved);
            window.removeEventListener("auth-change", syncSaved);
        };
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

    const handleSave = () => {
        if (saved) {
            removeJob(job.id);
            setSaved(false);

            notifications.show({
                message: (
                    <>
                        <strong>{job.position}</strong> has been removed.{" "}
                        <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            style={{
                                color: BROWN,
                                fontWeight: 600,
                                textDecoration: "underline",
                            }}
                        >
                            Login
                        </a>{" "}
                        to keep your saved jobs during this session.
                    </>
                ),
                autoClose: 3000,
            });
        } else {
            saveJob(job.id);
            setSaved(true);

            notifications.show({
                message: (
                    <>
                        <strong>{job.position}</strong> has been saved.{" "}
                        <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            style={{
                                color: BROWN,
                                fontWeight: 600,
                                textDecoration: "underline",
                            }}
                        >
                            Login
                        </a>{" "}
                        to keep your saved jobs during this session.
                    </>
                ),
                autoClose: 3000,
            });
        }
    };

    return (
        <Box
            style={{ position: "relative" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Checkbox — always visible on mobile, hover-reveal on desktop */}
            {(isMobile || hovered || isSelected) && onToggleSelect && (
                <Box
                    style={{
                        position: "absolute",
                        top: 14,
                        left: 14,
                        zIndex: 2,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Tooltip
                        label="You can compare up to 4 jobs at a time."
                        disabled={!selectDisabled || isSelected}
                        withArrow
                        position="right"
                    >
                        <Checkbox
                            checked={isSelected}
                            onChange={() => {
                                if (!selectDisabled || isSelected) {
                                    onToggleSelect();
                                }
                            }}
                            styles={{
                                input: {
                                    cursor: selectDisabled && !isSelected ? "not-allowed" : "pointer",
                                    borderColor: BROWN,
                                    backgroundColor: isSelected ? BROWN : undefined,
                                },
                            }}
                        />
                    </Tooltip>
                </Box>
            )}

            <Paper
                withBorder
                radius="lg"
                p="lg"
                style={{
                    backgroundColor: "#fff",
                    borderColor: isSelected
                        ? BROWN
                        : "rgba(119, 67, 38, 0.15)",
                    transition: "border-color 150ms ease",
                    cursor: "default",
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

                            {!hideSaveAction && (
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
                            )}
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
        </Box>
    );
};

export default JobListing;