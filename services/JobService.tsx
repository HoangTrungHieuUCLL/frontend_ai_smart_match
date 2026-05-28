import { Job } from "../types";

const runtimeEnv = globalThis as typeof globalThis & {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

const API_URL = runtimeEnv.process?.env?.NEXT_PUBLIC_API_URL || "/api";

const readJsonResponse = async <T,>(response: Response): Promise<T> => {
  const contentType = response.headers.get("content-type") || "";
  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText || `Request failed with status ${response.status}`);
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`Expected JSON response but received ${contentType || "unknown content type"}`);
  }

  return JSON.parse(responseText) as T;
};

export type CvUploadData = {
  familyName: string;
  middleName: string;
  givenName: string;
  email: string;
  cv: File;
};

const BACKEND_FALLBACK = "http://localhost:8000";

const getAllJobs = async (): Promise<Job[]> => {
  try {
    const response = await fetch(`${API_URL}/jobs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await readJsonResponse<Job[]>(response);
  } catch (err) {
    // Fallback to direct backend host (useful for local dev when proxy/rewrite fails)
    const fallbackResponse = await fetch(`${BACKEND_FALLBACK}/jobs`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return await readJsonResponse<Job[]>(fallbackResponse);
  }
};

const getJobById = async (id: number): Promise<Job> => {
  try {
    const response = await fetch(`${API_URL}/jobs/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await readJsonResponse<Job>(response);
  } catch (err) {
    // Fallback to direct backend host (useful for local dev when proxy/rewrite fails)
    const fallbackResponse = await fetch(`${BACKEND_FALLBACK}/jobs/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return await readJsonResponse<Job>(fallbackResponse);
  }
};

const uploadCv = async (data: CvUploadData): Promise<Response> => {
  const formData = new FormData();
  formData.append("familyName", data.familyName);
  formData.append("middleName", data.middleName);
  formData.append("givenName", data.givenName);
  formData.append("email", data.email);
  formData.append("cv", data.cv);

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
