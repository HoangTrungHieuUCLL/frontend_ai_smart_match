import { Group, Paper, Skeleton, Stack } from "@mantine/core";

const JobListingSkeleton: React.FC = () => (
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
                    {/* Company initials avatar */}
                    <Skeleton width={52} height={52} radius={14} />

                    {/* Position + company + location */}
                    <Stack gap={6}>
                        <Skeleton height={16} width={180} radius="sm" />
                        <Group gap={6}>
                            <Skeleton height={12} width={90} radius="sm" />
                            <Skeleton height={12} width={70} radius="sm" />
                        </Group>
                        <Skeleton height={12} width={140} radius="sm" />
                    </Stack>

                    {/* Ring progress */}
                    <Skeleton circle height={60} />
                </Group>

                {/* Type badge */}
                <Skeleton height={22} width={72} radius="xl" />
            </Group>

            {/* BODY — two lines of requirements text */}
            <Stack gap={6}>
                <Skeleton height={13} radius="sm" />
                <Skeleton height={13} width="75%" radius="sm" />
            </Stack>

            {/* FOOTER */}
            <Group justify="space-between" align="center">
                <Group gap={8}>
                    <Skeleton height={28} width={90} radius="xl" />
                    <Skeleton height={28} width={68} radius="xl" />
                </Group>
                <Skeleton height={28} width={68} radius="xl" />
            </Group>
        </Stack>
    </Paper>
);

export default JobListingSkeleton;
