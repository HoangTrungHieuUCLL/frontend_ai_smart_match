import { Button, PasswordInput, Stack, Text, TextInput } from "@mantine/core";
import { useRouter } from "next/router";
import { useState } from "react";
import AuthService from "../services/AuthService";

export const Login = () => {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            setError("");

            const data = await AuthService.login({
                username,
                password,
            });

            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("username", data.username);

            window.location.href = "/executive-view";
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Invalid username or password"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Stack gap="md">
            <TextInput
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                radius="xl"
                size="lg"
                styles={{
                    input: {
                        borderColor: "#774326",
                    },
                }}
            />

            <PasswordInput
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                radius="xl"
                size="lg"
                styles={{
                    input: {
                        borderColor: "#774326",
                    },
                }}
            />

            {error && (
                <Text c="red" size="sm">
                    {error}
                </Text>
            )}

            <Button
                radius="xl"
                size="lg"
                fullWidth
                loading={isLoading}
                onClick={handleLogin}
                styles={{
                    root: {
                        backgroundColor: "#774326",
                    },
                }}
            >
                Log in
            </Button>
        </Stack>
    );
};

export default Login;