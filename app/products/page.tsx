import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductsHero from "@/components/products/ProductsHero";
import ProductCatalogue from "@/components/products/ProductCatalogue";
import ProductFeatures from "@/components/products/ProductFeatures";
import ProductsCTA from "@/components/products/ProductsCTA";

export const metadata: Metadata = {
  title: "Products — SAM Enterprises",
  description: "Browse our complete range of custom UPVC windows and doors.",
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="pt-0">
        <ProductsHero />
        <ProductCatalogue />
        <ProductFeatures />
        <ProductsCTA />
      </main>
      <Footer />
    </div>
  );
}
