import { Anchor, Button, PasswordInput, Stack, Text, TextInput } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthService from "../services/AuthService";
import { ensureAccountCreatedAt } from "../utils/profileStorage";

export const Login = ({ onSuccess,onClose 
}: { onSuccess?: (email: string) => void;
     onClose?: () => void;
 }) => {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            localStorage.removeItem("savedJobs");
            setIsLoading(true);
            setError("");

            const data = await AuthService.login({
                email,
                password,
            });

            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("email", email);
            localStorage.setItem("profile_id", data.profile_id);
            ensureAccountCreatedAt(email);
            window.dispatchEvent(new Event("auth-change"));


            onSuccess?.(email);
            onClose?.();

            const payload = JSON.parse(
                atob(data.access_token.split(".")[0])
            );

            await router.push(payload.role === "admin" ? "/executive-view" : "/job-search-with-ai");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Invalid email or password"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Stack gap="md">
            <TextInput
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
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
                type="button"
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
            <Text size="sm" ta="center" mt="md" c="black">
                Don’t have an account?{" "}
                <Anchor
                    component="button"
                    onClick={() =>{ 
                         onClose?.();
                        router.push("/register");
                    }}
                    style={{
                        color: "#774326",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    Create one
                </Anchor>
                </Text>
        </Stack>
    );
};

export default Login;
