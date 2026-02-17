import { Input } from "@/components/ui/input";

interface SEOPanelProps {
  slug: string;
  metaDescription: string;
  ogImage: string;
  onSlugChange: (v: string) => void;
  onMetaDescriptionChange: (v: string) => void;
  onOgImageChange: (v: string) => void;
}

export default function SEOPanel({ slug, metaDescription, ogImage, onSlugChange, onMetaDescriptionChange, onOgImageChange }: SEOPanelProps) {
  return (
    <div className="border rounded-lg p-4 bg-background space-y-4">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">SEO Settings</h3>
      <div>
        <label className="text-sm font-medium block mb-1">URL Slug</label>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">/blog/</span>
          <Input value={slug} onChange={e => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"))} placeholder="post-url-slug" className="flex-1" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Meta Description</label>
        <textarea
          value={metaDescription}
          onChange={e => onMetaDescriptionChange(e.target.value)}
          placeholder="Brief description for search engines (150-160 chars)"
          className="w-full border rounded-md p-2 text-sm min-h-[80px] bg-background resize-none"
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground mt-1">{metaDescription.length}/160 characters</p>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">OG Image URL</label>
        <Input value={ogImage} onChange={e => onOgImageChange(e.target.value)} placeholder="https://..." />
      </div>
    </div>
  );
}
