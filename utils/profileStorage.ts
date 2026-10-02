import type { CV } from "../types";

export const PROFILE_CV_STORAGE_KEY = "profileCv";
export const ACCOUNT_CREATED_AT_STORAGE_KEY = "accountCreatedAt";
// Guests' CVs are saved under the email typed into the upload form, which
// the guest pages don't know, so remember which key was written last.
const LAST_PROFILE_CV_KEY = "profileCvLastKey";

const normalizeEmail = (email?: string | null) => (email ?? "").trim().toLowerCase();

const getCurrentEmail = () => {
    if (typeof window === "undefined") return "";

    return normalizeEmail(localStorage.getItem("email"));
};

const getProfileCvKey = (email?: string | null) => {
    const normalizedEmail = normalizeEmail(email) || getCurrentEmail();
    if (normalizedEmail) return `${PROFILE_CV_STORAGE_KEY}:${normalizedEmail}`;

    return sessionStorage.getItem(LAST_PROFILE_CV_KEY) ?? PROFILE_CV_STORAGE_KEY;
};

const getAccountCreatedAtKey = (email?: string | null) => {
    const normalizedEmail = normalizeEmail(email) || getCurrentEmail();
    return normalizedEmail ? `${ACCOUNT_CREATED_AT_STORAGE_KEY}:${normalizedEmail}` : ACCOUNT_CREATED_AT_STORAGE_KEY;
};

const getCvEmail = (cv: CV) => normalizeEmail(cv.candidate_profile?.email);

export const getStoredProfileCv = (email?: string | null): CV | null => {
    if (typeof window === "undefined") return null;

    try {
        const key = getProfileCvKey(email);
        const value = sessionStorage.getItem(key) ?? sessionStorage.getItem(PROFILE_CV_STORAGE_KEY);
        if (value && !sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, value);
        }
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
};

export const saveStoredProfileCv = (cv: CV, email?: string | null) => {
    if (typeof window === "undefined") return;

    const key = getProfileCvKey(email || getCvEmail(cv));
    sessionStorage.setItem(key, JSON.stringify(cv));
    sessionStorage.setItem(LAST_PROFILE_CV_KEY, key);
};

export const clearStoredProfileCv = (email?: string | null) => {
    if (typeof window === "undefined") return;

    const key = getProfileCvKey(email);
    sessionStorage.removeItem(key);
    // getStoredProfileCv falls back to the unscoped key, so clear it too.
    sessionStorage.removeItem(PROFILE_CV_STORAGE_KEY);
    if (sessionStorage.getItem(LAST_PROFILE_CV_KEY) === key) {
        sessionStorage.removeItem(LAST_PROFILE_CV_KEY);
    }
};

export const getAccountCreatedAt = (email?: string | null) => {
    if (typeof window === "undefined") return null;

    return sessionStorage.getItem(getAccountCreatedAtKey(email)) ?? sessionStorage.getItem(ACCOUNT_CREATED_AT_STORAGE_KEY);
};

export const ensureAccountCreatedAt = (email?: string | null) => {
    if (typeof window === "undefined") return null;

    const key = getAccountCreatedAtKey(email);
    const existing = sessionStorage.getItem(key) ?? sessionStorage.getItem(ACCOUNT_CREATED_AT_STORAGE_KEY);
    if (existing) {
        if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, existing);
        }
        return existing;
    }

    const createdAt = new Date().toISOString();
    sessionStorage.setItem(key, createdAt);
    return createdAt;
};
