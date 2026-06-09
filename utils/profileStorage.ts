import type { CV } from "../types";

export const PROFILE_CV_STORAGE_KEY = "profileCv";
export const ACCOUNT_CREATED_AT_STORAGE_KEY = "accountCreatedAt";

const normalizeEmail = (email?: string | null) => (email ?? "").trim().toLowerCase();

const getCurrentEmail = () => {
    if (typeof window === "undefined") return "";

    return normalizeEmail(localStorage.getItem("email"));
};

const getProfileCvKey = (email?: string | null) => {
    const normalizedEmail = normalizeEmail(email) || getCurrentEmail();
    return normalizedEmail ? `${PROFILE_CV_STORAGE_KEY}:${normalizedEmail}` : PROFILE_CV_STORAGE_KEY;
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
        const value = localStorage.getItem(key) ?? localStorage.getItem(PROFILE_CV_STORAGE_KEY);
        if (value && !localStorage.getItem(key)) {
            localStorage.setItem(key, value);
        }
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
};

export const saveStoredProfileCv = (cv: CV, email?: string | null) => {
    if (typeof window === "undefined") return;

    localStorage.setItem(getProfileCvKey(email || getCvEmail(cv)), JSON.stringify(cv));
};

export const clearStoredProfileCv = (email?: string | null) => {
    if (typeof window === "undefined") return;

    localStorage.removeItem(getProfileCvKey(email));
};

export const getAccountCreatedAt = (email?: string | null) => {
    if (typeof window === "undefined") return null;

    return localStorage.getItem(getAccountCreatedAtKey(email)) ?? localStorage.getItem(ACCOUNT_CREATED_AT_STORAGE_KEY);
};

export const ensureAccountCreatedAt = (email?: string | null) => {
    if (typeof window === "undefined") return null;

    const key = getAccountCreatedAtKey(email);
    const existing = localStorage.getItem(key) ?? localStorage.getItem(ACCOUNT_CREATED_AT_STORAGE_KEY);
    if (existing) {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, existing);
        }
        return existing;
    }

    const createdAt = new Date().toISOString();
    localStorage.setItem(key, createdAt);
    return createdAt;
};
