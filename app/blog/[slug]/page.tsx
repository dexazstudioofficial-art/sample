import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogPostDetail from "@/components/blog/BlogPostDetail";
import { db } from "@/lib/db";

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.blog.findUnique({ where: { slug, isPublished: true } });
  if (!post) return { title: "Post Not Found" };
  return {
    title:       post.metaTitle || `${post.title} — SAM Enterprises`,
    description: post.metaDesc  || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await db.blog.findUnique({ where: { slug, isPublished: true } });
  if (!post) notFound();

  const serialised = {
    ...post,
    tags:        post.tags        ? JSON.parse(post.tags)        : [],
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt:   post.createdAt.toISOString(),
    updatedAt:   post.updatedAt.toISOString(),
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="pt-0">
        <BlogPostDetail post={serialised} />
      </main>
      <Footer />
    </div>
  );
}
