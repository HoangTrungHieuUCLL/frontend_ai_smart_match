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
        const response = await fetch(`${API_URL}/executive-view?${params.toString()}`, {
            method: "GET",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch executive view dashboard");
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
