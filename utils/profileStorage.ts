import type { CV } from "../types";

export const PROFILE_CV_STORAGE_KEY = "profileCv";
export const ACCOUNT_CREATED_AT_STORAGE_KEY = "accountCreatedAt";
export const ACCOUNT_LINKEDIN_STORAGE_KEY = "accountLinkedIn";

export type LinkedInAccountMetadata = {
    linked: boolean;
    email?: string | null;
    emailVerified?: boolean | null;
    fullName?: string | null;
    givenName?: string | null;
    familyName?: string | null;
    picture?: string | null;
};

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

const getLinkedInMetadataKey = (email?: string | null) => {
    const normalizedEmail = normalizeEmail(email) || getCurrentEmail();
    return normalizedEmail ? `${ACCOUNT_LINKEDIN_STORAGE_KEY}:${normalizedEmail}` : ACCOUNT_LINKEDIN_STORAGE_KEY;
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

    sessionStorage.setItem(getProfileCvKey(email || getCvEmail(cv)), JSON.stringify(cv));
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

export const getLinkedInAccountMetadata = (email?: string | null): LinkedInAccountMetadata | null => {
    if (typeof window === "undefined") return null;

    try {
        const key = getLinkedInMetadataKey(email);
        const value = localStorage.getItem(key) ?? localStorage.getItem(ACCOUNT_LINKEDIN_STORAGE_KEY);
        if (value && !localStorage.getItem(key)) {
            localStorage.setItem(key, value);
        }
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
};

export const saveLinkedInAccountMetadata = (
    metadata: LinkedInAccountMetadata,
    email?: string | null,
) => {
    if (typeof window === "undefined") return;

    const targetEmail = email || metadata.email;
    localStorage.setItem(
        getLinkedInMetadataKey(targetEmail),
        JSON.stringify({
            ...metadata,
            linked: true,
            email: normalizeEmail(metadata.email || targetEmail),
        }),
    );
};
