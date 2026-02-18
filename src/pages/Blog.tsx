import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlogPostCard } from "@/components/ui/BlogPostCard";
import { ArrowRight, Mail, ChevronDown, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

const API = import.meta.env.VITE_BACKEND_URL || "https://northstar-backend-frnb.onrender.com";

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

      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient-bg py-20 md:py-28">
        <div className="absolute inset-0 grain-texture opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-gradient-shift bg-[length:200%_200%]" aria-hidden="true" />
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-float" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
              Insights & <span className="text-gradient">Resources</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 animate-fade-in-up leading-relaxed" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              Practical guidance on IT, cybersecurity, compliance, and business technology
            </p>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle opacity-50">
          <ChevronDown className="h-6 w-6 text-white" />
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-16 md:py-20 bg-background relative -mt-10 z-20">
          <div className="container mx-auto px-4 lg:px-8">
            <Link to={`/blog/${featuredPost.slug}`} className="block">
              <article className="group grid gap-8 rounded-3xl border border-border/50 bg-card shadow-lg transition-all duration-500 hover:shadow-2xl hover:border-primary/20 lg:grid-cols-2 overflow-hidden">
                <div className="overflow-hidden relative h-full min-h-[300px]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 lg:hidden" />
                  {featuredPost.ogImage ? (
                    <img src={featuredPost.ogImage} alt={featuredPost.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full bg-muted transition-transform duration-700 group-hover:scale-105" />
                  )}
                  <div className="absolute bottom-6 left-6 z-20 lg:hidden">
                    <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm">{featuredPost.category}</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-8 lg:p-12">
                  <span className="hidden lg:inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-6">{featuredPost.category}</span>
                  <h2 className="text-3xl font-bold text-card-foreground md:text-4xl leading-tight group-hover:text-primary transition-colors">{featuredPost.title}</h2>
                  <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{featuredPost.excerpt}</p>
                  <div className="mt-8">
                    <span className="inline-flex items-center text-sm font-bold text-primary group-hover:underline">
                      Read Article <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="border-b border-border bg-background pb-8 sticky top-[72px] z-30 pt-4 backdrop-blur-md bg-background/80 supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                  activeCategory === category ? "bg-primary text-primary-foreground shadow-md scale-105" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {displayedPosts.map((post, index) => (
                  <>
                    <div key={post.slug} className="h-full" style={{ animationDelay: `${index * 50}ms` }}>
                      <BlogPostCard
                        category={post.category}
                        title={post.title}
                        excerpt={post.excerpt}
                        image={post.ogImage || undefined}
                        href={`/blog/${post.slug}`}
                        className="h-full rounded-2xl border-border/50 bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                      />
                    </div>
                    {/* CTA removed - was disruptive between blog cards */}
                  </>
                ))}
              </div>
              {hasMorePosts && (
                <div className="mt-16 text-center">
                  <Button variant="outline" size="lg" onClick={handleLoadMore} className="rounded-full px-8 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                    Load More Posts
                  </Button>
                </div>
              )}
              {displayedPosts.length === 0 && !loading && (
                <div className="py-20 text-center text-muted-foreground">
                  <p className="text-xl">No posts found in this category.</p>
                  <Button variant="link" onClick={() => setActiveCategory("All")} className="mt-4">View all posts</Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative overflow-hidden hero-gradient-bg py-20">
        <div className="absolute inset-0 grain-texture opacity-20 pointer-events-none" />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-sm mb-6">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Get IT Insights Delivered to Your Inbox</h2>
            <p className="text-gray-300 mb-8 text-lg">Subscribe for practical tips, industry updates, and expert guidance.</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Input type="email" placeholder="Enter your email" className="sm:w-80 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-white/30" />
              <Button className="h-12 px-8 bg-white text-black hover:bg-white/90 font-semibold">Subscribe</Button>
            </div>
            <p className="mt-4 text-xs text-gray-400">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
