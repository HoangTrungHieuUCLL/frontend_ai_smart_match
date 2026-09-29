import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";

import Login from "../../components/Login";
import AuthService from "../../services/AuthService";
import { I18nProvider } from "../../contexts/I18nContext";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

jest.mock("../../services/AuthService", () => ({
    __esModule: true,
    default: {
        login: jest.fn(),
    },
}));

const userToken = `${Buffer.from(JSON.stringify({ role: "user" })).toString("base64")}.signature`;

function renderLogin(props = {}) {
    render(
        <MantineProvider>
            <I18nProvider>
                <Login {...props} />
            </I18nProvider>
        </MantineProvider>,
    );
}

describe("Login", () => {
    beforeEach(() => {
        localStorage.clear();
        mockPush.mockClear();
        jest.clearAllMocks();
    });

    it("calls AuthService.login with the submitted email and password", async () => {
        jest.mocked(AuthService.login).mockResolvedValue({ access_token: userToken });

        renderLogin();

        fireEvent.change(screen.getByPlaceholderText("email"), {
            target: { value: "david@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("password"), {
            target: { value: "Password1" },
        });
        fireEvent.click(screen.getByRole("button", { name: /^log in$/i }));

        await waitFor(() => {
            expect(AuthService.login).toHaveBeenCalledWith({
                email: "david@example.com",
                password: "Password1",
            });
        });
    });

    it("redirects to the job search page when login succeeds", async () => {
        jest.mocked(AuthService.login).mockResolvedValue({ access_token: userToken });

        renderLogin();

        fireEvent.change(screen.getByPlaceholderText("email"), {
            target: { value: "david@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("password"), {
            target: { value: "Password1" },
        });
        fireEvent.click(screen.getByRole("button", { name: /^log in$/i }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/job-search-with-ai");
        });
    });

    it("shows the login error inline when AuthService.login rejects", async () => {
        jest.mocked(AuthService.login).mockRejectedValue(new Error("Incorrect password"));

        renderLogin();

        fireEvent.change(screen.getByPlaceholderText("email"), {
            target: { value: "david@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("password"), {
            target: { value: "wrong-password" },
        });
        fireEvent.click(screen.getByRole("button", { name: /^log in$/i }));

        expect(await screen.findByText("Incorrect password")).toBeInTheDocument();
    });

    it("masks the password input by default and reveals it from the toggle", async () => {
        const user = userEvent.setup();

        renderLogin();

        const passwordInput = screen.getByPlaceholderText("password");

        expect(passwordInput).toHaveAttribute("type", "password");

        await user.click(screen.getByLabelText(/toggle password visibility/i));

        await waitFor(() => {
            expect(passwordInput).toHaveAttribute("type", "text");
        });
    });
});
