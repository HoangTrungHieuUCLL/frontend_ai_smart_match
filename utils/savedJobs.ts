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

const GUEST_SAVED_JOBS_KEY = "savedJobs";

export const getGuestSavedJobs = (): number[] => {
    return JSON.parse(
        localStorage.getItem(GUEST_SAVED_JOBS_KEY) ?? "[]"
    );
};

export const saveGuestSavedJobs = (ids: number[]) => {
    localStorage.setItem(
        GUEST_SAVED_JOBS_KEY,
        JSON.stringify(ids)
    );
};

export const addGuestSavedJob = (jobId: number) => {
    const saved = getGuestSavedJobs();

    if (!saved.includes(jobId)) {
        saveGuestSavedJobs([...saved, jobId]);
    }
};

export const removeGuestSavedJob = (jobId: number) => {
    const saved = getGuestSavedJobs();

    saveGuestSavedJobs(
        saved.filter((id) => id !== jobId)
    );
};