import { useEffect, useState } from "react";
import {Badge, Box, Divider, Group, Loader, Progress, ScrollArea, Stack, Table, Text} from "@mantine/core";
import {Job} from "../types";
import JobService from "../services/JobService";
import {BriefcaseBusiness, Building2, CircleDollarSign, MapPin, Settings, ShieldPlus} from "lucide-react";

const BROWN = "#774326";

export default function Compare() {
    const [isLoading, setIsLoading] = useState(true);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [jobScoresMap, setJobScoresMap] = useState<Map<number, number>>(new Map());

    const fetchJobs = async (jobIds: string[]) => {
        const jobArray: Job[] = [];

        for (const id of jobIds) {
            const jobResponse = await JobService.getJobById(Number(id));
            if (jobResponse) {
                jobArray.push(jobResponse);
            }
        }

        setJobs(jobArray);
        setIsLoading(false);
    }

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const jobIds = params.getAll("jobs");

        if (jobIds && jobIds.length > 0) {
            fetchJobs(jobIds);
        } else {
            setIsLoading(true);
        }
    }, []);

    const fetchScores = () => {
        const jobScoresRaw = localStorage.getItem("jobScores");

        const map = new Map<number, number>(
            jobScoresRaw
                ? JSON.parse(jobScoresRaw).map(
                    (s: { job_id: number; compatibility_score: number }) => [
                        s.job_id,
                        s.compatibility_score,
                    ]
                )
                : []
        );

        setJobScoresMap(map);
    };

    useEffect(() => {
        fetchScores();
    }, []);

    if (isLoading) {
        return (
            <Stack align="center" mt={24}>
                <Loader color={BROWN} />
            </Stack>
        );
    }

    return (
        <Stack align="center">
            {jobs.length === 0 ? (
                <p>No jobs selected. Choose some from the listings.</p>
            ) : (
                <Table style={{ tableLayout: "fixed", width: "80%" }} withRowBorders={false} mt={12} mb={12}>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th style={{ width: "5%" }} />

                            {jobs.map((job) => {
                                const score = jobScoresMap.get(job.id) ?? null;

                                const color =
                                    score === null
                                        ? "gray"
                                        : score >= 70
                                            ? "green"
                                            : score >= 40
                                                ? "yellow"
                                                : "red";

                                return (
                                    <Table.Th key={job.id}>
                                        <Text truncate="end" inherit>
                                            {job.position}
                                        </Text>

                                        {score !== null ? (
                                            <Box mt={4}>
                                                <Text size="xs" c={color} mb={4}>{score.toFixed(2)}%</Text>
                                                <Progress value={score} color={color} size="sm" />
                                            </Box>
                                        ) : (
                                            "-"
                                        )}

                                        <Divider mt={12} />
                                    </Table.Th>
                                );
                            })}
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {/* Company */}
                        <Table.Tr>
                            <Table.Td><Building2 /></Table.Td>
                            {jobs.map((job) => (
                                <Table.Td key={job.id}>{job.company_name}</Table.Td>
                            ))}
                        </Table.Tr>

                        {/* Location */}
                        <Table.Tr>
                            <Table.Td><MapPin /></Table.Td>
                            {jobs.map((job) => (
                                <Table.Td key={job.id}>{job.location}</Table.Td>
                            ))}
                        </Table.Tr>

                        {/* Job type */}
                        <Table.Tr>
                            <Table.Td><BriefcaseBusiness /></Table.Td>
                            {jobs.map((job) => (
                                <Table.Td key={job.id}>{job.type}</Table.Td>
                            ))}
                        </Table.Tr>

                        {/* Salary */}
                        <Table.Tr>
                            <Table.Td><CircleDollarSign /></Table.Td>
                            {jobs.map((job) => (
                                <Table.Td key={job.id}>
                                    {job.salary ? job.salary : "-"}
                                </Table.Td>
                            ))}
                        </Table.Tr>

                        {/* Skills */}
                        <Table.Tr>
                            <Table.Td><Settings /></Table.Td>
                            {jobs.map((job) => {
                                const skills = job.requirements_simplified
                                    ? job.requirements_simplified.split(",").map(s => s.trim())
                                    : [];

                                return (
                                    <Table.Td key={job.id} style={{ verticalAlign: "top" }}>
                                        <ScrollArea h={200} type="auto">
                                            <Group gap="xs">
                                                {skills.map((skill, idx) => (
                                                    <Badge key={idx} variant="light" color={BROWN}>
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </Group>
                                        </ScrollArea>
                                    </Table.Td>
                                );
                            })}
                        </Table.Tr>

                        {/* Benefits */}
                        <Table.Tr>
                            <Table.Td><ShieldPlus /></Table.Td>
                            {jobs.map((job) => (
                                <Table.Td key={job.id} style={{ verticalAlign: "top" }}>
                                    <ScrollArea h={200} type="auto">
                                        {job.offers}
                                    </ScrollArea>
                                </Table.Td>
                            ))}
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            )}
        </Stack>
    );
}