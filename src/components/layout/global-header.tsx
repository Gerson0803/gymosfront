"use client";

import { SettingsButton } from "./settings-button";

type GlobalHeaderProps = {
  userDisplayName: string;
};

export function GlobalHeader({ userDisplayName }: GlobalHeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-end sm:mb-8">
      <div className="flex min-w-0 items-center gap-2 rounded-full border border-[#E5EAF3] bg-white/90 px-2.5 py-2 shadow-[0_8px_24px_-12px_rgba(10,23,51,0.18)] backdrop-blur sm:gap-3 sm:px-3">
        {userDisplayName ? (
          <span className="max-w-[180px] truncate px-1 text-sm font-semibold tracking-tight text-[#0A1733] sm:max-w-[260px] sm:text-[15px]">
            {userDisplayName}
          </span>
        ) : null}
        <SettingsButton />
      </div>
    </header>
  );
}
