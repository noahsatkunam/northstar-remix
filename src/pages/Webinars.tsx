import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Play, Bell, ArrowRight, Users } from "lucide-react";
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
  ogImage?: string;
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
    <section className="relative pb-0 -mt-6 z-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card">
          <div className="absolute inset-0 dot-pattern opacity-20" />
          <div className="relative p-8 md:p-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">Featured Live Event</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-4 max-w-3xl">{featured.title}</h2>

            <div className="flex flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg text-sm font-medium text-primary">
                <Calendar className="h-3.5 w-3.5" /> {featured.date}
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg text-sm font-medium text-primary">
                <Clock className="h-3.5 w-3.5" /> {featured.time}
              </div>
            </div>

            <p className="text-muted-foreground mb-6 max-w-3xl leading-relaxed">{featured.description}</p>

            <div className="flex flex-wrap gap-6 mb-6 border-t border-border/30 pt-6">
              {featured.speaker?.name && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                    {featured.speaker.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Speaker</p>
                    <p className="font-bold text-sm">{featured.speaker.name}</p>
                    <p className="text-xs text-muted-foreground">{featured.speaker.title}</p>
                    {featured.speaker.bio && <p className="text-xs text-muted-foreground mt-1 max-w-md">{featured.speaker.bio}</p>}
                  </div>
                </div>
              )}
              {featured.host?.name && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent font-bold text-sm">
                    {featured.host.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Host</p>
                    <p className="font-bold text-sm">{featured.host.name}</p>
                    <p className="text-xs text-muted-foreground">{featured.host.title}</p>
                  </div>
                </div>
              )}
            </div>

            {featured.registrationLink && (
              <a href={featured.registrationLink} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="rounded-xl px-7 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  Register Now <ArrowRight className="ml-2 h-4 w-4" />
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

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 pt-32 md:pt-36">
        <div className="absolute inset-0">
          <div className="absolute inset-0 dot-pattern opacity-30" />
          <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-primary/[0.05] rounded-full blur-[120px]" />
        </div>
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl mb-6">
              Learn From the <span className="text-gradient">Experts</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Free webinars on IT strategy, cybersecurity, compliance, and emerging technology.
            </p>
          </div>
        </div>
      </section>

      <FeaturedWebinarSection />

      {/* Upcoming Webinars */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold mb-10">Upcoming Events</h2>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading webinars...</div>
          ) : upcoming.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {upcoming.map((webinar) => (
                <div key={webinar.slug} className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:border-primary/30">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {webinar.ogImage && <img src={webinar.ogImage} alt={webinar.title} className="absolute inset-0 w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <div className="absolute top-3 left-3 z-20">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                        </span>
                        Live Webinar
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-primary mb-4">
                      <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-md">
                        <Calendar className="h-3 w-3" />
                        {new Date(webinar.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </div>
                      {webinar.duration && (
                        <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-md">
                          <Clock className="h-3 w-3" /> {webinar.duration}
                        </div>
                      )}
                    </div>
                    <Link to={`/webinars/${webinar.slug}`}>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{webinar.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{webinar.description}</p>
                    {webinar.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {webinar.topics.map(t => (
                          <span key={t} className="text-[10px] bg-white/[0.04] border border-border/30 px-2 py-0.5 rounded-md text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-border/30 pt-4">
                      <div>
                        {webinar.speakers?.length > 0 && webinar.speakers.map((s, i) => (
                          <div key={i}>
                            <p className="text-sm font-bold">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.title}</p>
                          </div>
                        ))}
                      </div>
                      {webinar.registrationUrl ? (
                        <a href={webinar.registrationUrl} target="_blank" rel="noopener noreferrer">
                          <Button className="rounded-xl px-5">Register Now</Button>
                        </a>
                      ) : (
                        <Link to={`/webinars/${webinar.slug}`}>
                          <Button className="rounded-xl px-5">Learn More</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-border/30 bg-card rounded-2xl p-10 text-center">
              <p className="text-muted-foreground">No upcoming webinars scheduled. Sign up below to be notified of future events.</p>
            </div>
          )}
        </div>
      </section>

      {/* Past Webinars */}
      {past.length > 0 && (
        <section className="py-20 md:py-28 border-t border-border/30">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-2xl font-bold mb-10">Watch On-Demand</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((webinar) => {
                const embedUrl = getYouTubeEmbedUrl(webinar.youtubeUrl);
                return (
                  <div key={webinar.slug} className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:border-primary/30">
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
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white">
                            <Play className="h-5 w-5 fill-current ml-0.5" />
                          </div>
                        </div>
                        {webinar.duration && (
                          <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-medium text-white flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />{webinar.duration}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-5">
                      <Link to={`/webinars/${webinar.slug}`}>
                        <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{webinar.title}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{webinar.description}</p>
                      {webinar.speakers?.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <Users className="h-3 w-3" />
                          {webinar.speakers.map(s => s.name).join(", ")}
                        </div>
                      )}
                      <Link to={`/webinars/${webinar.slug}`}>
                        <span className="inline-flex items-center text-sm font-semibold text-primary">
                          Watch Now <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-accent/5" />
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
              <Bell className="h-7 w-7" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Don't Miss Our Next Event</h2>
            <p className="text-muted-foreground mb-8">Get notified when we announce new webinars and training sessions.</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Input
                type="email"
                placeholder="Enter your email"
                className="sm:w-72 h-11 bg-white/[0.04] border-border/50 placeholder:text-muted-foreground/50"
              />
              <Button className="h-11 px-6 bg-primary hover:bg-primary/90">Notify Me</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Security CTA */}
      <section className="py-14 border-t border-border/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-lg font-bold mb-3">While you wait for our next webinar...</h3>
            <p className="text-sm text-muted-foreground mb-5">Check your organization's security posture with our free assessment tool.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/security-check">
                <Button className="rounded-xl bg-primary hover:bg-primary/90">
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

      {/* Team CTA */}
      <section className="py-14 md:py-16 border-t border-border/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-3">Want a Custom Training for Your Team?</h2>
            <p className="text-sm text-muted-foreground mb-6">We offer tailored training sessions on cybersecurity, compliance, and technology best practices.</p>
            <Button size="lg" className="rounded-xl bg-primary hover:bg-primary/90" onClick={openModal}>Contact Us</Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
