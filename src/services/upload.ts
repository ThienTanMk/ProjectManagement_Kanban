import { instance } from "./axios";

export async function presignUrl(
  filename: string
): Promise<{ url: string; publicUrl: string }> {
  const res = await instance.post("/uploads/presign", { filename });
  return res.data;
}

export async function uploadFile(
  file: File,
  presignedUrl: string
): Promise<void> {
  const blob = new Blob([file], { type: file.type });

  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: blob,
  });

  if (!res.ok) {
    throw new Error("Failed to upload file");
  }
}
