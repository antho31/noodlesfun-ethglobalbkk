import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import Providers from "@/components/Providers";
import "@/styles/globals.css";
import { getMetadata } from "@/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Scaffold-ETH 2 App",
  description: "Built with 🏗 Scaffold-ETH 2",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
