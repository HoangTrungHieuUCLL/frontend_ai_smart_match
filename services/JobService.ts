import {Job, JobCreatePayload, JobFilterOptions} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// GETs send no Content-Type: that header makes every request a CORS
// preflight, doubling the round trips to the API.

// Last job list, kept for client-side navigation so a job page can render
// straight away instead of waiting for its own request.
let jobsCache: Job[] = [];

const getAllJobs = async (): Promise<Job[]> => {
  const response = await fetch(`${API_URL}/jobs`);
  const jobs: Job[] = await response.json();
  if (Array.isArray(jobs)) jobsCache = jobs;

  return jobs;
};

const getCachedJob = (id: number): Job | null => jobsCache.find((job) => job.id === id) ?? null;

const getFilterOptions = async (): Promise<JobFilterOptions> => {
  const response = await fetch(`${API_URL}/jobs/filter-options`);

  return await response.json();
};

const getJobById = async (id: number): Promise<Job> => {
  const response = await fetch(`${API_URL}/jobs/${id}`);

  if (!response.ok) {
    throw new Error(`Job ${id} not found`);
  }

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
  getCachedJob,
  getFilterOptions,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};

export default JobService;
