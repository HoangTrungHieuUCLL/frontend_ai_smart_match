import {CV, Job} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
}

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

const uploadCv = async (data: CvUploadData): Promise<CV> => {
    const formData = new FormData();
    formData.append("familyName", data.familyName);
    formData.append("middleName", data.middleName);
    formData.append("givenName", data.givenName);
    formData.append("email", data.email);
    formData.append("cv", data.cv);

    const response = await fetch(`${API_URL}/parse-cv`, {
        method: "POST",
        body: formData,
    });

    return await response.json();
};

const confirmCv = async (data: CvConfirmData): Promise<CvConfirmReturn> => {
    const response = await fetch(`${API_URL}/profiles/${data.profileId}/all`, {
        method: "GET",
    });

    return await response.json();
};

const CvService = {
    uploadCv,
    confirmCv,
};

export default CvService;
