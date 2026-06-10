import { CV } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type TopSkill = {
    skill: string;
    count: number;
};

export type ExecutiveViewDashboard = {
    total_jobs: number;
    total_cvs: number;
    top_skills: TopSkill[];
    cvs: CV[];
    cv_table: {
        total_count: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
};

export type CvSortBy = "id" | "filename" | "candidate_name" | "skills";
export type SortDirection = "asc" | "desc";

export type ExecutiveViewParams = {
    search?: string;
    sortBy?: CvSortBy;
    sortDirection?: SortDirection;
    page?: number;
    pageSize?: number;
};

export class ExecutiveViewRequestError extends Error {
    status: number;

    constructor(status: number, message = "Failed to fetch executive view dashboard") {
        super(message);
        this.name = "ExecutiveViewRequestError";
        this.status = status;
    }
}

const getDashboard = async ({
    search = "",
    sortBy = "id",
    sortDirection = "desc",
    page = 1,
    pageSize = 20,
}: ExecutiveViewParams = {}): Promise<ExecutiveViewDashboard> => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    const params = new URLSearchParams({
        sort_by: sortBy,
        sort_direction: sortDirection,
        page: String(page),
        page_size: String(pageSize),
    });

    if (search.trim()) {
        params.set("search", search.trim());
    }

    try {
        const token = typeof window !== "undefined"
            ? window.localStorage.getItem("access_token")
            : null;
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/executive-view?${params.toString()}`, {
            method: "GET",
            signal: controller.signal,
            headers,
        });

        if (!response.ok) {
            throw new ExecutiveViewRequestError(response.status);
        }

        const text = await response.text();

        if (!text) {
            throw new Error("Executive view dashboard returned an empty response");
        }

        return JSON.parse(text);
    } finally {
        window.clearTimeout(timeout);
    }
};

const ExecutiveViewService = {
    getDashboard,
};

export default ExecutiveViewService;
