import "./globals.css";

export const metadata = {
  title: "AI Agent Dynamic UI",
  description: "AI-powered agent application with dynamic UI generation",
};

/**
 * Root Layout Component
 * Provides the base HTML structure and global styles
 * Requirements: 10.1
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
