"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  TextInput,
  Button,
  Title,
  Text,
  Avatar,
  Group,
  Stack,
  Divider,
  Textarea,
  LoadingOverlay,
  FileInput,
  ActionIcon,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconCamera } from "@tabler/icons-react";
import { z } from "zod/v4";
import { useGetMe, useUpdateMe } from "@/hooks/user";
import { presignUrl, uploadFile } from "@/services/upload";
// Zod schema for profile validation
const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  position: z.string().optional().or(z.literal("")), 
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileScreen() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const updateMeMutation = useUpdateMe();
  const router = useRouter();

  // danh sách chức vụ mẫu
  const positions = [
    "Frontend Developer",
    "Backend Developer",
    "Fullstack Developer",
    "Mobile Developer",
    "UI/UX Designer",
    "Tester",
    "Project Manager",
  ];

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Initialize form with Mantine form and Zod resolver
  const form = useForm<ProfileFormValues>({
    initialValues: {
      name: "",
      email: "",
      bio: "",
      phone: "",
    },
    validate: zod4Resolver(profileSchema),
  });

  // Update form values when user data is loaded
  useEffect(() => {
    if (user) {
      form.setValues({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        phone: user.phone || "",
        position: user.position || "",
      });
    }
  }, [user]);

  // Cleanup preview URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleBack = () => {
    router.push("/");
  };

  const handleLogout = () => {
    // Clear any stored auth data here if needed
    router.push("/login");
  };

  const handleAvatarChange = (file: File | null) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        notifications.show({
          title: "Invalid File Type",
          message: "Please select an image file (JPG, PNG, GIF, etc.)",
          color: "red",
        });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        notifications.show({
          title: "File Too Large",
          message: "Please select an image smaller than 5MB",
          color: "red",
        });
        return;
      }
    }

    setAvatarFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      setUploadingAvatar(true);

      // Generate a unique filename
      const timestamp = Date.now();
      const extension = file.name.split(".").pop();
      const filename = `avatars/${user?.id}_${timestamp}.${extension}`;

      const { url: presignedUrl, publicUrl } = await presignUrl(filename);

      await uploadFile(file, presignedUrl);

      return publicUrl;
    } catch (error) {
      console.error("Avatar upload failed:", error);
      throw error;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (values: ProfileFormValues) => {
    try {
      let avatarUrl = user?.avatar;

      // Upload avatar if a new file is selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      await updateMeMutation.mutateAsync({
        name: values.name,
        bio: values.bio || undefined,
        phone: values.phone || undefined,
        position: values.position || undefined,
        avatar: avatarUrl,
      });

      // Clear avatar file and preview after successful update
      setAvatarFile(null);
      setPreviewUrl(null);

      notifications.show({
        title: "Profile Updated",
        message: "Your profile has been successfully updated!",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update profile. Please try again.",
        color: "red",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#111322]">
    {/* // <div className="min-h-screen bg-[#22272e] text-[#adbac7]"> */}

      <Container size="md" py="xl">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          mb="md"
          onClick={handleBack}
        >
          Back to Kanban
        </Button>

        <Paper shadow="md" p="xl" radius="md" pos="relative">
          <LoadingOverlay visible={userLoading} />

          <form onSubmit={form.onSubmit(handleUpdateProfile)}>
            <Stack gap="lg">
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar
                    size={100}
                    radius="xl"
                    src={
                      previewUrl ||
                      user?.avatar ||
                      "https://avatar.iran.liara.run/public/5"
                    }
                    alt="Profile"
                  />
                  <ActionIcon
                    size="md"
                    radius="xl"
                    variant="filled"
                    color="blue"
                    className="absolute bottom-0 right-0"
                    style={{
                      transform: "translate(25%, 25%)",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    }}
                    onClick={() => {
                      const input = document.getElementById(
                        "avatar-upload"
                      ) as HTMLInputElement;
                      input?.click();
                    }}
                  >
                    <IconCamera size={16} />
                  </ActionIcon>
                  <FileInput
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: "none" }}
                  />
                </div>
                <div className="mt-4">
                  <Title order={2}>Profile Settings</Title>
                  <Text size="sm" c="dimmed">
                    Manage your account information
                  </Text>
                </div>
              </div>

              <Divider />

              <Stack gap="md">
                <TextInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  required
                  {...form.getInputProps("name")}
                />

                <TextInput
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  required
                  readOnly
                  {...form.getInputProps("email")}
                  styles={{
                    input: {
                      // backgroundColor: "var(--mantine-color-gray-1)",
                      cursor: "not-allowed",
                    },
                  }}
                />

                <TextInput
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  type="tel"
                  {...form.getInputProps("phone")}
                />

                <Select
                  label="Position"
                  placeholder="Select or enter your position"
                  data={positions.map((p) => ({ value: p, label: p }))}
                  searchable
                  clearable
                  {...form.getInputProps("position")}
                />

                <Textarea
                  label="Bio"
                  placeholder="Tell us about yourself"
                  rows={4}
                  {...form.getInputProps("bio")}
                />
              </Stack>

              <Group justify="space-between">
                <Button variant="outline" color="red" onClick={handleLogout}>
                  Logout
                </Button>
                <Group gap="sm">
                  <Button variant="outline" onClick={handleBack}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={updateMeMutation.isPending || uploadingAvatar}
                  >
                    Update Profile
                  </Button>
                </Group>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Container>
    </div>
  );
}
