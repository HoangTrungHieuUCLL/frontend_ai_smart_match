import {Job} from "../types";

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

const JobService = {
  getAllJobs,
  getJobById,
};

export default JobService;
