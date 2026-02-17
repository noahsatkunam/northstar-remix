import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Linkedin, Twitter, Mail, Link2, Check, Loader2, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useContactModal } from "@/components/ContactModal";
import { Helmet } from "react-helmet-async";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface Post {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  metaDescription: string;
  ogImage: string;
  author: string;
  status: string;
  publishedAt: string;
  updatedAt: string;
  content: string;
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { openModal } = useContactModal();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/blog/posts/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
          // Fetch related posts
          const allRes = await fetch(`${API}/api/blog/posts?status=published`);
          if (allRes.ok) {
            const all = await allRes.json();
            setRelatedPosts(all.filter((p: Post) => p.slug !== slug && p.category === data.category).slice(0, 3));
          }
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog"><Button>Back to Blog</Button></Link>
        </div>
      </Layout>
    );
  }

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(post.title);
  const readTime = `${Math.max(1, Math.ceil(post.content.replace(/<[^>]+>/g, "").split(/\s+/).length / 200))} min read`;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.metaDescription || post.excerpt,
    "author": { "@type": "Person", "name": post.author },
    "publisher": { "@type": "Organization", "name": "NorthStar Technology Group", "url": "https://northstartechnologygroup.com" },
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://northstartechnologygroup.com/blog/${post.slug}` },
    ...(post.ogImage ? { "image": post.ogImage } : {}),
    "keywords": post.tags?.join(", "),
    "articleSection": post.category,
  };

  return (
    <Layout>
      <Helmet>
        <title>{post.title} | NorthStar Technology Group</title>
        <meta name="description" content={post.metaDescription || post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription || post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://northstartechnologygroup.com/blog/${post.slug}`} />
        {post.ogImage && <meta property="og:image" content={post.ogImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.metaDescription || post.excerpt} />
        <meta name="article:published_time" content={post.publishedAt} />
        <meta name="article:modified_time" content={post.updatedAt} />
        <meta name="article:section" content={post.category} />
        {post.tags?.map(tag => <meta key={tag} name="article:tag" content={tag} />)}
        <link rel="canonical" href={`https://northstartechnologygroup.com/blog/${post.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <article>
        <header className="relative overflow-hidden hero-gradient-bg py-20 md:py-28">
          <div className="absolute inset-0 grain-texture opacity-20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-gradient-shift bg-[length:200%_200%]" aria-hidden="true" />
          <div className="container relative z-10 mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <Link to={`/blog?category=${encodeURIComponent(post.category)}`} className="inline-block rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-colors">
                {post.category}
              </Link>
              <h1 className="mt-8 text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">{post.title}</h1>
              <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-white/10 pt-8">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-bold">
                    {post.author?.charAt(0) || "N"}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-white">{post.author}</span>
                    <span className="block text-xs text-gray-300">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Clock className="h-4 w-4" /> {readTime}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="container mx-auto px-4 lg:px-8 relative z-20 -mt-12 md:-mt-20">
          <div className="mx-auto max-w-5xl">
            {post.ogImage ? (
              <img src={post.ogImage} alt={post.title} className="aspect-video w-full rounded-2xl object-cover shadow-2xl ring-1 ring-black/5" />
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-muted shadow-2xl ring-1 ring-black/5" />
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div
              className="prose prose-lg mx-auto max-w-3xl
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                prose-h2:mt-16 prose-h2:mb-6 prose-h2:text-3xl
                prose-h3:mt-12 prose-h3:mb-4 prose-h3:text-2xl
                prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:mb-8
                prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-bold
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:py-6 prose-blockquote:pl-8 prose-blockquote:pr-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-foreground prose-blockquote:font-medium
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:marker:text-primary
                prose-img:rounded-xl prose-img:shadow-lg
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="border-t border-border/50 bg-background pb-8">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mx-auto max-w-3xl flex flex-wrap gap-2 pt-8">
                {post.tags.map(tag => (
                  <span key={tag} className="inline-block bg-muted px-3 py-1 rounded-full text-xs font-medium text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Social Share */}
        <div className="border-y border-border/50 bg-muted/30 py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-bold text-foreground uppercase tracking-wide">Share this article</span>
              <div className="flex items-center gap-3">
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:border-primary hover:text-primary hover:-translate-y-1" aria-label="Share on LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:border-primary hover:text-primary hover:-translate-y-1" aria-label="Share on Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href={`mailto:?subject=${shareTitle}&body=${shareUrl}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:border-primary hover:text-primary hover:-translate-y-1" aria-label="Share via Email">
                  <Mail className="h-4 w-4" />
                </a>
                <button onClick={handleCopyLink} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:border-primary hover:text-primary hover:-translate-y-1" aria-label="Copy link">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Author Bio */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-3xl rounded-2xl border border-border/50 bg-card p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-8 sm:flex-row items-center sm:items-start">
                <div className="h-24 w-24 shrink-0 rounded-full bg-muted ring-4 ring-background flex items-center justify-center text-3xl font-bold text-muted-foreground">
                  {post.author?.charAt(0) || "N"}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Written by</p>
                  <h3 className="text-xl font-bold text-foreground">{post.author}</h3>
                  <p className="text-sm font-medium text-primary mb-4">NorthStar Technology Group</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 md:py-24 bg-muted/30 border-t border-border/50">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-center text-3xl font-bold text-foreground mb-12">Related Articles</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rp) => (
                <article key={rp.slug} className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {rp.ogImage && (
                      <img src={rp.ogImage} alt={rp.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-primary/10 transition-opacity opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="mb-3 inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">{rp.category}</span>
                    <h3 className="mb-3 text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">{rp.title}</h3>
                    <p className="mb-6 flex-1 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{rp.excerpt}</p>
                    <div className="mt-auto">
                      <Link to={`/blog/${rp.slug}`} className="inline-flex items-center text-sm font-bold text-primary group-hover:underline">
                        Read more <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Resources */}
      <section className="py-16 md:py-20 bg-background border-t border-border/50">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-foreground mb-10">Explore More Resources</h2>
          <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
            <Link to="/risk-assessment" className="group rounded-2xl border border-border/50 bg-card p-6 text-center hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Free Security Assessment</h3>
              <p className="text-sm text-muted-foreground mb-3">Discover vulnerabilities before attackers do.</p>
              <span className="inline-flex items-center text-sm font-semibold text-primary">
                Get Started <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link to="/dmarc-checker" className="group rounded-2xl border border-border/50 bg-card p-6 text-center hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Check Your Email Security</h3>
              <p className="text-sm text-muted-foreground mb-3">Verify your DMARC, SPF, and DKIM in seconds.</p>
              <span className="inline-flex items-center text-sm font-semibold text-primary">
                Run Check <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <button onClick={openModal} className="group rounded-2xl border border-border/50 bg-card p-6 text-center hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 w-full">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Book a 15-Min Consultation</h3>
              <p className="text-sm text-muted-foreground mb-3">Talk to an expert, no obligation.</p>
              <span className="inline-flex items-center text-sm font-semibold text-primary">
                Book Now <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 overflow-hidden hero-gradient-bg text-center">
        <div className="absolute inset-0 grain-texture opacity-20 pointer-events-none" />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl mb-6">Need Help With Your Technology Strategy?</h2>
            <p className="text-xl text-gray-300 mb-10">Our experts can help you assess your current posture and build a roadmap for success.</p>
            <Button size="lg" className="h-14 px-10 text-lg bg-white text-black hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-1" onClick={openModal}>
              Talk to an Expert
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
