import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "נבחרת היועצים — הכנסת פרטים",
  robots: { index: false, follow: false },
};

export default function NavcheretLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
