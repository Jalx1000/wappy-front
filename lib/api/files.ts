import { getSession } from "next-auth/react";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100";

export type UploadedFile = {
  id: string;
  path: string;
};

export class UploadError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

export const filesApi = {
  upload: async (file: File): Promise<UploadedFile> => {
    if (typeof window === "undefined") {
      throw new UploadError(0, "filesApi.upload solo funciona en cliente");
    }
    const session = await getSession();
    const token = session?.user?.accessToken;
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${BASE_URL}/api/v1/files/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });

    if (!res.ok) {
      let parsed: unknown;
      try {
        parsed = await res.json();
      } catch {
        // ignore
      }
      let msg = `Upload falló (${res.status})`;
      if (parsed && typeof parsed === "object") {
        const errs = (parsed as { errors?: Record<string, string> }).errors;
        if (errs?.file === "cantUploadFileType") {
          msg = "Tipo de archivo no permitido. Usa imagen o PDF.";
        } else if (errs) {
          msg = Object.values(errs).join(", ");
        }
      }
      throw new UploadError(res.status, msg, parsed);
    }

    const json = (await res.json()) as { file: UploadedFile };
    return json.file;
  },
};
