import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@context/AuthContext";
import ToastProvider from "@context/ToastContext";

export const metadata: Metadata = {
  title: "Purrfect Timing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
