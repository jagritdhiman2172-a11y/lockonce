import "./globals.css";
import HologramBackground from "../components/HologramBackground";

export const metadata = {
  title: "LockOnce | 3D Holographic Event & Seat Lock System",
  description: "Experience the next-gen 3D holographic seat booking platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <HologramBackground />
        <div className="app-content-root">{children}</div>
      </body>
    </html>
  );
}
