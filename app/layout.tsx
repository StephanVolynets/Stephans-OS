import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/ThemeProvider";
import { FileSystemProvider } from "@/contexts/FileSystemContext";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StephOS',
  description: 'Created by Stephan Volynets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FileSystemProvider>
            {children}
          </FileSystemProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}