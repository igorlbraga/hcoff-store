import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import ky from "ky";

export interface MediaAttachment {
  id: string;
  file: File;
  url?: string;
  state: "uploading" | "uploaded" | "failed";
}

export function useMediaUpload() {
  const { toast } = useToast();
  const [attachments, setAttachmanents] = useState<MediaAttachment[]>([]);

  async function startUpload(file: File) {
    const id = crypto.randomUUID();

    setAttachmanents((prev) => [...prev, { id, file, state: "uploading" }]);

    try {
      const { uploadUrl } = await ky
        .get("/api/review/media/upload-url", {
          searchParams: {
            fileName: file.name,
            mimeType: file.type,
          },
        })
        .json<{
          uploadUrl: string;
        }>();

      const {
        file: { url: imageServerUrl },
      } = await ky
        .put(uploadUrl, {
          timeout: false,
          body: file,
          headers: {
            "Content-Type": "application/octet-stream",
          },
          searchParams: {
            filename: file.name,
          },
        })
        .json<{ file: { url: string } }>();

      setAttachmanents((prev) =>
        prev.map((attachment) =>
          attachment.id === id
            ? { ...attachment, state: "uploaded", url: imageServerUrl }
            : attachment,
        ),
      );
    } catch (error) {
      console.error(error);
      setAttachmanents((prev) =>
        prev.map((attachment) =>
          attachment.id === id
            ? { ...attachment, state: "failed" }
            : attachment,
        ),
      );
      toast({
        variant: "destructive",
        description: "Failed to upload file",
      });
    }
  }

  function removeAttachment(id: string) {
    setAttachmanents((prev) =>
      prev.filter((attachment) => attachment.id !== id),
    );
  }

  function clearAttachment() {
    setAttachmanents([]);
  }

  return { attachments, startUpload, removeAttachment, clearAttachment };
}
