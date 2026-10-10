import "./globals.css";
import "./luxe.css";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./components/providers/AuthProvider";

export const metadata = {
  title: "Dimplesluxe | Own The Room",
  description:
    "Discover the Dimplesluxe collection of premium human hair, curated for your next signature look.",
  keywords:
    "human hair, bundles, extensions, premium hair, luxury hair, body wave, curly hair",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#050505",
                color: "#fff",
                borderRadius: "0px",
              },
              success: {
                iconTheme: {
                  primary: "#ff1783",
                  secondary: "#fff",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
