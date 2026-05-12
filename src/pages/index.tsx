import { Anchor, Badge, Box, Button, Container, Divider, Grid, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";

export default function HomePage() {
  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#f7f2ef", padding: "32px 0" }}>
      <Container size="1200px">
        <Group justify="space-between" align="center" gap="xl" style={{ marginBottom: 32 }}>
          <Group gap="xs" align="center">
            <Text size="xl" style={{ color: "#623a26", fontWeight: 700 }}>
              HRNEXT
            </Text>
            <Text color="dimmed" size="sm">
              outsourcing agency
            </Text>
          </Group>

          <Group gap="xl" style={{ flexWrap: "wrap" }}>
            <Anchor href="#" color="dimmed" size="sm">
              Homepage
            </Anchor>
            <Anchor href="#" color="dimmed" size="sm">
              Our services
            </Anchor>
            <Anchor href="#" color="dimmed" size="sm">
              Our team
            </Anchor>
            <Anchor href="#" color="dimmed" size="sm">
              Our clients
            </Anchor>
            <Anchor href="#" color="dimmed" size="sm">
              Consultation
            </Anchor>
          </Group>

          <Group gap="md" align="center">
            <Button radius="xl" size="sm" color="brown" variant="filled" style={{ backgroundColor: "#8c5d39" }}>
              Job search with AI
            </Button>
            <Button variant="outline" radius="xl" size="sm">
              EN
            </Button>
          </Group>
        </Group>

        <Paper shadow="xl" radius="xl" p="xl" style={{ backgroundColor: "#fff1e7" }}>
          <Stack gap="xl">
            <SimpleGrid cols={3} spacing="lg" minColWidth={260}>
              <Paper withBorder radius="md" p="lg" style={{ backgroundColor: "#fff8f2" }}>
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start" gap="sm">
                    <Badge radius="xl" color="yellow" variant="filled">
                      1
                    </Badge>
                    <Text size="xs" color="dimmed" style={{ textTransform: "uppercase" }}>
                      Job description
                    </Text>
                  </Group>
                  <Title order={4} style={{ color: "#623a26" }}>
                    JOB DESCRIPTION
                  </Title>
                  <Text color="dimmed" size="sm">
                    See how the role matches your profile and decide if it is the right fit.
                  </Text>
                  <Button fullWidth radius="xl" variant="outline" color="brown" style={{ borderColor: "#8c5d39", color: "#8c5d39" }}>
                    How much does this job suit me?
                  </Button>
                </Stack>
              </Paper>

              <Paper withBorder radius="md" p="lg" style={{ backgroundColor: "#fff8f2" }}>
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start" gap="sm">
                    <Badge radius="xl" color="yellow" variant="filled">
                      2
                    </Badge>
                    <Text size="xs" color="dimmed" style={{ textTransform: "uppercase" }}>
                      Your CV uploaded
                    </Text>
                  </Group>
                  <Text size="lg" style={{ color: "#623a26", fontWeight: 700 }}>
                    Your CV uploaded.
                  </Text>
                  <Text color="dimmed" size="sm">
                    The system has your profile and can compare it with job requirements automatically.
                  </Text>
                  <Button fullWidth radius="xl" color="brown" style={{ backgroundColor: "#8c5d39" }}>
                    Let's ask AI
                  </Button>
                </Stack>
              </Paper>

              <Paper withBorder radius="md" p="lg" style={{ backgroundColor: "#fff8f2" }}>
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start" gap="sm">
                    <Badge radius="xl" color="yellow" variant="filled">
                      3
                    </Badge>
                    <Text size="xs" color="dimmed" style={{ textTransform: "uppercase" }}>
                      Match score
                    </Text>
                  </Group>
                  <Title order={1} style={{ color: "#623a26", lineHeight: 1 }}>
                    98%
                  </Title>
                  <Text color="dimmed" size="sm">
                    This job is highly compatible with your profile based on skills and experience.
                  </Text>
                  <Button fullWidth radius="xl" variant="outline" color="brown" style={{ borderColor: "#8c5d39", color: "#8c5d39" }}>
                    How compatible am I to this job?
                  </Button>
                </Stack>
              </Paper>
            </SimpleGrid>

            <Paper withBorder radius="xl" p="xl" style={{ backgroundColor: "#ffffff" }}>
              <Stack gap="lg">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Group gap="md" align="center">
                    <Box
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 18,
                        backgroundColor: "#e8f0fa",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Text size="xl" style={{ color: "#3366cc", fontWeight: 700 }}>
                        in
                      </Text>
                    </Box>
                    <Stack gap={4}>
                      <Text size="lg" style={{ fontWeight: 700 }}>
                        ELV Systems Technician
                      </Text>
                      <Text color="dimmed" size="sm">
                        Experience in logistics, electricity preferred
                      </Text>
                      <Text size="xs" color="dimmed">
                        ABC Co., Ltd. • 2 days ago
                      </Text>
                    </Stack>
                  </Group>

                  <Group gap="xs" wrap="nowrap">
                    <Button radius="xl" variant="outline" size="xs" color="brown" style={{ borderColor: "#8c5d39", color: "#8c5d39" }}>
                      Upload your CV
                    </Button>
                    <Button radius="xl" size="xs" color="brown" style={{ backgroundColor: "#8c5d39" }}>
                      Save
                    </Button>
                    <Button radius="xl" variant="outline" size="xs">
                      Share
                    </Button>
                  </Group>
                </Group>

                <Group gap="xs">
                  <Badge color="gray" variant="light">
                    Hanoi
                  </Badge>
                  <Badge color="gray" variant="light">
                    Technician
                  </Badge>
                </Group>

                <Divider />

                <Stack gap="md">
                  <Text size="lg" style={{ fontWeight: 700 }}>
                    Job description
                  </Text>
                  <Text color="dimmed" size="sm">
                    Field: Construction and installation of Extra-Low Voltage (ELV) systems, access control, surveillance, and measurement equipment.
                  </Text>
                  <Text size="sm" style={{ fontWeight: 600 }}>
                    Key Responsibilities:
                  </Text>
                  <Text color="dimmed" size="sm" component="div">
                    • Install ELV systems, including security cameras (CCTV), Queue Management Systems, Car Parking Control Systems, PABX (telephone exchange) systems, and monitoring/measurement systems.
                    <br />• Perform other tasks as assigned by management.
                  </Text>

                  <Text size="sm" style={{ fontWeight: 600 }}>
                    Candidate Requirements:
                  </Text>
                  <Text color="dimmed" size="sm" component="div">
                    • Education: Associate Degree, Vocational Certificate, or higher.

                  </Text>

                  <Text size="sm" style={{ fontWeight: 600 }}>
                    Benefits & Compensation:
                  </Text>
                  <Text color="dimmed" size="sm" component="div">
                    • Base Salary: 9,000,000 – 12,000,000 VND

                  </Text>

                  <Text size="sm" style={{ fontWeight: 600 }}>
                    Work Location & Hours:
                  </Text>
                  <Text color="dimmed" size="sm" component="div">
                    • Location: D24-22, Lot D, Geleximco Urban Area, Duong Noi Ward, Ha Dong District, Hanoi.
                  </Text>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
