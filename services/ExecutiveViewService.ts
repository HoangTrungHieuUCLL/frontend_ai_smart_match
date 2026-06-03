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
};

const getDashboard = async (): Promise<ExecutiveViewDashboard> => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(`${API_URL}/executive-view`, {
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
