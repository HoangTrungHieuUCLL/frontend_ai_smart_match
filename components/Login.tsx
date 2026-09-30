import {
  Anchor,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthService from "../services/AuthService";
import { ensureAccountCreatedAt } from "../utils/profileStorage";
import { useTranslation } from "../contexts/I18nContext";

export const Login = ({
  onSuccess,
  onClose,
}: {
  onSuccess?: (email: string) => void;
  onClose?: () => void;
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        err instanceof Error ? err.message : t("login.invalidCredentials"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <TextInput
        placeholder={t("login.emailPlaceholder")}
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
        placeholder={t("login.passwordPlaceholder")}
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
        {t("login.submit")}
      </Button>
      <Text size="sm" ta="center" mt="md" c="black">
        {t("login.noAccount")}{" "}
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
          {t("login.createOne")}
        </Anchor>
      </Text>
    </Stack>
  );
};

export default Login;
