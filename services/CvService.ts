import {CV, Job} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type CvUploadData = {
    familyName: string;
    middleName: string;
    givenName: string;
    email: string;
    cv: File;
};

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

const getTestCv = async (): Promise<CV> => {
    const response = await fetch(`${API_URL}/cv/test`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return await response.json();
};

const CvService = {
    uploadCv,
    getTestCv,
};

export default CvService;
