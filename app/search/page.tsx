import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchResults from "@/components/search/SearchResults";

export const metadata: Metadata = {
  title: "Search — SAM Enterprises",
  description: "Search products and services from SAM Enterprises",
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="pt-20">
        <Suspense fallback={<div className="px-6 py-20 text-center text-gray-400">Loading…</div>}>
          <SearchResults />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
