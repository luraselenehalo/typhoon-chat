import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { themeBootScript } from "@/lib/theme";
import { SettingsProvider } from "@/lib/useSettings";
import { ThemeProvider } from "@/lib/useTheme";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Typhoon Chat",
  description: "A minimalist Thai-first AI chat interface.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Runs before <body> paints — adds `.dark` class synchronously
            so the user never sees a light flash before the dark theme loads. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-screen bg-paper-200 text-ink-900 font-sans antialiased">
        {/* Settings wraps Theme because Theme's hook is independent of
            language, but having both wrapping every consumer is what allows
            "Save" in SettingsModal to propagate instantly everywhere. */}
        <SettingsProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
