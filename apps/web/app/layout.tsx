import type { Metadata } from "next";
import localFont from "next/font/local";
import AppFrame from "../components/AppFrame";
import "./styles/fonts.scss";
import "./styles/baseStyles.scss";

////////////////////////////
// How to do a local font:
// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
// });

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
        {/* <AppFrame> */}
          {children}
        {/* </AppFrame> */}
      </body>
    </html>
  );
}
