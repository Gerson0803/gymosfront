"use client";

import Image from "next/image";
import { User } from "lucide-react";

type ProfileAvatarProps = {
  photoUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: { box: "h-12 w-12", icon: "h-5 w-5", text: "text-sm", px: 16 },
  md: { box: "h-16 w-16", icon: "h-7 w-7", text: "text-base", px: 64 },
  lg: { box: "h-24 w-24", icon: "h-10 w-10", text: "text-xl", px: 96 },
};

function hasPhoto(url?: string | null): url is string {
  return Boolean(url?.trim());
}

export function ProfileAvatar({
  photoUrl,
  name,
  size = "md",
  className = "",
}: ProfileAvatarProps) {
  const s = sizeMap[size];
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (hasPhoto(photoUrl) && photoUrl.startsWith("blob:")) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-2xl border border-[#E5EAF3] bg-[#F5F7FB] ${s.box} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }

  if (hasPhoto(photoUrl)) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-2xl border border-[#E5EAF3] bg-[#F5F7FB] ${s.box} ${className}`}
      >
        <Image
          src={photoUrl}
          alt={name}
          fill
          className="object-cover"
          sizes={`${s.px}px`}
          unoptimized={photoUrl.startsWith("data:") || photoUrl.includes("amazonaws.com")}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl border border-dashed border-[#E5EAF3] bg-[#F5F7FB] text-[#5B6475] ${s.box} ${className}`}
      aria-hidden
    >
      <User className={s.icon} strokeWidth={1.5} />
      <span className="sr-only">{initial}</span>
    </div>
  );
}
