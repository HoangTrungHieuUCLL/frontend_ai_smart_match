const KEY = "savedJobs";

const normalizeEmail = (email?: string | null) => (email ?? "").trim().toLowerCase();

const getCurrentEmail = () => {
    if (typeof window === "undefined") return "";

    return normalizeEmail(localStorage.getItem("email"));
};

const getKey = () => {
    const email = getCurrentEmail();
    return email ? `${KEY}:${email}` : null;
};

export const getSavedJobs = (): number[] => {
    if (typeof window === "undefined") return [];

    const key = getKey();
    if (!key) return [];

    const saved = sessionStorage.getItem(key) ?? sessionStorage.getItem(KEY);
    if (saved && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, saved);
    }

    return JSON.parse(saved || "[]");
};

export const saveJob = (jobId: number) => {
    const key = getKey();
    if (!key) return;

    const saved = getSavedJobs();

    if (!saved.includes(jobId)) {
        const updated = [...saved, jobId];
        sessionStorage.setItem(key, JSON.stringify(updated));
    }
};

export const removeJob = (jobId: number) => {
    const key = getKey();
    if (!key) return;

    const saved = getSavedJobs();

    const updated = saved.filter((id) => id !== jobId);
    sessionStorage.setItem(key, JSON.stringify(updated));
};

export const isJobSaved = (jobId: number) => {
    return getSavedJobs().includes(jobId);
};
