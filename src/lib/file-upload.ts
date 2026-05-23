const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE_MB = 5;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
    return "Solo se permiten imágenes JPG, PNG o WebP.";
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `La imagen no debe superar ${MAX_SIZE_MB} MB.`;
  }
  return null;
}

export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
