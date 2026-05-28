import {CV} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type ParsedCvResponse = {
    message: string;
    cv_id: number;
    profile_id: number;
    ai_result: {
        candidate_profile?: {
            current_title?: string | null;
            phone?: string | null;
            location?: string | null;
            bio?: string | null;
            skills?: string[] | string | null;
        } | null;
        work_experience?: unknown[];
        education?: unknown[];
        projects?: unknown[];
        languages?: unknown[];
        certifications?: unknown[];
    };
};

const getTestCv = async (): Promise<CV> => {
    const response = await fetch(`${API_URL}/cv/test`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return await response.json();
};

const parseCv = async (cv: File): Promise<ParsedCvResponse> => {
    const formData = new FormData();
    formData.append("cv", cv);

    const response = await fetch(`${API_URL}/parse-cv`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    return await response.json();
};

const readErrorMessage = async (response: Response): Promise<string> => {
    try {
        const body = await response.json();
        const detail = body?.detail;

        if (typeof detail === "string") return detail;
        if (typeof detail?.error === "string") return detail.error;
        if (typeof detail?.message === "string") return detail.message;
    } catch {
        // Fall through to plain text below.
    }

    return await response.text();
};

const updateExtractedData = async (profileId: number, cvData: unknown): Promise<Response> => {
    return await fetch(`${API_URL}/cv/${profileId}/extracted-data`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(cvData),
    });
};

const CvService = {
    getTestCv,
    parseCv,
    updateExtractedData,
};

export default CvService;
