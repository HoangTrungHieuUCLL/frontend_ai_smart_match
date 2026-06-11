import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import JobListing from "../../components/JobListing";
import { I18nProvider } from "../../contexts/I18nContext";
import type { Job } from "../../types";
import * as savedJobs from "../../utils/savedJobs";

const mockPush = jest.fn();

jest.mock("next/router", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

jest.mock("@mantine/notifications", () => ({
    notifications: {
        show: jest.fn(),
    },
}));

jest.mock("../../utils/savedJobs", () => {
    const readSavedJobs = () => JSON.parse(localStorage.getItem("savedJobs") || "[]");

    return {
        getSavedJobs: jest.fn(readSavedJobs),
        getGuestSavedJobs: jest.fn(readSavedJobs),
        saveJob: jest.fn((jobId: number) => {
            const saved = readSavedJobs();
            if (!saved.includes(jobId)) {
                localStorage.setItem("savedJobs", JSON.stringify([...saved, jobId]));
            }
        }),
        removeJob: jest.fn((jobId: number) => {
            const saved = readSavedJobs();
            localStorage.setItem("savedJobs", JSON.stringify(saved.filter((id: number) => id !== jobId)));
        }),
        addGuestSavedJob: jest.fn((jobId: number) => {
            const saved = readSavedJobs();
            if (!saved.includes(jobId)) {
                localStorage.setItem("savedJobs", JSON.stringify([...saved, jobId]));
            }
        }),
        removeGuestSavedJob: jest.fn((jobId: number) => {
            const saved = readSavedJobs();
            localStorage.setItem("savedJobs", JSON.stringify(saved.filter((id: number) => id !== jobId)));
        }),
        isJobSaved: jest.fn((jobId: number) => readSavedJobs().includes(jobId)),
    };
});

const baseJob: Job = {
    id: 42,
    company_name: "HR Next",
    position: "Frontend Developer",
    date: "2026-06-09",
    location: "Brussels",
    type: "Engineering",
    overview: "Build user-facing features.",
    responsibilities: "Create reusable React components.",
    requirements: "React, TypeScript, testing experience.",
    offers: "Flexible work.",
    salary: "Negotiable",
    notes: "Remote friendly",
    compatibility_score: 75,
};

function renderJobListing(job: Job = baseJob, onShare = jest.fn()) {
    render(
        <MantineProvider>
            <I18nProvider>
                <JobListing job={job} onShare={onShare} />
            </I18nProvider>
        </MantineProvider>
    );

    return { onShare };
}

describe("JobListing", () => {
    beforeEach(() => {
        localStorage.clear();
        mockPush.mockClear();
        jest.clearAllMocks();
    });

    it("renders the position, company name, and location", () => {
        renderJobListing();

        expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
        expect(screen.getByText("HR Next")).toBeInTheDocument();
        expect(screen.getByText("• Brussels")).toBeInTheDocument();
    });

    it("displays the compatibility score visually when present", () => {
        renderJobListing();

        expect(screen.getByText("75%")).toBeInTheDocument();
    });

    it("does not display a compatibility score when it is null", () => {
        renderJobListing({ ...baseJob, compatibility_score: null });

        expect(screen.queryByText("75%")).not.toBeInTheDocument();
    });

    it("navigates to the job detail page when Learn more is clicked", () => {
        renderJobListing();

        fireEvent.click(screen.getByRole("button", { name: /learn more/i }));

        expect(mockPush).toHaveBeenCalledWith({
            pathname: "/job-info/[id]",
            query: { id: baseJob.id },
        });
    });

    it("calls saveJob when saving without triggering navigation", () => {
        renderJobListing();

        fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

        expect(savedJobs.addGuestSavedJob).toHaveBeenCalledWith(baseJob.id);
        expect(savedJobs.removeGuestSavedJob).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });

    it("renders the unsaved visual state for an initially unsaved job", () => {
        renderJobListing();

        expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /^saved$/i })).not.toBeInTheDocument();
    });

    it("renders the saved visual state for an initially saved job", async () => {
        localStorage.setItem("savedJobs", JSON.stringify([baseJob.id]));

        renderJobListing();

        expect(await screen.findByRole("button", { name: /^saved$/i })).toBeInTheDocument();
    });

    it("calls removeJob when an initially saved job is unsaved", async () => {
        localStorage.setItem("savedJobs", JSON.stringify([baseJob.id]));

        renderJobListing();

        const savedButton = await screen.findByRole("button", { name: /^saved$/i });
        fireEvent.click(savedButton);

        await waitFor(() => {
            expect(savedJobs.removeGuestSavedJob).toHaveBeenCalledWith(baseJob.id);
        });
        expect(savedJobs.addGuestSavedJob).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });

    it("renders without crashing when optional salary and notes fields are null", () => {
        const jobWithNullOptionalFields = {
            ...baseJob,
            salary: null,
            notes: null,
        } as unknown as Job;

        renderJobListing(jobWithNullOptionalFields);

        expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    });
});
