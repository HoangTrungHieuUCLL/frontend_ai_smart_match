// components/JobInfoSkeleton.tsx
import {
    Box,
    Container,
    Divider,
    Group,
    Paper,
    Skeleton,
    Stack,
} from "@mantine/core";

const BROWN_BORDER = "rgba(119, 67, 38, 0.16)";

/** Mimics a bullet-point list section: a bold heading + N lines */
const SkeletonSection = ({ lines = 4 }: { lines?: number }) => (
    <Stack gap={4}>
        <Skeleton height={14} width={180} radius="sm" mb={4} />
        {Array.from({ length: lines }).map((_, i) => (
            <Group key={i} gap={6} wrap="nowrap">
                <Skeleton height={12} width={8} radius="sm" style={{ flexShrink: 0 }} />
                <Skeleton height={12} width={`${70 + (i % 3) * 10}%`} radius="sm" />
            </Group>
        ))}
    </Stack>
);

export default function JobInfoSkeleton() {
    return (
        <Box style={{ minHeight: "100vh", backgroundColor: "#f7f2ef", padding: "28px 0" }}>
            <Container size="1200px">
                <Paper style={{ backgroundColor: "#f7f2ef" }}>
                    <Stack gap="lg">

                        {/* ── Step cards row ── */}
                        <Group justify="space-between" align="stretch" wrap="wrap" style={{ gap: 16 }}>
                            {[1, 2, 3].map((n) => (
                                <Paper
                                    key={n}
                                    withBorder
                                    radius="xl"
                                    p="lg"
                                    h={300}
                                    style={{
                                        flex: "1 1 280px",
                                        minWidth: 280,
                                        backgroundColor: "#ffffff",
                                        borderColor: BROWN_BORDER,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Stack gap="md">
                                        {/* Numbered circle */}
                                        <Skeleton circle height={34} />

                                        <Stack gap={6}>
                                            {/* Card title */}
                                            <Skeleton height={13} width={130} radius="sm" />
                                            {/* Card description — 2 lines */}
                                            <Skeleton height={12} radius="sm" />
                                            <Skeleton height={12} width="65%" radius="sm" />
                                        </Stack>
                                    </Stack>

                                    {/* CTA button */}
                                    <Skeleton height={36} radius="xl" mt={16} />
                                </Paper>
                            ))}
                        </Group>

                        {/* ── Main job detail card ── */}
                        <Paper
                            withBorder
                            radius="xl"
                            p="xl"
                            style={{ backgroundColor: "#ffffff", borderColor: BROWN_BORDER }}
                        >
                            <Stack gap="lg">

                                {/* Header */}
                                <Group justify="apart" align="center" wrap="wrap">
                                    {/* Left: logo + meta */}
                                    <Group
                                        align="center"
                                        gap="md"
                                        wrap="nowrap"
                                        style={{ flex: "1 1 520px", minWidth: 0 }}
                                    >
                                        {/* Company logo */}
                                        <Skeleton
                                            width={128}
                                            height={128}
                                            radius={24}
                                            style={{ flexShrink: 0 }}
                                        />

                                        <Stack gap={6}>
                                            {/* Position title */}
                                            <Skeleton height={22} width={260} radius="sm" />
                                            {/* Company • date */}
                                            <Skeleton height={13} width={180} radius="sm" />

                                            {/* Location + type badges */}
                                            <Group gap="xs" mt="sm">
                                                <Skeleton height={26} width={90} radius="lg" />
                                                <Skeleton height={26} width={80} radius="lg" />
                                            </Group>
                                        </Stack>
                                    </Group>

                                    {/* Right: ring + action buttons */}
                                    <Group gap="md">
                                        {/* Ring progress placeholder */}
                                        <Skeleton circle height={130} />

                                        <Stack gap="sm">
                                            {/* CV upload button */}
                                            <Skeleton height={36} width={260} radius="xl" />

                                            {/* Save + Share */}
                                            <Group grow>
                                                <Skeleton height={34} radius="sm" />
                                                <Skeleton height={34} radius="sm" />
                                            </Group>
                                        </Stack>
                                    </Group>
                                </Group>

                                <Divider />

                                {/* Job description body */}
                                <Stack gap="lg">
                                    {/* Section heading */}
                                    <Skeleton height={18} width={160} radius="sm" />

                                    {/* Overview paragraph — 3 lines */}
                                    <Stack gap={6}>
                                        <Skeleton height={13} radius="sm" />
                                        <Skeleton height={13} radius="sm" />
                                        <Skeleton height={13} width="55%" radius="sm" />
                                    </Stack>

                                    <SkeletonSection lines={5} />
                                    <SkeletonSection lines={4} />
                                    <SkeletonSection lines={3} />
                                    <SkeletonSection lines={2} />
                                </Stack>

                            </Stack>
                        </Paper>

                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}