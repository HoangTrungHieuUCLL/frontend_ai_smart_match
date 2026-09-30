import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";

import CVUploadModal from "../../components/CVUploadModal";
import { I18nProvider } from "../../contexts/I18nContext";
import CvService from "../../services/CvService";

jest.mock("../../services/CvService", () => ({
    __esModule: true,
    default: {
        uploadCv: jest.fn(),
        confirmCv: jest.fn(),
        updateExtractedData: jest.fn(),
    },
}));

jest.mock("../../utils/profileStorage", () => ({
    saveStoredProfileCv: jest.fn(),
}));

const parsedCvResponse = {
    message: "CV uploaded",
    cv_id: 101,
    profile_id: 202,
    cv_file_name: "candidate.pdf",
    ai_result: {
        candidate_profile: {
            given_name: "Alex",
            middle_name: "",
            family_name: "Morgan",
            current_title: "Frontend Engineer",
            phone: "123456789",
            location: "Brussels",
            email: "alex@example.com",
            bio: "Builds accessible React apps.",
            skills: ["React", "TypeScript"],
        },
        work_experience: [],
        education: [],
        projects: [],
        languages: [],
        certifications: [],
    },
};

function renderModal(opened = true, onClose = jest.fn()) {
    render(
        <MantineProvider>
            <I18nProvider>
                <CVUploadModal opened={opened} onClose={onClose} />
            </I18nProvider>
        </MantineProvider>,
    );

    return { onClose };
}

async function fillIdentityStep() {
    await userEvent.type(screen.getByPlaceholderText("Enter your family name"), "Morgan");
    await userEvent.type(screen.getByPlaceholderText("Enter your middle name"), "Q");
    await userEvent.type(screen.getByPlaceholderText("Enter your given name"), "Alex");
    await userEvent.type(screen.getByPlaceholderText("Enter your email"), "alex@example.com");
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
}

async function uploadPdf(fileName = "candidate.pdf") {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["%PDF-1.4"], fileName, { type: "application/pdf" });

    await userEvent.upload(input, file);
}

describe("CVUploadModal", () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it("is not visible when opened is false", () => {
        renderModal(false);

        expect(screen.queryByText("Upload your CV")).not.toBeInTheDocument();
    });

    it("is visible when opened is true", () => {
        renderModal();

        expect(screen.getByText("Upload your CV")).toBeInTheDocument();
    });

    it("selecting a PDF shows the filename and enables the submit button", async () => {
        renderModal();

        await fillIdentityStep();
        await uploadPdf();

        expect(await screen.findByText("File selected: candidate.pdf")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^upload cv$/i })).toBeEnabled();
    });

    it("shows an inline error for a non-PDF file and keeps submit disabled", async () => {
        renderModal();

        await fillIdentityStep();

        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(["plain text"], "candidate.txt", { type: "text/plain" });

        await userEvent.upload(input, file, { applyAccept: false });

        expect(await screen.findByText("Only PDF files are allowed")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^upload cv$/i })).toBeDisabled();
    });

    it("shows a loading indicator while upload parsing is in progress", async () => {
        let resolveUpload: (value: typeof parsedCvResponse) => void = () => {};
        jest.mocked(CvService.uploadCv).mockImplementation(
            () => new Promise((resolve) => {
                resolveUpload = resolve;
            }),
        );

        renderModal();

        await fillIdentityStep();
        await uploadPdf();
        await userEvent.click(screen.getByRole("button", { name: /^upload cv$/i }));

        expect(await screen.findByText("Sending your CV to our server")).toBeInTheDocument();

        resolveUpload(parsedCvResponse);

        expect(await screen.findByText("CV Summary")).toBeInTheDocument();
    });

    it("transitions to the confirmation step after a successful upload response", async () => {
        jest.mocked(CvService.uploadCv).mockResolvedValue(parsedCvResponse);

        renderModal();

        await fillIdentityStep();
        await uploadPdf();
        await userEvent.click(screen.getByRole("button", { name: /^upload cv$/i }));

        expect(await screen.findByText("CV Summary")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Alex")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Morgan")).toBeInTheDocument();
        expect(screen.getByText("React")).toBeInTheDocument();
    });

    it("shows an error message after a failed upload and lets the user retry", async () => {
        const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
        jest.mocked(CvService.uploadCv).mockRejectedValue(new Error("Upload failed"));

        renderModal();

        await fillIdentityStep();
        await uploadPdf();
        await userEvent.click(screen.getByRole("button", { name: /^upload cv$/i }));

        expect(await screen.findByText("Upload failed")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: /^ok$/i }));

        await waitFor(() => {
            expect(screen.queryByText("Upload failed")).not.toBeInTheDocument();
        });
        expect(screen.getByRole("button", { name: /^upload cv$/i })).toBeEnabled();

        consoleError.mockRestore();
    });
});
