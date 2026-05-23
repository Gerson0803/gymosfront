/** Shared GymOS premium dashboard design tokens (Tailwind class fragments). */
export const premium = {
  pageBg: "bg-[#F5F7FB]",
  card: "rounded-[1.5rem] border border-[#E5EAF3] bg-white shadow-[0_4px_24px_-4px_rgba(10,23,51,0.06)]",
  cardSoft: "rounded-[1.25rem] border border-[#E5EAF3] bg-white shadow-[0_2px_16px_-4px_rgba(10,23,51,0.05)]",
  heading: "text-[#0A1733]",
  subtext: "text-[#5B6475]",
  primary: "text-[#0B57F0]",
  primaryBg: "bg-[#0B57F0]",
  primaryBgHover: "hover:bg-[#0948c9]",
  pillBtn:
    "inline-flex items-center justify-center gap-2 rounded-full bg-[#0B57F0] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0948c9] shadow-sm",
  pillBtnOutline:
    "inline-flex items-center justify-center gap-2 rounded-full border border-[#E5EAF3] bg-white px-5 py-2.5 text-sm font-semibold text-[#0A1733] transition hover:border-[#0B57F0]/30 hover:bg-[#0B57F0]/5",
  searchInput:
    "w-full rounded-full border border-[#E5EAF3] bg-white py-3 pl-11 pr-4 text-sm text-[#0A1733] placeholder:text-[#5B6475]/70 shadow-[0_2px_12px_-4px_rgba(10,23,51,0.04)] outline-none transition focus:border-[#0B57F0]/40 focus:ring-2 focus:ring-[#0B57F0]/10",
  labelCaps: "text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5B6475]",
} as const;
