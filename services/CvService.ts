import {CV} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CvConfirmReturn {
    job_id: number;
    company_name: string;
    position: string;
    location: string;
    type: string;
    requirements: string;
    requirements_simplified: string;
    compatibility_score: number;
}

export type ParsedCvResponse = {
    message: string;
    cv_id: number;
    profile_id: number;
    cv_file_name?: string;
    top_10_compatibility_scores?: CvConfirmReturn[];
    ai_result: {
        candidate_profile?: {
            given_name?: string | null;
            middle_name?: string | null;
            family_name?: string | null;
            current_title?: string | null;
            phone?: string | null;
            location?: string | null;
            email?: string | null;
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

export type CvUploadData = {
    familyName: string;
    middleName: string;
    givenName: string;
    email: string;
    cv: File;
};

export type CvConfirmData = {
    profileId: number;
    cv: CV;
};

export interface CvConfirmResponse {
    profile_id: number;
    saved_count: number;
    jobs: CvConfirmReturn[];
}

const readErrorMessage = async (response: Response): Promise<string> => {
    try {
        const body = await response.json();
        const detail = body?.detail;

        if (typeof detail === "string") return detail;
        if (typeof detail?.error === "string") return detail.error;
        if (typeof detail?.message === "string") return detail.message;
    } catch {
    }

    return await response.text();
};

const uploadCv = async (data: CvUploadData): Promise<ParsedCvResponse> => {
    const formData = new FormData();
    formData.append("familyName", data.familyName);
    formData.append("middleName", data.middleName);
    formData.append("givenName", data.givenName);
    formData.append("email", data.email);
    formData.append("cv", data.cv);

    const response = await fetch(`${API_URL}/cv/upload`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

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

const getExtractedData = async (profileId: number): Promise<ParsedCvResponse> => {
    const response = await fetch(`${API_URL}/cv/${profileId}/extracted-data`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    return await response.json();
};

const confirmCv = async (data: CvConfirmData): Promise<CvConfirmResponse> => {
    const response = await fetch(`${API_URL}/profiles/${data.profileId}/all`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    return await response.json();
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

const deleteCv = async (id: number, token: string): Promise<{ message: string; cv_id: number }> => {
    const response = await fetch(`${API_URL}/cv/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response) || "Failed to delete CV");
    }

    return await response.json();
};

const CvService = {
    uploadCv,
    parseCv,
    getExtractedData,
    confirmCv,
    updateExtractedData,
    deleteCv,
    getLinkedInImportUrl: () => `${API_URL}/auth/linkedin/cv-start`,
};

export default CvService;
