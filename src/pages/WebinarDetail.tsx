import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Users, Loader2, ExternalLink } from "lucide-react";
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
  metaDescription: string;
  ogImage: string;
  content: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function WebinarDetail() {
  const { slug } = useParams();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/webinars/${slug}`);
        if (!res.ok) { setNotFound(true); return; }
        setWebinar(await res.json());
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </Layout>
    );
  }

  if (notFound || !webinar) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold mb-4">Webinar Not Found</h1>
          <Link to="/webinars"><Button variant="outline">Back to Webinars</Button></Link>
        </div>
      </Layout>
    );
  }

  const embedUrl = webinar.type === "past" ? getYouTubeEmbedUrl(webinar.youtubeUrl) : null;
  const eventDate = webinar.date ? new Date(webinar.date) : null;

  const jsonLd = webinar.type === "upcoming" ? {
    "@context": "https://schema.org",
    "@type": "Event",
    name: webinar.title,
    description: webinar.description,
    startDate: webinar.date,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "VirtualLocation", url: webinar.registrationUrl || "" },
    organizer: { "@type": "Organization", name: "Northstar Technology Group", url: "https://northstartechnologygroup.com" },
    performer: webinar.speakers?.map(s => ({ "@type": "Person", name: s.name })) || [],
  } : null;

  return (
    <Layout>
      <Helmet>
        <title>{webinar.title} | Northstar Technology Group</title>
        <meta name="description" content={webinar.metaDescription || webinar.description} />
        <meta property="og:title" content={webinar.title} />
        <meta property="og:description" content={webinar.metaDescription || webinar.description} />
        {webinar.ogImage && <meta property="og:image" content={webinar.ogImage} />}
        {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      </Helmet>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Back link */}
          <Link to="/webinars" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Webinars
          </Link>

          {/* Type badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm ${
              webinar.type === "upcoming" ? "bg-red-500/90" : "bg-gray-500/90"
            }`}>
              {webinar.type === "upcoming" ? "Upcoming" : "On-Demand"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">{webinar.title}</h1>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
            {eventDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {eventDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                {" at "}
                {eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
              </div>
            )}
            {webinar.duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> {webinar.duration}
              </div>
            )}
          </div>

          {/* YouTube embed for past */}
          {webinar.type === "past" && embedUrl && (
            <div className="relative w-full mb-8 rounded-2xl overflow-hidden shadow-lg" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={embedUrl}
                title={webinar.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}

          {/* Registration CTA for upcoming */}
          {webinar.type === "upcoming" && webinar.registrationUrl && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 mb-8 text-center">
              <h2 className="text-xl font-bold mb-2">Register for This Webinar</h2>
              <p className="text-muted-foreground mb-4">{webinar.description}</p>
              <a href={webinar.registrationUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2 rounded-full px-8">
                  Register Now <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          )}

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{webinar.description}</p>

          {/* Content */}
          {webinar.content && (
            <div className="prose prose-lg max-w-none mb-12" dangerouslySetInnerHTML={{ __html: webinar.content }} />
          )}

          {/* Topics */}
          {webinar.topics?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {webinar.topics.map(t => (
                  <span key={t} className="text-sm bg-muted px-3 py-1 rounded-full text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Speakers */}
          {webinar.speakers?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" /> Speakers
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {webinar.speakers.map((s, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-xl bg-card">
                    {s.image ? (
                      <img src={s.image} alt={s.name} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                        {s.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground">{s.name}</p>
                      <p className="text-sm text-muted-foreground">{s.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
