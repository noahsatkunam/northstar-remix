import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Play, Bell, ChevronDown, ArrowRight, Users } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import { Helmet } from "react-helmet-async";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface Speaker {
  name: string;
  title: string;
  image?: string;
}

interface Webinar {
  title: string;
  slug: string;
  description: string;
  type: "upcoming" | "past";
  youtubeUrl: string;
  registrationUrl: string;
  date: string;
  duration: string;
  speakers: Speaker[];
  topics: string[];
  content?: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getEventJsonLd(webinars: Webinar[]) {
  return webinars
    .filter(w => w.type === "upcoming")
    .map(w => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: w.title,
      description: w.description,
      startDate: w.date,
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: { "@type": "VirtualLocation", url: w.registrationUrl || "" },
      organizer: { "@type": "Organization", name: "Northstar Technology Group", url: "https://northstartechnologygroup.com" },
      performer: w.speakers?.map(s => ({ "@type": "Person", name: s.name })) || [],
    }));
}

function FeaturedWebinarSection() {
  const [featured, setFeatured] = useState<any>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem("site_settings_cache");
    if (cached) {
      try { setFeatured(JSON.parse(cached).featuredWebinar); return; } catch {}
    }
    fetch(`${API}/api/settings`)
      .then(r => r.json())
      .then(data => {
        sessionStorage.setItem("site_settings_cache", JSON.stringify(data));
        setFeatured(data.featuredWebinar);
      })
      .catch(() => {});
  }, []);

  if (!featured?.enabled) return null;

  return (
    <section className="relative -mt-10 z-20 pb-0">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 shadow-2xl">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="relative p-8 md:p-12 lg:p-16">
            <div className="flex items-center gap-2 mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm font-bold uppercase tracking-wider text-red-500">Featured Live Event</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 max-w-3xl">{featured.title}</h2>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium text-primary">
                <Calendar className="h-4 w-4" /> {featured.date}
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium text-primary">
                <Clock className="h-4 w-4" /> {featured.time}
              </div>
            </div>

            <p className="text-lg text-muted-foreground mb-8 max-w-3xl leading-relaxed">{featured.description}</p>

            <div className="flex flex-wrap gap-8 mb-8 border-t border-border/50 pt-8">
              {featured.speaker?.name && (
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                    {featured.speaker.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Speaker</p>
                    <p className="font-bold text-foreground">{featured.speaker.name}</p>
                    <p className="text-sm text-muted-foreground">{featured.speaker.title}</p>
                    {featured.speaker.bio && <p className="text-xs text-muted-foreground mt-1 max-w-md">{featured.speaker.bio}</p>}
                  </div>
                </div>
              )}
              {featured.host?.name && (
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent font-bold text-lg">
                    {featured.host.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Host</p>
                    <p className="font-bold text-foreground">{featured.host.name}</p>
                    <p className="text-sm text-muted-foreground">{featured.host.title}</p>
                  </div>
                </div>
              )}
            </div>

            {featured.registrationLink && (
              <a href={featured.registrationLink} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="rounded-full px-10 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  Register Now - It's Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Webinars() {
  const { openModal } = useContactModal();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/webinars?status=published`);
        const data = await res.json();
        setWebinars(data);
      } catch (err) {
        console.error("Failed to fetch webinars:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const upcoming = webinars.filter(w => w.type === "upcoming");
  const past = webinars.filter(w => w.type === "past");
  const jsonLd = getEventJsonLd(upcoming);

  return (
    <Layout>
      <Helmet>
        <title>Webinars | Northstar Technology Group</title>
        <meta name="description" content="Free webinars on IT strategy, cybersecurity, compliance, and emerging technology from Northstar Technology Group." />
        <meta property="og:title" content="Webinars | Northstar Technology Group" />
        <meta property="og:description" content="Free webinars on IT strategy, cybersecurity, compliance, and emerging technology." />
        {jsonLd.length > 0 && (
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        )}
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient-bg py-20 md:py-28 lg:py-32">
        <div className="absolute inset-0 grain-texture opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-gradient-shift bg-[length:200%_200%]" aria-hidden="true" />
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-float" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
              Learn From the <span className="text-gradient">Experts</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 md:text-xl animate-fade-in-up leading-relaxed" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              Free webinars on IT strategy, cybersecurity, compliance, and emerging technology
            </p>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-subtle opacity-50">
          <ChevronDown className="h-8 w-8 text-white" />
        </div>
      </section>

      {/* Featured Webinar */}
      <FeaturedWebinarSection />

      {/* Upcoming Webinars */}
      <section className="py-20 md:py-28 bg-background relative -mt-10 z-20">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12">Upcoming Events</h2>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading webinars...</div>
          ) : upcoming.length > 0 ? (
            <div className="grid gap-8 lg:grid-cols-2">
              {upcoming.map((webinar, index) => (
                <div key={webinar.slug} className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-lg transition-all duration-500 hover:shadow-2xl hover:border-primary/20 hover:-translate-y-1" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {webinar.ogImage && <img src={webinar.ogImage} alt={webinar.title} className="absolute inset-0 w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        Live Webinar
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex flex-wrap gap-4 text-sm font-medium text-primary mb-4">
                      <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                        <Calendar className="h-4 w-4" />
                        {new Date(webinar.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </div>
                      <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                        <Clock className="h-4 w-4" />
                        {new Date(webinar.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
                      </div>
                      {webinar.duration && (
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                          <Clock className="h-4 w-4" />
                          {webinar.duration}
                        </div>
                      )}
                    </div>
                    <Link to={`/webinars/${webinar.slug}`}>
                      <h3 className="text-2xl font-bold text-card-foreground mb-3 group-hover:text-primary transition-colors">{webinar.title}</h3>
                    </Link>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{webinar.description}</p>
                    {webinar.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {webinar.topics.map(t => (
                          <span key={t} className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-border/50 pt-6">
                      <div className="flex items-center gap-3">
                        {webinar.speakers?.length > 0 && (
                          <div>
                            {webinar.speakers.map((s, i) => (
                              <div key={i}>
                                <p className="text-sm font-bold text-foreground">{s.name}</p>
                                <p className="text-xs text-muted-foreground">{s.title}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {webinar.registrationUrl ? (
                        <a href={webinar.registrationUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="lg" className="rounded-full px-6 shadow-md hover:shadow-lg transition-all">Register Now</Button>
                        </a>
                      ) : (
                        <Link to={`/webinars/${webinar.slug}`}>
                          <Button size="lg" className="rounded-full px-6 shadow-md hover:shadow-lg transition-all">Learn More</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10 border border-border bg-muted/30 rounded-2xl p-12 text-center">
              <p className="text-muted-foreground text-lg">No upcoming webinars scheduled. Sign up below to be notified of future events.</p>
            </div>
          )}
        </div>
      </section>

      {/* Past Webinars */}
      {past.length > 0 && (
        <section className="py-20 md:py-28 bg-muted/30 border-t border-border/50">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-12">Watch On-Demand</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((webinar, index) => {
                const embedUrl = getYouTubeEmbedUrl(webinar.youtubeUrl);
                return (
                  <div key={webinar.slug} className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1" style={{ animationDelay: `${index * 50}ms` }}>
                    {embedUrl ? (
                      <div className="relative aspect-video">
                        <iframe
                          src={embedUrl}
                          title={webinar.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        {webinar.ogImage && <img src={webinar.ogImage} alt={webinar.title} className="absolute inset-0 w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xl">
                            <Play className="h-6 w-6 fill-current ml-1" />
                          </div>
                        </div>
                        {webinar.duration && (
                          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-white flex items-center gap-1">
                            <Clock className="h-3 w-3" />{webinar.duration}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-6">
                      <Link to={`/webinars/${webinar.slug}`}>
                        <h3 className="text-lg font-bold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{webinar.title}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{webinar.description}</p>
                      {webinar.speakers?.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <Users className="h-3 w-3" />
                          {webinar.speakers.map(s => s.name).join(", ")}
                        </div>
                      )}
                      <Link to={`/webinars/${webinar.slug}`}>
                        <Button variant="link" className="p-0 h-auto font-semibold text-primary group-hover:text-primary/80">
                          Watch Now <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter/Notification Signup */}
      <section className="relative overflow-hidden hero-gradient-bg py-20">
        <div className="absolute inset-0 grain-texture opacity-20 pointer-events-none" />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-sm mb-6 border border-white/10">
              <Bell className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Don't Miss Our Next Event</h2>
            <p className="text-gray-300 mb-8 text-lg">Get notified when we announce new webinars and training sessions.</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Input type="email" placeholder="Enter your email" className="sm:w-80 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-white/30" />
              <Button className="h-12 px-8 bg-white text-black hover:bg-white/90 font-semibold">Notify Me</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Posture CTA */}
      <section className="py-16 bg-background border-t border-border/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-xl font-bold text-foreground mb-3">While you wait for our next webinar...</h3>
            <p className="text-muted-foreground mb-6">Check your organization's security posture with our free assessment tool.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/risk-assessment">
                <Button className="bg-primary hover:bg-primary/90">
                  Free Security Check <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/blog" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                Read Our Blog <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-sidebar py-16 md:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-sidebar-foreground md:text-3xl">Want a Custom Training for Your Team?</h2>
            <p className="mt-4 text-sidebar-foreground/70">We offer tailored training sessions on cybersecurity, compliance, and technology best practices.</p>
            <div className="mt-8">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={openModal}>Contact Us</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
