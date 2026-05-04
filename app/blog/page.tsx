import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogListing from "@/components/blog/BlogListing";

export const metadata: Metadata = {
  title: "Blog — SAM Enterprises",
  description: "Tips, insights and news about UPVC windows, doors and home improvement.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="pt-0">
        <BlogListing />
      </main>
      <Footer />
    </div>
  );
}
