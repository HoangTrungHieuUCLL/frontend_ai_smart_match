import { useState } from "react";
import {
    Button,
    Paper,
    PasswordInput,
    TextInput,
    Center,
    Text,
} from "@mantine/core";
import { useRouter } from "next/router";
import AuthService from "../services/AuthService";

export default function LoginPage() {
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

            await router.push("/executive-view");
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
        <Center
            style={{
                minHeight: "100vh",
                backgroundColor: "#efefef",
            }}
        >
            <Paper
                p="xl"
                radius="lg"
                shadow="xs"
                style={{
                    width: 420,
                    backgroundColor: "#f8f8f8",
                }}
            >
                <TextInput
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.currentTarget.value)}
                    size="lg"
                    radius="xl"
                    styles={{
                        input: {
                            borderColor: "#774326",
                            color: "#774326",
                        },
                    }}
                />

                <PasswordInput
                    mt="md"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    size="lg"
                    radius="xl"
                    styles={{
                        input: {
                            borderColor: "#774326",
                            color: "#774326",
                        },
                    }}
                />

                {error && (
                    <Text c="red" size="sm" mt="sm">
                        {error}
                    </Text>
                )}

                <Button
                    fullWidth
                    mt="md"
                    size="lg"
                    radius="xl"
                    loading={isLoading}
                    onClick={handleLogin}
                    styles={{
                        root: {
                            backgroundColor: "#774326",
                            border: "none",
                        },
                    }}
                >
                    Log in
                </Button>
            </Paper>
        </Center>
    );
}
