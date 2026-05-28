import React from "react";
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

interface Props {
    job: Job;
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

const JobListing: React.FC<Props> = ({ job }) => {
    const router = useRouter();
    const { t } = useTranslation();

    const handleLearnMore = (jobId: number) => {
        router.push(`/job-info/${jobId}`);
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
                            color="gray"
                            onClick={() => window.alert(t("jobListing.savedAlert", { title: job.position }))}
                        >
                            {t("jobListing.save")}
                        </Button>
                    </Group>

                    <Button
                        radius="xl"
                        size="xs"
                        variant="subtle"
                        color="gray"
                        onClick={() => window.alert(t("jobListing.shareAlert", { title: job.position }))}
                    >
                        {t("jobListing.share")}
                    </Button>
                </Group>

            </Stack>
        </Paper>
    );
};

export default JobListing;
