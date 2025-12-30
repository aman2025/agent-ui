import "./globals.css";

export const metadata = {
  title: "AI Agent Dynamic UI",
  description: "AI-powered agent application with dynamic UI generation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
