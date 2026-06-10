import {
  Anchor,
  Button,
  Divider,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconBrandLinkedin } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AuthService from "../services/AuthService";
import Login from "../components/Login";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINKEDIN_BLUE = "#0A66C2";

const hasMinLength = (pw: string) => pw.length >= 8;
const hasUppercase = (pw: string) => /[A-Z]/.test(pw);
const hasNumber = (pw: string) => /\d/.test(pw);

export const Register = ({
    onSuccess,
}: {
    onSuccess?: (email: string) => void;
}) => {
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

{showLogin && (
  <Login onClose={() => setShowLogin(false)} />
)}
  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      router.replace("/job-search-with-ai");
    }
  }, [router]);

  useEffect(() => {
    if (!router.isReady) return;

    const linkedinRegister = router.query.linkedinRegister;

    if (linkedinRegister === "missing_email") {
      setErrors({
        general: "LinkedIn did not return an email address. Please create an account another way.",
      });
    } else if (linkedinRegister === "failed") {
      setErrors({
        general: "LinkedIn registration failed. Please try again or create an account another way.",
      });
    }
  }, [router.isReady, router.query.linkedinRegister]);

  const passwordChecks = {
    length: hasMinLength(password),
    uppercase: hasUppercase(password),
    number: hasNumber(password),
  };

  const isPasswordValid =
    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.number;

  const isFormValid =
    emailRegex.test(email) &&
    isPasswordValid &&
    password === confirmPassword;

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

  const handleLinkedInRegister = () => {
    window.location.href = AuthService.getLinkedInRegisterUrl();
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

      <Divider label="or" labelPosition="center" />

      <Button
        radius="xl"
        size="lg"
        fullWidth
        onClick={handleLinkedInRegister}
        styles={{
          root: {
            backgroundColor: LINKEDIN_BLUE,
          },
        }}
      >
        <Group justify="center" gap="xs" wrap="nowrap">
          <IconBrandLinkedin size={22} aria-hidden="true" />
          <Text component="span" fw={700} size="sm" c="#ffffff">
            Create account with LinkedIn
          </Text>
        </Group>
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
