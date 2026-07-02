import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { ToastProvider } from "@/context/toast-context";
import { SettingsProvider } from "@/context/settings-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coach Fitness | Fitness Coaching",
  description:
    "Coaching fitness con planificación, seguimiento semanal y un plan claro para sostener tu progreso.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          <SettingsProvider>
            <ToastProvider>{children}</ToastProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
