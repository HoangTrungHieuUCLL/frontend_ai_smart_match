import {Job, JobCreatePayload} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

const createJob = async (job: JobCreatePayload, token: string): Promise<Job> => {
  const response = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(job),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Failed to register job");
  }

  return await response.json();
};

const updateJob = async (id: number, job: JobCreatePayload, token: string): Promise<Job> => {
  const response = await fetch(`${API_URL}/jobs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(job),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Failed to update job");
  }

  return await response.json();
};

const deleteJob = async (id: number, token: string): Promise<Job> => {
  const response = await fetch(`${API_URL}/jobs/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Failed to delete job");
  }

  return await response.json();
};

const JobService = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};

export default JobService;
