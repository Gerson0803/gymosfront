import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { MembersProvider } from '@/context/members-context';

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
      <body className="min-h-full bg-slate-100 text-slate-900 font-sans">
        <MembersProvider>
          {children}
          <Toaster position="top-right" />
        </MembersProvider>
      </body>
    </html>
  );
}
