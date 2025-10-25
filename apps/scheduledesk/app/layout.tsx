import type { Metadata } from "next";
import "./styles/fonts.scss";
import "./styles/baseStyles.scss";
import "./styles/scheduleDeskGlobal.scss";
import { KeyboardShortcutProvider } from "@/contexts/KeyboardShortcutContext";

export const metadata: Metadata = {
  title: "ScheduleDesk",
  description: "Scheduling and team management platform for Jobber",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <KeyboardShortcutProvider>
          {children}
        </KeyboardShortcutProvider>
      </body>
    </html>
  );
}
