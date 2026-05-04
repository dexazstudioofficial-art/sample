import Header from "@/components/Header";
import SocialSidebar from "@/components/SocialSidebar";
import HeroSection from "@/components/HeroSection";
import MarqueeBanner from "@/components/MarqueeBanner";
import WhySection from "@/components/WhySection";
import ProductsSection from "@/components/ProductsSection";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import ProjectsGallery from "@/components/ProjectsGallery";
import ProcessSection from "@/components/ProcessSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <SocialSidebar />

      <main className="pt-0">
        <HeroSection />
        <MarqueeBanner />
        <WhySection />
        <ProductsSection />
        <BeforeAfterSection />
        <ProjectsGallery />
        <ProcessSection />
        <TestimonialsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
