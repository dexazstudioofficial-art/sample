import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Pristine Windows CMS",
  robots: "noindex, nofollow",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-950 text-gray-100 min-h-screen">{children}</div>
  );
}
