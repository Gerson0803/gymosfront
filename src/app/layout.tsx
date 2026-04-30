import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { MembersProvider } from '@/context/members-context';
import { AppSettingsProvider } from '@/context/app-settings-context';
import TitleUpdater from '@/components/layout/title-updater';

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GymOS",
  description: "Gym management dashboard for member retention tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-slate-900 font-sans transition-colors">
        <AppSettingsProvider>
          <MembersProvider>
            <TitleUpdater />
            {children}
            <Toaster position="top-right" />
          </MembersProvider>
        </AppSettingsProvider>
      </body>
    </html>
  );
}
