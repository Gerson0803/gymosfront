import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { MembersProvider } from '@/context/members-context';
import { AppSettingsProvider } from '@/context/app-settings-context';
import TitleUpdater from '@/components/layout/title-updater';
import DoomOverlay from '@/components/easter-eggs/DoomOverlay';
import { ToastController } from '@/components/ui/toast-controller';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
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
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-slate-900 font-sans transition-colors">
        <AppSettingsProvider>
          <MembersProvider>
            <TitleUpdater />
            {children}
            <ToastController />
            <Toaster position="top-right" />
            <DoomOverlay />
          </MembersProvider>
        </AppSettingsProvider>
      </body>
    </html>
  );
}
