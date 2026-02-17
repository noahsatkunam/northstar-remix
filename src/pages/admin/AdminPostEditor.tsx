import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TipTapEditor from "./components/TipTapEditor";
import SEOPanel from "./components/SEOPanel";
import CategoryPicker from "./components/CategoryPicker";
import TagInput from "./components/TagInput";
import AISeoAssist from "./components/AISeoAssist";
import { Save, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function AdminPostEditor() {
  const { slug: editSlug } = useParams();
  const navigate = useNavigate();
  const isEdit = !!editSlug;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Cybersecurity");
  const [tags, setTags] = useState<string[]>([]);
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [author, setAuthor] = useState("NorthStar Team");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!editSlug) return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/blog/posts/${editSlug}`);
        if (!res.ok) { navigate("/admin"); return; }
        const post = await res.json();
        setTitle(post.title || "");
        setSlug(post.slug || "");
        setExcerpt(post.excerpt || "");
        setCategory(post.category || "Cybersecurity");
        setTags(post.tags || []);
        setMetaDescription(post.metaDescription || "");
        setOgImage(post.ogImage || "");
        setAuthor(post.author || "NorthStar Team");
        setStatus(post.status || "draft");
        setContent(post.content || "");
      } catch { navigate("/admin"); }
      finally { setLoading(false); }
    })();
  }, [editSlug]);

  // Auto-generate slug from title for new posts
  useEffect(() => {
    if (!isEdit && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
    }
  }, [title, isEdit]);

  const handleSave = async (saveStatus?: "draft" | "published") => {
    const targetStatus = saveStatus || status;
    setSaving(true);
    try {
      const body = { title, slug, excerpt, category, tags, metaDescription, ogImage, author, status: targetStatus, content };
      const url = isEdit ? `${API}/api/blog/posts/${editSlug}` : `${API}/api/blog/posts`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        navigate("/admin");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save");
      }
    } catch (err) {
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="text-xl font-bold">{isEdit ? "Edit Post" : "New Post"}</h1>
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
          <div>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Post title"
              className="text-xl font-bold h-12"
            />
          </div>
          <div>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Brief excerpt / summary"
              className="w-full border rounded-md p-3 text-sm min-h-[80px] bg-background resize-none"
            />
          </div>
          <TipTapEditor content={content} onChange={setContent} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-background space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Post Settings</h3>
            <div>
              <label className="text-sm font-medium block mb-1">Author</label>
              <Input value={author} onChange={e => setAuthor(e.target.value)} />
            </div>
            <CategoryPicker value={category} onChange={setCategory} />
            <TagInput tags={tags} onChange={setTags} />
            <div>
              <label className="text-sm font-medium block mb-1">Status</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={status === "draft" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setStatus("draft")}
                  className="gap-1 flex-1"
                >
                  <EyeOff className="h-3 w-3" /> Draft
                </Button>
                <Button
                  type="button"
                  variant={status === "published" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setStatus("published")}
                  className="gap-1 flex-1"
                >
                  <Eye className="h-3 w-3" /> Published
                </Button>
              </div>
            </div>
          </div>
          <AISeoAssist
            title={title}
            content={content}
            type="blog"
            currentValues={{ title, slug, excerpt, metaDescription, tags, category }}
            onApply={{
              title: setTitle,
              slug: setSlug,
              excerpt: setExcerpt,
              metaDescription: setMetaDescription,
              tags: setTags,
              category: setCategory,
            }}
          />
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
