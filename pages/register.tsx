import {
  Anchor,
  Button,
  Modal,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AuthService from "../services/AuthService";
import Login from "../components/Login";
import { ensureAccountCreatedAt } from "../utils/profileStorage";
import { useTranslation } from "../contexts/I18nContext";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hasMinLength = (pw: string) => pw.length >= 8;
const hasUppercase = (pw: string) => /[A-Z]/.test(pw);
const hasNumber = (pw: string) => /\d/.test(pw);

export const Register = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      router.replace("/job-search-with-ai");
    }
  }, [router]);

  const passwordChecks = {
    length: hasMinLength(password),
    uppercase: hasUppercase(password),
    number: hasNumber(password),
  };

  const isPasswordValid =
    passwordChecks.length && passwordChecks.uppercase && passwordChecks.number;

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!emailRegex.test(email)) {
      newErrors.email = t("validation.emailInvalid");
    }

    if (!isPasswordValid) {
      newErrors.password = t("register.passwordRequirementsNotMet");
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t("register.passwordsDoNotMatch");
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    setErrors({});
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!validate()) return;

    try {
      setLoading(true);

      const data = await AuthService.register({
        email,
        password,
      });

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("email", email);
      ensureAccountCreatedAt(email);
      window.dispatchEvent(new Event("auth-change"));

      //   onSuccess?.(email);
      router.push("/job-search-with-ai");
    } catch (err: any) {
      const message = err.message;

      if (message === "EMAIL_EXISTS") {
        setErrors({
          email: t("register.emailExists"),
        });
      } else {
        setErrors({
          general: message || t("register.genericError"),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md" style={{ maxWidth: 420, margin: "0 auto" }}>
      <TextInput
        label={t("register.emailLabel")}
        placeholder={t("register.emailPlaceholder")}
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        error={touched.email ? errors.email : undefined}
        radius="xl"
        size="lg"
        styles={{
          input: { borderColor: "#774326" },
        }}
      />

      <PasswordInput
        label={t("register.passwordLabel")}
        placeholder={t("register.passwordPlaceholder")}
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
        error={touched.password ? errors.password : undefined}
        radius="xl"
        size="lg"
        styles={{
          input: { borderColor: "#774326" },
        }}
      />

      {/* Password checklist */}
      <Stack gap={2}>
        <Text size="sm" fw={500}>
          {t("register.passwordMustInclude")}
        </Text>

        <Text size="sm" c={passwordChecks.length ? "green" : "red"}>
          {passwordChecks.length ? "✓" : "✗"} {t("register.minLength")}
        </Text>

        <Text size="sm" c={passwordChecks.uppercase ? "green" : "red"}>
          {passwordChecks.uppercase ? "✓" : "✗"} {t("register.oneUppercase")}
        </Text>

        <Text size="sm" c={passwordChecks.number ? "green" : "red"}>
          {passwordChecks.number ? "✓" : "✗"} {t("register.oneNumber")}
        </Text>
      </Stack>

      <PasswordInput
        label={t("register.confirmPasswordLabel")}
        placeholder={t("register.confirmPasswordPlaceholder")}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.currentTarget.value)}
        onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
        error={touched.confirmPassword ? errors.confirmPassword : undefined}
        radius="xl"
        size="lg"
        styles={{
          input: { borderColor: "#774326" },
        }}
      />

      {errors.general && (
        <Text c="red" size="sm">
          {errors.general}
        </Text>
      )}

      <Button
        radius="xl"
        size="lg"
        fullWidth
        loading={loading}
        disabled={!email || !password || !confirmPassword}
        onClick={handleRegister}
        styles={{
          root: {
            backgroundColor: "#774326",
          },
        }}
      >
        {t("register.submit")}
      </Button>

      {/* Login link */}
      <Text size="sm" ta="center">
        {t("register.alreadyHaveAccount")}{" "}
        <Anchor onClick={() => setShowLogin(true)}>{t("nav.login")}</Anchor>
      </Text>
      <Modal opened={showLogin} onClose={() => setShowLogin(false)}>
        <Login onClose={() => setShowLogin(false)} />
      </Modal>
    </Stack>
  );
};

export default Register;
