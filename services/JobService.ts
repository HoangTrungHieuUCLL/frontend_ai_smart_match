import {CV, Job} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type CvUploadData = {
  familyName: string;
  middleName: string;
  givenName: string;
  email: string;
  cv: File;
};

const getAllJobs = async (): Promise<Job[]> => {
  const response = await fetch(`${API_URL}/jobs`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
};

const getJobById = async (id: number): Promise<Job> => {
  const response = await fetch(`${API_URL}/jobs/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
};

const uploadCv = async (data: CV): Promise<Response> => {
  const formData = new FormData();
  // formData.append("familyName", data.familyName);
  // formData.append("middleName", data.middleName);
  // formData.append("givenName", data.givenName);
  // formData.append("email", data.email);
  // formData.append("cv", data.cv);

  return await fetch(`${API_URL}/cv/upload`, {
    method: "POST",
    body: formData,
  });
};

const JobService = {
  getAllJobs,
  getJobById,
  uploadCv,
};

export default JobService;
