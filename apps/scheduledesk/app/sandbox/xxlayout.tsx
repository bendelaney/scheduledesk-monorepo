import type { Metadata } from "next";
// Using page-level styles instead of global

export const metadata: Metadata = {
  title: "ScheduleDesk",
  description: "Scheduling and team management platform for Jobber",
};

export default function SandboxLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="sandbox-layout">
      {children}
    </div>
  );
}
