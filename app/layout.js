import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata = {
  title: "Legal AI Assistant",
  description:
    "AI-powered legal assistant providing personalized legal information",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        {/* Script to check dark mode preference before page loads to prevent flashing */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Always use dark mode, matching our AppContext setting
                  document.documentElement.classList.add('dark');
                  localStorage.setItem('theme', 'dark');
                } catch (e) {
                  console.error('Error applying theme:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${cairo.variable} antialiased`}>
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
