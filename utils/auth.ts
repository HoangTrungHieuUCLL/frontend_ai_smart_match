export const getTokenRole = (token?: string | null): string => {
    if (!token) return "";

    try {
        const payload = JSON.parse(atob(token.split(".")[0]));
        return typeof payload?.role === "string" ? payload.role : "";
    } catch {
        return "";
    }
};

export const isAdminToken = (token?: string | null) => getTokenRole(token) === "admin";
