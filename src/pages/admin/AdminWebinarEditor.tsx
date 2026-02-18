import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TipTapEditor from "./components/TipTapEditor";
import SEOPanel from "./components/SEOPanel";
import TagInput from "./components/TagInput";
import AISeoAssist from "./components/AISeoAssist";
import { Save, Eye, EyeOff, ArrowLeft, Loader2, Plus, X, Video, Calendar } from "lucide-react";

const API = import.meta.env.VITE_BACKEND_URL || "https://northstar-backend-frnb.onrender.com";

interface Speaker {
  name: string;
  title: string;
  image?: string;
}

export default function AdminWebinarEditor() {
  const { slug: editSlug } = useParams();
  const navigate = useNavigate();
  const isEdit = !!editSlug;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"upcoming" | "past">("upcoming");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [speakers, setSpeakers] = useState<Speaker[]>([{ name: "", title: "" }]);
  const [topics, setTopics] = useState<string[]>([]);
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!editSlug) return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/webinars/${editSlug}`);
        if (!res.ok) { navigate("/admin/webinars"); return; }
        const w = await res.json();
        setTitle(w.title || "");
        setSlug(w.slug || "");
        setDescription(w.description || "");
        setType(w.type || "upcoming");
        setYoutubeUrl(w.youtubeUrl || "");
        setRegistrationUrl(w.registrationUrl || "");
        setDate(w.date ? new Date(w.date).toISOString().slice(0, 16) : "");
        setDuration(w.duration || "");
        setSpeakers(w.speakers?.length ? w.speakers : [{ name: "", title: "" }]);
        setTopics(w.topics || []);
        setMetaDescription(w.metaDescription || "");
        setOgImage(w.ogImage || "");
        setStatus(w.status || "draft");
        setContent(w.content || "");
      } catch { navigate("/admin/webinars"); }
      finally { setLoading(false); }
    })();
  }, [editSlug]);

  // Auto-generate slug
  useEffect(() => {
    if (!isEdit && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
    }
  }, [title, isEdit]);

  const addSpeaker = () => setSpeakers([...speakers, { name: "", title: "" }]);
  const removeSpeaker = (i: number) => setSpeakers(speakers.filter((_, idx) => idx !== i));
  const updateSpeaker = (i: number, field: keyof Speaker, value: string) => {
    const updated = [...speakers];
    updated[i] = { ...updated[i], [field]: value };
    setSpeakers(updated);
  };

  const handleSave = async (saveStatus?: "draft" | "published") => {
    const targetStatus = saveStatus || status;
    setSaving(true);
    try {
      const body = {
        title, slug, description, type, youtubeUrl, registrationUrl, date, duration,
        speakers: speakers.filter(s => s.name.trim()),
        topics, metaDescription, ogImage, status: targetStatus, content,
      };
      const url = isEdit ? `${API}/api/webinars/${editSlug}` : `${API}/api/webinars`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        navigate("/admin/webinars");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save");
      }
    } catch {
      alert("Failed to save webinar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/webinars")} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="text-xl font-bold">{isEdit ? "Edit Webinar" : "New Webinar"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSave("draft")} disabled={saving} className="gap-2">
            <EyeOff className="h-4 w-4" /> Save Draft
          </Button>
          <Button size="sm" onClick={() => handleSave("published")} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Webinar title"
            className="text-xl font-bold h-12"
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description / summary"
            className="w-full border rounded-md p-3 text-sm min-h-[80px] bg-background resize-none"
          />
          <TipTapEditor content={content} onChange={setContent} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Webinar Settings */}
          <div className="border rounded-lg p-4 bg-background space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Webinar Settings</h3>

            {/* Type Toggle */}
            <div>
              <label className="text-sm font-medium block mb-1">Type</label>
              <div className="flex gap-2">
                <Button type="button" variant={type === "upcoming" ? "secondary" : "ghost"} size="sm" onClick={() => setType("upcoming")} className="gap-1 flex-1">
                  <Calendar className="h-3 w-3" /> Upcoming
                </Button>
                <Button type="button" variant={type === "past" ? "secondary" : "ghost"} size="sm" onClick={() => setType("past")} className="gap-1 flex-1">
                  <Video className="h-3 w-3" /> Past
                </Button>
              </div>
            </div>

            {/* Conditional fields */}
            {type === "past" ? (
              <div>
                <label className="text-sm font-medium block mb-1">YouTube URL</label>
                <Input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium block mb-1">Registration URL</label>
                <Input value={registrationUrl} onChange={e => setRegistrationUrl(e.target.value)} placeholder="https://..." />
              </div>
            )}

            {/* Date */}
            <div>
              <label className="text-sm font-medium block mb-1">Event Date & Time</label>
              <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            {/* Duration */}
            <div>
              <label className="text-sm font-medium block mb-1">Duration</label>
              <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 60 min" />
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium block mb-1">Status</label>
              <div className="flex gap-2">
                <Button type="button" variant={status === "draft" ? "secondary" : "ghost"} size="sm" onClick={() => setStatus("draft")} className="gap-1 flex-1">
                  <EyeOff className="h-3 w-3" /> Draft
                </Button>
                <Button type="button" variant={status === "published" ? "secondary" : "ghost"} size="sm" onClick={() => setStatus("published")} className="gap-1 flex-1">
                  <Eye className="h-3 w-3" /> Published
                </Button>
              </div>
            </div>
          </div>

          {/* Speakers */}
          <div className="border rounded-lg p-4 bg-background space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Speakers</h3>
              <Button type="button" variant="ghost" size="sm" onClick={addSpeaker} className="gap-1 h-7 text-xs">
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>
            {speakers.map((speaker, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Input value={speaker.name} onChange={e => updateSpeaker(i, "name", e.target.value)} placeholder="Name" className="text-sm" />
                  <Input value={speaker.title} onChange={e => updateSpeaker(i, "title", e.target.value)} placeholder="Title / Role" className="text-sm" />
                  <Input value={speaker.image || ""} onChange={e => updateSpeaker(i, "image", e.target.value)} placeholder="Image URL (or /uploads/blog/...)" className="text-sm" />
                </div>
                {speakers.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeSpeaker(i)} className="text-red-500 hover:text-red-700 mt-1">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Topics */}
          <div className="border rounded-lg p-4 bg-background">
            <TagInput tags={topics} onChange={setTopics} />
          </div>

          {/* AI SEO Assist */}
          <AISeoAssist
            title={title}
            content={content}
            type="webinar"
            currentValues={{ title, slug, excerpt: description, metaDescription, tags: topics }}
            onApply={{
              title: setTitle,
              slug: setSlug,
              excerpt: setDescription,
              metaDescription: setMetaDescription,
              tags: setTopics,
            }}
          />

          {/* SEO */}
          <SEOPanel
            slug={slug}
            metaDescription={metaDescription}
            ogImage={ogImage}
            onSlugChange={setSlug}
            onMetaDescriptionChange={setMetaDescription}
            onOgImageChange={setOgImage}
          />
        </div>
      </div>
    </div>
  );
}
