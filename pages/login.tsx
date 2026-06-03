import { useState } from "react";
import {
    Button,
    Paper,
    PasswordInput,
    TextInput,
    Center,
} from "@mantine/core";
import { useRouter } from "next/router";

export default function LoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        console.log({ username, password });

        // TODO: call login API
        router.push("/");
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

                <Button
                    fullWidth
                    mt="md"
                    size="lg"
                    radius="xl"
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