const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const login = async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Login failed");
    }

    return await response.json();
};


const register = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Registration failed");
  }

  return await response.json();
};

const getLinkedInLoginUrl = () => `${API_URL}/auth/linkedin/login-start`;
const getLinkedInRegisterUrl = () => `${API_URL}/auth/linkedin/register-start`;

const AuthService = {
  login,
  register,
  getLinkedInLoginUrl,
  getLinkedInRegisterUrl,
};

export default AuthService;
