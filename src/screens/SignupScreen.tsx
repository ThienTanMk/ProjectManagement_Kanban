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
  Checkbox,
} from "@mantine/core";
import { IconBrandGoogle, IconBrandGithub } from "@tabler/icons-react";
import {
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { notifications } from "@mantine/notifications";
const signupSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms and conditions"),
});
export default function SignupScreen() {
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    validate: zod4Resolver(signupSchema),
  });
  const handleSignup = async (values: typeof form.values) => {
    setLoading(true);
    try {
      localStorage.clear();
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      router.push("/");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        notifications.show({
          title: "Email đã được sử dụng",
          message: "Vui lòng đăng nhập hoặc dùng phương thức khác.",
          color: "red",
        });
        return;
      }
      notifications.show({
        title: "Đăng ký không thành công",
        message: "Vui lòng kiểm tra thông tin và thử lại.",
        color: "red",
      });
    }
  };
  const handleSocialSignup = async (provider: "google" | "github") => {
    setSocialLoading(provider);
    try {
      if (provider === "google") {
        await signInWithPopup(auth, new GoogleAuthProvider());
      } else if (provider === "github") {
        await signInWithPopup(auth, new GithubAuthProvider());
      }
      setSocialLoading(null);
      router.push("/");
    } catch (error) {
      setSocialLoading(null);
      console.error(`${provider} signup failed:`, error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <Container size="sm" px="md">
        <Paper shadow="md" p="xl" radius="md" maw={420}>
          <form onSubmit={form.onSubmit(handleSignup)}>
            <Stack gap="md">
              <div className="text-center">
                <Title order={2} mb="xs">
                  Create Account
                </Title>
                <Text size="sm" c="dimmed">
                  Sign up to get started with your kanban board
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
              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                key={form.key("confirmPassword")}
                {...form.getInputProps("confirmPassword")}
                required
              />
              <Checkbox
                label={
                  <Text size="sm">
                    I agree to the{" "}
                    <Text
                      component="span"
                      c="blue"
                      td="underline"
                      style={{ cursor: "pointer" }}
                    >
                      Terms of Service
                    </Text>{" "}
                    and{" "}
                    <Text
                      component="span"
                      c="blue"
                      td="underline"
                      style={{ cursor: "pointer" }}
                    >
                      Privacy Policy
                    </Text>
                  </Text>
                }
                key={form.key("agreeToTerms")}
                {...form.getInputProps("agreeToTerms", { type: "checkbox" })}
              />
              <Button fullWidth type="submit" loading={loading} size="md">
                Create Account
              </Button>
              <Divider
                label={
                  <Text size="sm" c="dimmed">
                    or sign up with
                  </Text>
                }
                labelPosition="center"
              />
              <Group grow>
                <Button
                  variant="default"
                  leftSection={<IconBrandGoogle size={16} />}
                  onClick={() => handleSocialSignup("google")}
                  loading={socialLoading === "google"}
                  disabled={socialLoading !== null}
                >
                  Google
                </Button>
                <Button
                  variant="default"
                  leftSection={<IconBrandGithub size={16} />}
                  onClick={() => handleSocialSignup("github")}
                  loading={socialLoading === "github"}
                  disabled={socialLoading !== null}
                >
                  GitHub
                </Button>
              </Group>
              <Group justify="center" gap="xs">
                <Text size="sm" c="dimmed">
                  Already have an account?
                </Text>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => router.push("/login")}
                >
                  Sign in
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Container>
    </div>
  );
}
