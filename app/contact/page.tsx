import type { Metadata } from "next";
import Header from "@/components/Header";
import SocialSidebar from "@/components/SocialSidebar";
import Footer from "@/components/Footer";
import ContactHero from "@/components/contact/ContactHero";
import ContactStats from "@/components/contact/ContactStats";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactForm from "@/components/contact/ContactForm";
import OfficesSection from "@/components/contact/OfficesSection";

export const metadata: Metadata = {
  title: "Contact — SAM Enterprises",
  description:
    "Get in touch with SAM Enterprises for a free site visit and no-obligation quote. Offices in Chennai, Coimbatore, and Kochi.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <SocialSidebar />

      <main className="pt-0">
        <ContactHero />
        <ContactStats />

        {/* Two-column: info left, form right */}
        <section className="grid grid-cols-1 lg:grid-cols-2 border-b border-border">
          <ContactInfo />
          <ContactForm />
        </section>

        <OfficesSection />
      </main>

      <Footer />
    </div>
  );
}
