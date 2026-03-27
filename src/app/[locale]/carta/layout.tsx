import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileBottomBar from '@/components/public/MobileBottomBar';

export default function CartaLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <MobileBottomBar />
    </>
  );
}
