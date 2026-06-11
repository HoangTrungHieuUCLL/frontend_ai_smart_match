import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";

import CVUploadConfirmation from "../../components/CVUploadConfirmation";
import CvService from "../../services/CvService";
import type { CV } from "../../types";

jest.mock("../../services/CvService", () => ({
    __esModule: true,
    default: {
        confirmCv: jest.fn(),
        updateExtractedData: jest.fn(),
    },
}));

jest.mock("../../utils/profileStorage", () => ({
    saveStoredProfileCv: jest.fn(),
}));

const scores = [
    {
        job_id: 1,
        company_name: "Acme Labs",
        position: "Frontend Engineer",
        location: "Brussels",
        type: "Full-time",
        requirements: "React",
        requirements_simplified: "React",
        compatibility_score: 91,
    },
];

const cv: CV = {
    id: 101,
    filename: "candidate.pdf",
    uploaded_at: "2026-06-11T09:00:00.000Z",
    candidate_profile: {
        id: 202,
        cv_id: 101,
        given_name: "Alex",
        middle_name: "",
        family_name: "Morgan",
        current_title: "Frontend Engineer",
        skills: "React, TypeScript",
        phone: "123456789",
        location: "Brussels",
        email: "alex@example.com",
        bio: "Builds accessible React apps.",
        work_experiences: [
            {
                id: 1,
                profile_id: 202,
                job_title: "Frontend Developer",
                company_name: "Demo Company",
                start_date: "2024",
                end_date: "2026",
            },
        ],
        educations: [],
        projects: [],
        languages: [],
        certifications: [],
        compatibility_scores: [],
    },
    compatibility_scores: [],
};

function renderConfirmation(onClose = jest.fn()) {
    render(
        <MantineProvider>
            <CVUploadConfirmation cv={cv} onClose={onClose} profileId={202} />
        </MantineProvider>,
    );

    return { onClose };
}

describe("CVUploadConfirmation", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(CvService.confirmCv).mockResolvedValue({
            profile_id: 202,
            saved_count: 1,
            jobs: scores,
        });
        jest.mocked(CvService.updateExtractedData).mockResolvedValue(
            {
                ok: true,
                text: jest.fn(),
            } as unknown as Response,
        );
    });

    it("renders extracted CV fields with their values", () => {
        renderConfirmation();

        expect(screen.getByDisplayValue("Alex")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Morgan")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Frontend Engineer")).toBeInTheDocument();
        expect(screen.getByDisplayValue("alex@example.com")).toBeInTheDocument();
        expect(screen.getByText("React")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Frontend Developer")).toBeInTheDocument();
    });

    it("enables input fields after clicking Edit", async () => {
        renderConfirmation();

        const givenName = screen.getByDisplayValue("Alex");

        expect(givenName).toHaveAttribute("readonly");

        await userEvent.click(screen.getByRole("button", { name: /^edit$/i }));

        expect(givenName).not.toHaveAttribute("readonly");
    });

    it("updates the displayed value while editing", async () => {
        renderConfirmation();

        await userEvent.click(screen.getByRole("button", { name: /^edit$/i }));

        const givenName = screen.getByDisplayValue("Alex");
        fireEvent.change(givenName, { target: { value: "Casey" } });

        expect(screen.getByDisplayValue("Casey")).toBeInTheDocument();
    });

    it("calls updateExtractedData with modified data when Save changes is clicked", async () => {
        renderConfirmation();

        await userEvent.click(screen.getByRole("button", { name: /^edit$/i }));

        const givenName = screen.getByDisplayValue("Alex");
        fireEvent.change(givenName, { target: { value: "Casey" } });
        await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

        await waitFor(() => {
            expect(CvService.updateExtractedData).toHaveBeenCalledWith(
                202,
                expect.objectContaining({
                    candidate_profile: expect.objectContaining({
                        given_name: "Casey",
                    }),
                }),
            );
        });
    });

    it("calls confirmCv and passes scores to onClose when Everything looks good is clicked", async () => {
        const { onClose } = renderConfirmation();

        await userEvent.click(screen.getByRole("button", { name: /everything looks good/i }));

        await waitFor(() => {
            expect(CvService.confirmCv).toHaveBeenCalledWith({
                profileId: 202,
                cv,
            });
        });
        expect(onClose).toHaveBeenCalledWith(scores);
    });
});
