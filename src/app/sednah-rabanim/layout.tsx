import { MetaPixel } from "@/components/MetaPixel";

export default function SednahRabanimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MetaPixel />
      {children}
    </>
  );
}
