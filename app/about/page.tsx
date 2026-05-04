import type { Metadata } from "next";
import Header from "@/components/Header";
import SocialSidebar from "@/components/SocialSidebar";
import Footer from "@/components/Footer";
import AboutHero from "@/components/about/AboutHero";
import AboutStats from "@/components/about/AboutStats";
import FounderSection from "@/components/about/FounderSection";
import ValuesSection from "@/components/about/ValuesSection";
import TimelineSection from "@/components/about/TimelineSection";
import AwardsSection from "@/components/about/AwardsSection";
import AboutCTA from "@/components/about/AboutCTA";

export const metadata: Metadata = {
  title: "About Us — SAM Enterprises",
  description:
    "From a small fabrication unit in Chennai to South India's most trusted UPVC fenestration company. Learn about our story, values, and team.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <SocialSidebar />

      <main className="pt-0">
        <AboutHero />
        <AboutStats />
        <FounderSection />
        <ValuesSection />
        <TimelineSection />
        <AwardsSection />
        <AboutCTA />
      </main>

      <Footer />
    </div>
  );
}
