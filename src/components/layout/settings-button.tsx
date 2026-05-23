"use client";

import { Settings } from "lucide-react";

type SettingsButtonProps = {
  onClick?: () => void;
};

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Settings"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E5EAF3] bg-white text-[#5B6475] shadow-[0_2px_12px_-4px_rgba(10,23,51,0.08)] transition hover:border-[#0B57F0]/25 hover:bg-[#0B57F0]/5 hover:text-[#0B57F0]"
    >
      <Settings className="h-5 w-5" strokeWidth={1.75} />
    </button>
  );
}
