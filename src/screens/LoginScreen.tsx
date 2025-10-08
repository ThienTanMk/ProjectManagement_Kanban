"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@mantine/form";
import { z } from "zod/v4";
import { zod4Resolver } from "mantine-form-zod-resolver";
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Group,
  Stack,
  Divider,
} from "@mantine/core";
import { IconBrandGoogle, IconBrandGithub } from "@tabler/icons-react";
import { auth } from "@/lib/firebase";
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { notifications } from "@mantine/notifications";
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
    ),
});
export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },
    validate: zod4Resolver(loginSchema),
  });

  function handleError(code: string) {
    switch (code) {
      case "auth/user-not-found":
        return "No user found with this email";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-email":
        return "Invalid email address format";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }

  const handleLogin = async (values: typeof form.values) => {
    setLoading(true);
    try {
      localStorage.clear();
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.replace("/");
    } catch (error: any) {
      setLoading(false);
      const message = handleError(error.code);
      notifications.show({
        title: "Login Error",
        message,
        color: "red.5",
      });
    }
  };
  const handleSocialLogin = async (provider: "google" | "github") => {
    setSocialLoading(provider);
    try {
      if (provider === "google") {
        await signInWithPopup(auth, new GoogleAuthProvider());
        router.replace("/");
        return;
      }

      if (provider === "github") {
        await signInWithPopup(auth, new GithubAuthProvider());
        router.replace("/");
      }
    } catch (error) {
      setSocialLoading(null);
      console.error(`${provider} login failed:`, error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <Container size="sm" px="md">
        <Paper shadow="md" p="xl" radius="md" w={420}>
          <form onSubmit={form.onSubmit(handleLogin)}>
            <Stack gap="md">
              <div className="text-center">
                <Title order={2} mb="xs">
                  Welcome Back
                </Title>
                <Text size="sm" c="dimmed">
                  Sign in to your account to continue
                </Text>
              </div>
              <TextInput
                label="Email"
                placeholder="Enter your email"
                key={form.key("email")}
                {...form.getInputProps("email")}
                required
              />
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                key={form.key("password")}
                {...form.getInputProps("password")}
                required
              />
              <Button fullWidth type="submit" loading={loading} size="md">
                Sign In
              </Button>
              <Divider
                label={
                  <Text size="sm" c="dimmed">
                    or continue with
                  </Text>
                }
                labelPosition="center"
              />
              <Group grow>
                <Button
                  variant="default"
                  leftSection={<IconBrandGoogle size={16} />}
                  onClick={() => handleSocialLogin("google")}
                  loading={socialLoading === "google"}
                  disabled={socialLoading !== null}
                >
                  Google
                </Button>
                <Button
                  variant="default"
                  leftSection={<IconBrandGithub size={16} />}
                  onClick={() => handleSocialLogin("github")}
                  loading={socialLoading === "github"}
                  disabled={socialLoading !== null}
                >
                  GitHub
                </Button>
              </Group>
              <Group justify="center" gap="xs">
                <Text size="sm" c="dimmed">
                  Don't have an account?
                </Text>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => router.push("/signup")}
                >
                  Sign up
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Container>
    </div>
  );
}
