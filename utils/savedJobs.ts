const KEY = "savedJobs";

export const getSavedJobs = (): number[] => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(KEY) || "[]");
};

export const saveJob = (jobId: number) => {
    const saved = getSavedJobs();

    if (!saved.includes(jobId)) {
        const updated = [...saved, jobId];
        localStorage.setItem(KEY, JSON.stringify(updated));
    }
};

export const removeJob = (jobId: number) => {
    const saved = getSavedJobs();

    const updated = saved.filter((id) => id !== jobId);
    localStorage.setItem(KEY, JSON.stringify(updated));
};

export const isJobSaved = (jobId: number) => {
    return getSavedJobs().includes(jobId);
};