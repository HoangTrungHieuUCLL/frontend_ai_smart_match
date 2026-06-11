const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ProfileService = {
    getSavedJobs: async (profileId: number): Promise<number[]> => {
        const res = await fetch(`${API_URL}/profiles/${profileId}/saved-jobs`);
        return res.json();
    },

    saveJob: async (profileId: number, jobId: number) => {
        await fetch(`${API_URL}/profiles/${profileId}/saved-jobs/${jobId}`, {
            method: "POST",
        });
    },

    removeJob: async (profileId: number, jobId: number) => {
        await fetch(`${API_URL}/profiles/${profileId}/saved-jobs/${jobId}`, {
            method: "DELETE",
        });
    },
};

export default ProfileService;