import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlogPostCard } from "@/components/ui/BlogPostCard";
import { ArrowRight, Mail, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const categories = [
  "All",
  "Cybersecurity",
  "Compliance",
  "AI & Automation",
  "IT Strategy",
  "News & Updates",
];

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  ogImage: string;
  tags: string[];
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [visiblePosts, setVisiblePosts] = useState(6);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/blog/posts?status=published`);
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  const featuredPost = posts[0];
  const remainingPosts = filteredPosts.slice(activeCategory === "All" ? 1 : 0);
  const displayedPosts = remainingPosts.slice(0, visiblePosts);
  const hasMorePosts = visiblePosts < remainingPosts.length;

  const handleLoadMore = () => setVisiblePosts((prev) => prev + 6);
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setVisiblePosts(6);
  };

  return (
    <Layout>
      <Helmet>
        <title>Blog - Insights & Resources | NorthStar Technology Group</title>
        <meta name="description" content="Practical guidance on IT, cybersecurity, compliance, and business technology from NorthStar Technology Group." />
        <meta property="og:title" content="Blog - NorthStar Technology Group" />
        <meta property="og:description" content="Practical guidance on IT, cybersecurity, compliance, and business technology." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://northstartechnologygroup.com/blog" />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 pt-32 md:pt-36">
        <div className="absolute inset-0">
          <div className="absolute inset-0 dot-pattern opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50vw] h-[50vw] bg-primary/[0.05] rounded-full blur-[120px]" />
        </div>
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl mb-6">
              Insights & <span className="text-gradient">Resources</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Practical guidance on IT, cybersecurity, compliance, and business technology.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12 md:py-16 relative">
          <div className="container mx-auto px-4 lg:px-8">
            <Link to={`/blog/${featuredPost.slug}`} className="block">
              <article className="group grid gap-0 rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:border-primary/30 lg:grid-cols-2 overflow-hidden">
                <div className="overflow-hidden relative h-full min-h-[280px]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 lg:hidden" />
                  {featuredPost.ogImage ? (
                    <img src={featuredPost.ogImage} alt={featuredPost.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                  <div className="absolute bottom-4 left-4 z-20 lg:hidden">
                    <span className="inline-block rounded-md bg-primary px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">{featuredPost.category}</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-8 lg:p-10">
                  <span className="hidden lg:inline-block w-fit rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-5">{featuredPost.category}</span>
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-primary transition-colors">{featuredPost.title}</h2>
                  <p className="mt-4 text-muted-foreground leading-relaxed">{featuredPost.excerpt}</p>
                  <div className="mt-6">
                    <span className="inline-flex items-center text-sm font-semibold text-primary">
                      Read Article <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="border-b border-border/30 pb-6 sticky top-[72px] z-30 pt-4 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? "bg-primary text-white"
                    : "bg-white/[0.04] text-muted-foreground hover:text-foreground hover:bg-white/[0.08]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayedPosts.map((post, index) => (
                  <div key={post.slug} className="h-full">
                    <BlogPostCard
                      category={post.category}
                      title={post.title}
                      excerpt={post.excerpt}
                      image={post.ogImage || undefined}
                      href={`/blog/${post.slug}`}
                      className="h-full rounded-2xl border-border/50 bg-card hover:border-primary/30 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
              {hasMorePosts && (
                <div className="mt-12 text-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLoadMore}
                    className="rounded-xl px-7 border-border/60 bg-white/[0.03] hover:bg-white/[0.06]"
                  >
                    Load More Posts
                  </Button>
                </div>
              )}
              {displayedPosts.length === 0 && !loading && (
                <div className="py-20 text-center text-muted-foreground">
                  <p className="text-lg">No posts found in this category.</p>
                  <Button variant="link" onClick={() => setActiveCategory("All")} className="mt-4">View all posts</Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-accent/5" />
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
              <Mail className="h-7 w-7" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Get IT Insights Delivered</h2>
            <p className="text-muted-foreground mb-8">Subscribe for practical tips, industry updates, and expert guidance.</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Input
                type="email"
                placeholder="Enter your email"
                className="sm:w-72 h-11 bg-white/[0.04] border-border/50 placeholder:text-muted-foreground/50"
              />
              <Button className="h-11 px-6 bg-primary hover:bg-primary/90">Subscribe</Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground/60">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
