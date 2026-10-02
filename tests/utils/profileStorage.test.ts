import { clearStoredProfileCv, getStoredProfileCv, saveStoredProfileCv } from "../../utils/profileStorage";
import type { CV } from "../../types";

const guestCv = {
    id: 7,
    filename: "cv.pdf",
    uploaded_at: "",
    delete_token: "tok",
    candidate_profile: { email: "Guest@Example.com" },
    compatibility_scores: [],
} as unknown as CV;

beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
});

test("guest (not logged in) can read back and clear the CV they uploaded", () => {
    // CVUploadModal saves with localStorage email, which is null for guests.
    saveStoredProfileCv(guestCv, localStorage.getItem("email"));

    expect(getStoredProfileCv(localStorage.getItem("email"))?.id).toBe(7);

    clearStoredProfileCv(localStorage.getItem("email"));
    expect(getStoredProfileCv(localStorage.getItem("email"))).toBeNull();
    expect(getStoredProfileCv("guest@example.com")).toBeNull();
});

test("logged-in user still reads their CV by login email", () => {
    localStorage.setItem("email", "guest@example.com");
    saveStoredProfileCv(guestCv, localStorage.getItem("email"));
    expect(getStoredProfileCv()?.delete_token).toBe("tok");
});
