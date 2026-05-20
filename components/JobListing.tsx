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
    Text
} from "@mantine/core";

interface Props {
    job: Job;
}

const BROWN = "#774326";

const handleSave = (title: string) => {
    if (typeof window !== "undefined") {
        window.alert(`Saved ${title}`);
    }
};

const handleShare = (title: string) => {
    if (typeof window !== "undefined") {
        window.alert(`Share ${title}`);
    }
};

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
                    </Group>

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
                            Learn more
                        </Button>

                        <Button
                            radius="xl"
                            size="xs"
                            variant="light"
                            color="gray"
                            onClick={() => handleSave(job.position)}
                        >
                            Save
                        </Button>
                    </Group>

                    <Button
                        radius="xl"
                        size="xs"
                        variant="subtle"
                        color="gray"
                        onClick={() => handleShare(job.position)}
                    >
                        Share
                    </Button>
                </Group>

            </Stack>
        </Paper>
    );
};

export default JobListing;
