"use client";

import { useEffect, useId, useRef } from "react";
import { Upload, X } from "lucide-react";
import { IMAGE_ACCEPT, validateImageFile } from "@/lib/file-upload";
import { ProfileAvatar } from "./profile-avatar";
import { deleteFromS3 } from "@/lib/s3";
import toast from "react-hot-toast";

type PhotoUploadProps = {
  value: string;
  onChange: (url: string) => void;
  name?: string;
  onRevoke?: (url: string) => void;
};

export function PhotoUpload({
  value,
  onChange,
  name = "Usuario",
  onRevoke,
}: PhotoUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (value.startsWith("blob:")) {
        URL.revokeObjectURL(value);
        onRevoke?.(value);
      }
    };
  }, [value, onRevoke]);

  const handleFile = (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    if (value.startsWith("blob:")) {
      URL.revokeObjectURL(value);
    }
    onChange(URL.createObjectURL(file));
  };

  const handleRemove = async () => {
    if (value.startsWith("blob:")) {
      URL.revokeObjectURL(value);
    } else if (value.includes("amazonaws.com")) {
      try {
        const key = value.split(".com/")[1];
        await deleteFromS3(key);
      } catch (err) {
        console.error("Error deleting from S3:", err);
      }
    }
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <span className="block text-sm font-medium text-[#0A1733]">Foto</span>
      <div className="flex items-center gap-4">
        <ProfileAvatar photoUrl={value || null} name={name} size="lg" />
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={IMAGE_ACCEPT}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E5EAF3] bg-white px-4 py-2 text-sm font-semibold text-[#0A1733] transition hover:border-[#0B57F0]/30 hover:bg-[#0B57F0]/5"
          >
            <Upload className="h-4 w-4 text-[#0B57F0]" strokeWidth={1.75} />
            Subir Foto
          </button>
          {value ? (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#5B6475] transition hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
              Quitar foto
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
