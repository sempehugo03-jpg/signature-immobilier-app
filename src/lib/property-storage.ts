import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const PROPERTY_PHOTOS_BUCKET = "property-photos";
export const PROPERTY_DOCUMENTS_BUCKET = "property-documents";

const PHOTO_MAX_SIZE = 10 * 1024 * 1024;
const DOCUMENT_MAX_SIZE = 20 * 1024 * 1024;

const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedDocumentTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export type UploadedPropertyFile = {
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
};

export type PropertyUploadErrorCode =
  | "supabase_not_configured"
  | "file_too_large"
  | "invalid_file_type"
  | "upload_failed";

export class PropertyUploadError extends Error {
  code: PropertyUploadErrorCode;

  constructor(code: PropertyUploadErrorCode, message: string) {
    super(message);
    this.name = "PropertyUploadError";
    this.code = code;
  }
}

export async function uploadPropertyPhoto({
  agencySlug,
  propertyId,
  file,
}: {
  agencySlug: string;
  propertyId: string;
  file: File;
}) {
  validatePropertyFile(file, {
    maxSize: PHOTO_MAX_SIZE,
    allowedTypes: allowedPhotoTypes,
  });

  return uploadPropertyFile({
    bucket: PROPERTY_PHOTOS_BUCKET,
    agencySlug,
    propertyId,
    file,
  });
}

export async function uploadPropertyDocument({
  agencySlug,
  propertyId,
  file,
}: {
  agencySlug: string;
  propertyId: string;
  file: File;
}) {
  validatePropertyFile(file, {
    maxSize: DOCUMENT_MAX_SIZE,
    allowedTypes: allowedDocumentTypes,
  });

  return uploadPropertyFile({
    bucket: PROPERTY_DOCUMENTS_BUCKET,
    agencySlug,
    propertyId,
    file,
  });
}

export async function deletePropertyPhotoFile(path?: string) {
  return deletePropertyStorageFile(PROPERTY_PHOTOS_BUCKET, path);
}

export async function deletePropertyDocumentFile(path?: string) {
  return deletePropertyStorageFile(PROPERTY_DOCUMENTS_BUCKET, path);
}

export function getPropertyUploadErrorMessage(
  error: unknown,
  kind: "photo" | "document",
) {
  if (error instanceof PropertyUploadError) {
    if (error.code === "file_too_large") return "Fichier trop lourd.";
    if (error.code === "invalid_file_type")
      return "Type de fichier non autorisé.";
    if (
      error.code === "supabase_not_configured" ||
      error.code === "upload_failed"
    ) {
      return error.message;
    }
  }

  return kind === "photo"
    ? "Impossible d’envoyer une photo."
    : "Impossible d’envoyer le document.";
}

async function uploadPropertyFile({
  bucket,
  agencySlug,
  propertyId,
  file,
}: {
  bucket: string;
  agencySlug: string;
  propertyId: string;
  file: File;
}): Promise<UploadedPropertyFile> {
  if (!isSupabaseConfigured) {
    throw new PropertyUploadError(
      "supabase_not_configured",
      "Impossible d’envoyer le fichier. Vérifiez la configuration Supabase Storage.",
    );
  }

  const path = buildPropertyStoragePath({ agencySlug, propertyId, file });
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) {
    console.warn("Property file upload failed", error);
    throw new PropertyUploadError(
      "upload_failed",
      "Impossible d’envoyer le fichier. Vérifiez la configuration Supabase Storage.",
    );
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

async function deletePropertyStorageFile(bucket: string, path?: string) {
  if (!path || !isSupabaseConfigured) return;

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.info("Suppression Storage non finalisée", error);
  }
}

function validatePropertyFile(
  file: File,
  {
    maxSize,
    allowedTypes,
  }: { maxSize: number; allowedTypes: ReadonlySet<string> },
) {
  if (file.size > maxSize) {
    throw new PropertyUploadError("file_too_large", "Fichier trop lourd.");
  }

  if (!allowedTypes.has(file.type)) {
    throw new PropertyUploadError(
      "invalid_file_type",
      "Type de fichier non autorisé.",
    );
  }
}

function buildPropertyStoragePath({
  agencySlug,
  propertyId,
  file,
}: {
  agencySlug: string;
  propertyId: string;
  file: File;
}) {
  const extension = getFileExtension(file.name);
  const basename = stripFileExtension(file.name);
  const uniqueName = [
    Date.now(),
    safeStorageSegment(basename || "fichier"),
    randomSuffix(),
  ]
    .filter(Boolean)
    .join("-");

  return [
    safeStorageSegment(agencySlug || "agence"),
    safeStorageSegment(propertyId || "bien"),
    `${uniqueName}${extension}`,
  ].join("/");
}

function getFileExtension(name: string) {
  const extension = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  return extension ? extension.toLowerCase().replace(/[^a-z0-9.]/g, "") : "";
}

function stripFileExtension(name: string) {
  return name.includes(".") ? name.slice(0, name.lastIndexOf(".")) : name;
}

function safeStorageSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function randomSuffix() {
  if (globalThis.crypto && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID().slice(0, 8);
  }

  return Math.random().toString(36).slice(2, 10);
}
