import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import Register from "../../pages/register";
import AuthService from "../../services/AuthService";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("next/router", () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
        isReady: true,
        query: {},
    }),
}));

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

jest.mock("../../services/AuthService", () => ({
    __esModule: true,
    default: {
        register: jest.fn(),
        login: jest.fn(),
    },
}));

function renderRegister() {
    render(
        <MantineProvider>
            <Register />
        </MantineProvider>,
    );
}

describe("Register", () => {
    beforeEach(() => {
        localStorage.clear();
        mockPush.mockClear();
        mockReplace.mockClear();
        jest.clearAllMocks();
    });

    it("keeps the submit button disabled until email, password, and confirm password have input", () => {
        renderRegister();

        const submitButton = screen.getByRole("button", { name: /confirm and create account/i });

        expect(submitButton).toBeDisabled();

        fireEvent.change(screen.getByLabelText(/^email$/i), {
            target: { value: "david@example.com" },
        });
        fireEvent.change(screen.getByLabelText(/^password$/i), {
            target: { value: "Password1" },
        });

        expect(submitButton).toBeDisabled();

        fireEvent.change(screen.getByLabelText(/confirm password/i), {
            target: { value: "Password1" },
        });

        expect(submitButton).toBeEnabled();
    });

    it("shows password requirement feedback when the password does not meet requirements", () => {
        renderRegister();

        expect(screen.getByText("✗ At least 8 characters")).toBeInTheDocument();
        expect(screen.getByText("✗ One uppercase letter")).toBeInTheDocument();
        expect(screen.getByText("✗ One number")).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/^password$/i), {
            target: { value: "password" },
        });

        expect(screen.getByText("✓ At least 8 characters")).toBeInTheDocument();
        expect(screen.getByText("✗ One uppercase letter")).toBeInTheDocument();
        expect(screen.getByText("✗ One number")).toBeInTheDocument();
    });

    it("shows a mismatch error when confirm password does not match", async () => {
        renderRegister();

        fireEvent.change(screen.getByLabelText(/^email$/i), {
            target: { value: "david@example.com" },
        });
        fireEvent.change(screen.getByLabelText(/^password$/i), {
            target: { value: "Password1" },
        });
        fireEvent.change(screen.getByLabelText(/confirm password/i), {
            target: { value: "Password2" },
        });
        fireEvent.click(screen.getByRole("button", { name: /confirm and create account/i }));

        expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
        expect(AuthService.register).not.toHaveBeenCalled();
    });

    it("calls AuthService.register and redirects when the form is valid", async () => {
        jest.mocked(AuthService.register).mockResolvedValue({ access_token: "token" });

        renderRegister();

        fireEvent.change(screen.getByLabelText(/^email$/i), {
            target: { value: "david@example.com" },
        });
        fireEvent.change(screen.getByLabelText(/^password$/i), {
            target: { value: "Password1" },
        });
        fireEvent.change(screen.getByLabelText(/confirm password/i), {
            target: { value: "Password1" },
        });
        fireEvent.click(screen.getByRole("button", { name: /confirm and create account/i }));

        await waitFor(() => {
            expect(AuthService.register).toHaveBeenCalledWith({
                email: "david@example.com",
                password: "Password1",
            });
        });
        expect(mockPush).toHaveBeenCalledWith("/job-search-with-ai");
    });
});
