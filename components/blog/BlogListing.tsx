"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User } from "lucide-react";
import { usePageContent } from "@/lib/usePageContent";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: string;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
}

export default function BlogListing() {
  const [posts,   setPosts]   = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { get }               = usePageContent("blog");

  const heading    = get("hero", "heading",    "Insights & Tips\nfrom Our Experts");
  const subheading = get("hero", "subheading", "Tips, guides and project stories from the SAM Enterprises team.");
  const headingLines = heading.split("\n");

  useEffect(() => {
    fetch("/api/public/blog")
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="px-6 md:px-10 lg:px-16 py-12 md:py-20">
      {/* Hero heading — CMS driven */}
      <div className="mb-10 md:mb-16">
        <p className="label-sm mb-4 tracking-widest opacity-70">Our Blog</p>
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight">
          {headingLines.map((line, i) => (
            <span key={i}>
              {i === 1
                ? <span className="italic font-extralight">{line}</span>
                : line}
              {i < headingLines.length - 1 && <br />}
            </span>
          ))}
        </h1>
        {subheading && (
          <p className="mt-4 text-base text-muted-foreground max-w-xl leading-relaxed">
            {subheading}
          </p>
        )}
      </div>

      {loading && (
        <p className="text-gray-400 text-sm text-center py-10">Loading posts…</p>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-semibold mb-2">No posts yet</p>
          <p className="text-sm">Check back soon for tips, guides and project stories.</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group border border-border rounded-xl overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Cover */}
            <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
              {post.coverImage ? (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs uppercase">No Image</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] font-bold uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <h2 className="font-black text-lg leading-snug group-hover:text-gray-600 transition-colors mb-2">
                {post.title}
              </h2>

              {post.excerpt && (
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-400">
                {post.author && (
                  <span className="flex items-center gap-1">
                    <User size={11} /> {post.author}
                  </span>
                )}
                {(post.publishedAt || post.createdAt) && (
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
