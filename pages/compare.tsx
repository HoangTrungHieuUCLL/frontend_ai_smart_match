import { useEffect, useState } from "react";
import {Badge, Group, Loader, Stack, Table, Text} from "@mantine/core";
import {Job} from "../types";
import JobService from "../services/JobService";

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
                <Table w="80%" withColumnBorders>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th></Table.Th>
                            {jobs.map((job) => (
                                <Table.Th key={job.id}>{job.position}</Table.Th>
                            ))}
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {/* Company */}
                        <Table.Tr>
                            <Table.Td>Company</Table.Td>
                            {jobs.map((job) => (
                                <Table.Td key={job.id}>{job.company_name}</Table.Td>
                            ))}
                        </Table.Tr>

                        {/* Location */}
                        <Table.Tr>
                            <Table.Td>Location</Table.Td>
                            {jobs.map((job) => (
                                <Table.Td key={job.id}>{job.location}</Table.Td>
                            ))}
                        </Table.Tr>

                        {/* Job type */}
                        <Table.Tr>
                            <Table.Td>Job type</Table.Td>
                            {jobs.map((job) => (
                                <Table.Td key={job.id}>{job.type}</Table.Td>
                            ))}
                        </Table.Tr>

                        {/* Salary */}
                        <Table.Tr>
                            <Table.Td>Salary</Table.Td>
                            {jobs.map((job) => (
                                <Table.Td key={job.id}>{job.salary}</Table.Td>
                            ))}
                        </Table.Tr>

                        {/* Compatibility */}
                        <Table.Tr>
                            <Table.Td>Compatibility</Table.Td>
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
                                    <Table.Td key={job.id}>
                                        {score !== null ? (
                                            <Badge color={color}>{score.toFixed(2)}%</Badge>
                                        ) : (
                                            "-"
                                        )}
                                    </Table.Td>
                                );
                            })}
                        </Table.Tr>

                        {/* Skills */}
                        <Table.Tr>
                            <Table.Td>Top skills</Table.Td>
                            {jobs.map((job) => {
                                const skills = job.requirements_simplified
                                    ? job.requirements_simplified.split(",").map(s => s.trim())
                                    : [];

                                return (
                                    <Table.Td key={job.id}>
                                        <Group gap="xs">
                                            {skills.map((skill, idx) => (
                                                <Badge key={idx} variant="light" color={BROWN}>
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </Group>
                                    </Table.Td>
                                );
                            })}
                        </Table.Tr>

                        {/* Benefits */}
                        <Table.Tr>
                            <Table.Td>Benefits</Table.Td>
                            {jobs.map((job) => (
                                <Table.Td key={job.id}>{job.offers}</Table.Td>
                            ))}
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            )}
        </Stack>
    );
}