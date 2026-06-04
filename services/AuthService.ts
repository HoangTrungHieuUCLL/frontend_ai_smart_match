const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const login = async ({ username, password }: { username: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username,
            password,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Login failed");
    }

    return await response.json();
};

const AuthService = {
    login
};

export default AuthService;
