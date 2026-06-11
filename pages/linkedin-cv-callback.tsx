import { useEffect, useState } from "react";
import { Box, Button, Container, Loader, Modal, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import CVUploadConfirmation from "../components/CVUploadConfirmation";
import { toConfirmationCv } from "../components/CVUploadModal";
import CvService, { CvConfirmReturn } from "../services/CvService";
import { CV } from "../types";

const SCORE_STORAGE_KEY = "jobScores";
const CV_NAME_STORAGE_KEY = "cvName";

const saveScoresToStorage = (results: CvConfirmReturn[]) => {
    const existing: CvConfirmReturn[] = JSON.parse(localStorage.getItem(SCORE_STORAGE_KEY) ?? "[]");
    const merged = new Map(existing.map((r) => [r.job_id, r.compatibility_score]));
    results.forEach((r) => merged.set(r.job_id, r.compatibility_score));
    localStorage.setItem(
        SCORE_STORAGE_KEY,
        JSON.stringify(
            Array.from(merged.entries()).map(([job_id, compatibility_score]) => ({
                job_id,
                compatibility_score,
            })),
        ),
    );
};

export default function LinkedInCvCallbackPage() {
    const router = useRouter();
    const [cv, setCv] = useState<CV | null>(null);
    const [profileId, setProfileId] = useState<number | null>(null);
    const [cvName, setCvName] = useState("LinkedIn import");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!router.isReady) return;

        const rawProfileId = Array.isArray(router.query.profileId)
            ? router.query.profileId[0]
            : router.query.profileId;
        const parsedProfileId = Number(rawProfileId);

        if (!parsedProfileId) {
            setError("LinkedIn import failed. You can upload a PDF instead.");
            return;
        }

        CvService.getExtractedData(parsedProfileId)
            .then((response) => {
                const filename = response.cv_file_name ?? "LinkedIn import";

                setCvName(filename);
                setProfileId(response.profile_id);
                setCv(
                    toConfirmationCv(response, filename, {
                        familyName: "",
                        middleName: "",
                        givenName: "",
                        email: "",
                    }),
                );
            })
            .catch(() => {
                setError("LinkedIn import failed. You can upload a PDF instead.");
            });
    }, [router.isReady, router.query.profileId]);

    const finish = async (results: CvConfirmReturn[]) => {
        localStorage.setItem(CV_NAME_STORAGE_KEY, cvName);
        saveScoresToStorage(results);
        await router.replace("/job-search-with-ai");
    };

    return (
        <Box style={{ minHeight: "100vh", backgroundColor: "#f7f2ef", padding: "32px 0" }}>
            <Container size="sm">
                {!cv && !error && (
                    <Stack align="center" gap="md" mt={80}>
                        <Loader color="#774326" size="xl" />
                        <Text fw={600}>Preparing your LinkedIn import...</Text>
                    </Stack>
                )}

                {error && (
                    <Stack align="center" gap="md" mt={80}>
                        <Text fw={700} c="red">
                            {error}
                        </Text>
                        <Button color="#774326" onClick={() => router.replace("/job-search-with-ai?linkedinImport=failed")}>
                            Back to upload
                        </Button>
                    </Stack>
                )}
            </Container>

            <Modal
                opened={cv != null}
                onClose={() => router.replace("/job-search-with-ai")}
                title={<Text fw={700} size="lg">CV Summary</Text>}
                size="xl"
                centered
            >
                {cv && (
                    <CVUploadConfirmation
                        cv={cv}
                        onClose={finish}
                        profileId={profileId}
                        sourceBanner="Data imported from LinkedIn. Please review and correct any missing or inaccurate fields before confirming."
                    />
                )}
            </Modal>
        </Box>
    );
}
