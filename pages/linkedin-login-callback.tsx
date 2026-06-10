import { Alert, Center, Loader, Stack, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ensureAccountCreatedAt, saveLinkedInAccountMetadata } from "../utils/profileStorage";

export default function LinkedInLoginCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const email = params.get("email");
        const role = params.get("role");
        const linkedinLinked = params.get("linkedinLinked") === "true";

        if (!token || !email) {
            setError("LinkedIn login failed. Please try again or sign in another way.");
            return;
        }

        localStorage.setItem("access_token", token);
        localStorage.setItem("email", email);
        ensureAccountCreatedAt(email);

        if (linkedinLinked) {
            saveLinkedInAccountMetadata(
                {
                    linked: true,
                    email,
                    emailVerified: params.get("linkedinEmailVerified") === "true",
                    fullName: params.get("linkedinName"),
                    givenName: params.get("linkedinGivenName"),
                    familyName: params.get("linkedinFamilyName"),
                    picture: params.get("linkedinPicture"),
                },
                email,
            );
        }

        window.dispatchEvent(new Event("auth-change"));

        if (role === "admin") {
            router.replace("/executive-view");
        } else {
            router.replace("/job-search-with-ai");
        }
    }, [router]);

    return (
        <Center mih="60vh">
            <Stack align="center" gap="md">
                {error ? (
                    <Alert color="red" title="LinkedIn login failed">
                        {error}
                    </Alert>
                ) : (
                    <>
                        <Loader color="#774326" />
                        <Text fw={600}>Signing you in with LinkedIn...</Text>
                    </>
                )}
            </Stack>
        </Center>
    );
}
