"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowLeft } from "lucide-react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
}

export default function BlogPostDetail({ post }: { post: BlogPost }) {
  return (
    <article className="max-w-3xl mx-auto px-6 md:px-10 py-16">
      {/* Back */}
      <Link href="/blog"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-10 transition-colors">
        <ArrowLeft size={14} /> Back to Blog
      </Link>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((t) => (
            <span key={t} className="text-[10px] font-bold uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
        {post.title}
      </h1>

      {/* Meta */}
      <div className="flex items-center gap-5 text-sm text-gray-400 mb-8">
        {post.author && (
          <span className="flex items-center gap-1.5">
            <User size={13} /> {post.author}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar size={13} />
          {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("en-IN", {
            day: "numeric", month: "long", year: "numeric",
          })}
        </span>
      </div>

      {/* Cover */}
      {post.coverImage && (
        <div className="relative aspect-[16/9] mb-10 overflow-hidden rounded-xl">
          <Image src={post.coverImage} alt={post.title} fill
            className="object-cover" priority />
        </div>
      )}

      {/* Excerpt */}
      {post.excerpt && (
        <p className="text-lg text-gray-600 leading-relaxed mb-8 border-l-4 border-gray-200 pl-4 italic">
          {post.excerpt}
        </p>
      )}

      {/* Content — rendered as preformatted text / simple paragraphs */}
      {post.content ? (
        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
          {post.content}
        </div>
      ) : (
        <p className="text-gray-400 text-sm italic">No content yet.</p>
      )}

      {/* Footer CTA */}
      <div className="mt-16 pt-10 border-t border-gray-200">
        <p className="text-xs uppercase text-gray-400 mb-3">Ready to get started?</p>
        <Link href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-black uppercase tracking-widest hover:bg-gray-800 transition-colors">
          Get a Free Quote
        </Link>
      </div>
    </article>
  );
}
