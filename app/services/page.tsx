import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCatalogue from "@/components/services/ServiceCatalogue";

export const metadata: Metadata = {
  title: "Services — SAM Enterprises",
  description: "Browse our complete range of professional UPVC services — consultation, fabrication, installation and maintenance.",
  alternates: { canonical: "https://samenterprises.com/services" },
  openGraph: {
    title:       "Services — SAM Enterprises",
    description: "Complete UPVC service solutions from SAM Enterprises.",
    url:         "https://samenterprises.com/services",
  },
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="pt-16 md:pt-20">
        {/* Hero */}
        <section className="px-6 md:px-10 lg:px-16 py-16 border-b border-border">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            What We Offer
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Our Services
            <br />
            <span className="italic font-extralight">Built Around You</span>
          </h1>
          <p className="mt-4 text-base text-gray-500 max-w-xl leading-relaxed">
            From free site consultation to professional installation and after-sales support —
            every service is designed to give you a seamless experience.
          </p>
        </section>

        <ServiceCatalogue />
      </main>
      <Footer />
    </div>
  );
}
