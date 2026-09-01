import { Alert, Center, Loader, Stack, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ensureAccountCreatedAt, saveLinkedInAccountMetadata } from "../utils/profileStorage";
import { useTranslation } from "../contexts/I18nContext";

export default function LinkedInLoginCallbackPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [error, setError] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const email = params.get("email");
        const role = params.get("role");
        const linkedinLinked = params.get("linkedinLinked") === "true";

        if (!token || !email) {
            setError(t("login.linkedinFailed"));
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    return (
        <Center mih="60vh">
            <Stack align="center" gap="md">
                {error ? (
                    <Alert color="red" title={t("linkedinLoginCallback.alertTitle")}>
                        {error}
                    </Alert>
                ) : (
                    <>
                        <Loader color="#774326" />
                        <Text fw={600}>{t("linkedinLoginCallback.signingIn")}</Text>
                    </>
                )}
            </Stack>
        </Center>
    );
}
