import {
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Anchor,
  Modal,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AuthService from "../services/AuthService";
import Login from "../components/Login";
import { ensureAccountCreatedAt } from "../utils/profileStorage";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hasMinLength = (pw: string) => pw.length >= 8;
const hasUppercase = (pw: string) => /[A-Z]/.test(pw);
const hasNumber = (pw: string) => /\d/.test(pw);

export const Register = () => {
  const router = useRouter();

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
    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.number;

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!isPasswordValid) {
      newErrors.password = "Password does not meet requirements";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
          email:
            "An account with this email already exists. Log in instead?",
        });
      } else {
        setErrors({
          general:
            message || "Something went wrong. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md" style={{ maxWidth: 420, margin: "0 auto" }}>
      <TextInput
        label="Email"
        placeholder="you@example.com"
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
        label="Password"
        placeholder="Enter password"
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
          Password must include:
        </Text>

        <Text size="sm" c={passwordChecks.length ? "green" : "red"}>
          {passwordChecks.length ? "✓" : "✗"} At least 8 characters
        </Text>

        <Text
          size="sm"
          c={passwordChecks.uppercase ? "green" : "red"}
        >
          {passwordChecks.uppercase ? "✓" : "✗"} One uppercase letter
        </Text>

        <Text size="sm" c={passwordChecks.number ? "green" : "red"}>
          {passwordChecks.number ? "✓" : "✗"} One number
        </Text>
      </Stack>

      <PasswordInput
        label="Confirm Password"
        placeholder="Repeat password"
        value={confirmPassword}
        onChange={(e) =>
          setConfirmPassword(e.currentTarget.value)
        }
        onBlur={() =>
          setTouched((t) => ({ ...t, confirmPassword: true }))
        }
        error={
          touched.confirmPassword
            ? errors.confirmPassword
            : undefined
        }
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
        Confirm and Create Account
      </Button>

      {/* Login link */}
    <Text size="sm" ta="center">
        Already have an account?{" "}
    
      <Anchor onClick={() => setShowLogin(true)}>
        Log in
      </Anchor>
      </Text>
          <Modal opened={showLogin} onClose={() => setShowLogin(false)}>
      <Login onClose={() => setShowLogin(false)} />
    </Modal>
    </Stack>

  );
};

export default Register;
