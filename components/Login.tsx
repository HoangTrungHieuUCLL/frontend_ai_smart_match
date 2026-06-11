import {
  Anchor,
  Button,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconBrandLinkedin } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthService from "../services/AuthService";
import { ensureAccountCreatedAt } from "../utils/profileStorage";

const LINKEDIN_BLUE = "#0A66C2";

export const Login = ({
  onSuccess,
  onClose,
}: {
  onSuccess?: (email: string) => void;
  onClose?: () => void;
}) => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const linkedinLogin = params.get("linkedinLogin");

    if (linkedinLogin === "not_found") {
      setError(
        "No account is linked to this LinkedIn profile. Please create an account first, or sign in another way.",
      );
    } else if (linkedinLogin === "missing_email") {
      setError(
        "LinkedIn did not return an email address. Please sign in another way.",
      );
    } else if (linkedinLogin === "failed") {
      setError(
        "LinkedIn login failed. Please try again or sign in another way.",
      );
    }
  }, []);

  const getRoleFromToken = (token: string) => {
    const payload = JSON.parse(atob(token.split(".")[0]));
    return payload.role;
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await AuthService.login({
        email,
        password,
      });

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("email", email);
      ensureAccountCreatedAt(email);
      window.dispatchEvent(new Event("auth-change"));

      onSuccess?.(email);
      onClose?.();

      const role = getRoleFromToken(data.access_token);

      await router.push(
        role === "admin" ? "/executive-view" : "/job-search-with-ai",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInLogin = () => {
    window.location.href = AuthService.getLinkedInLoginUrl();
  };

  return (
    <Stack gap="md">
      <TextInput
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        radius="xl"
        size="lg"
        styles={{
          input: {
            borderColor: "#774326",
          },
        }}
      />

      <PasswordInput
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        radius="xl"
        size="lg"
        styles={{
          input: {
            borderColor: "#774326",
          },
        }}
      />

      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}

      <Button
        radius="xl"
        type="button"
        size="lg"
        fullWidth
        loading={isLoading}
        onClick={handleLogin}
        styles={{
          root: {
            backgroundColor: "#774326",
          },
        }}
      >
        Log in
      </Button>
      <Divider label="or" labelPosition="center" />
      <Button
        radius="xl"
        type="button"
        size="lg"
        fullWidth
        onClick={handleLinkedInLogin}
        styles={{
          root: {
            backgroundColor: LINKEDIN_BLUE,
          },
        }}
      >
        <Group justify="center" gap="xs" wrap="nowrap">
          <IconBrandLinkedin size={22} aria-hidden="true" />
          <Text component="span" fw={700} size="sm" c="#ffffff">
            Continue with LinkedIn
          </Text>
        </Group>
      </Button>
      <Text size="sm" ta="center" mt="md" c="black">
        Don't have an account?{" "}
        <Anchor
          component="button"
          onClick={() => {
            onClose?.();
            router.push("/register");
          }}
          style={{
            color: "#774326",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Create one
        </Anchor>
      </Text>
    </Stack>
  );
};

export default Login;
