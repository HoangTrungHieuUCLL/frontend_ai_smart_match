import {CV, Job} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
    getTestCv
};

export default CvService;
