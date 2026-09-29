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
