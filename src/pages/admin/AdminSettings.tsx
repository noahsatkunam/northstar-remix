import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Save, Eye, X } from "lucide-react";

const API = import.meta.env.VITE_BACKEND_URL || "https://northstar-backend-frnb.onrender.com";

interface SiteSettings {
  banner: {
    enabled: boolean;
    text: string;
    link: string;
    style: string;
  };
  featuredWebinar: {
    enabled: boolean;
    title: string;
    date: string;
    time: string;
    description: string;
    registrationLink: string;
    speaker: { name: string; title: string; bio: string };
    host: { name: string; title: string };
  };
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`${API}/api/settings`).then(r => r.json()).then(setSettings).catch(console.error);
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Settings saved", description: "Your changes are live." });
      sessionStorage.removeItem("site_settings_cache");
    } catch (err) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="text-center py-12 text-muted-foreground">Loading settings...</div>;

  const b = settings.banner;
  const w = settings.featuredWebinar;

  const updateBanner = (patch: Partial<typeof b>) => setSettings({ ...settings, banner: { ...b, ...patch } });
  const updateWebinar = (patch: Partial<typeof w>) => setSettings({ ...settings, featuredWebinar: { ...w, ...patch } });
  const updateSpeaker = (patch: Partial<typeof w.speaker>) => updateWebinar({ speaker: { ...w.speaker, ...patch } });
  const updateHost = (patch: Partial<typeof w.host>) => updateWebinar({ host: { ...w.host, ...patch } });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <Button onClick={save} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Banner Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Banner
            <label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
              <input type="checkbox" checked={b.enabled} onChange={e => updateBanner({ enabled: e.target.checked })} className="h-4 w-4 rounded" />
              Enabled
            </label>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Banner Text</Label>
            <Input value={b.text} onChange={e => updateBanner({ text: e.target.value })} />
          </div>
          <div>
            <Label>Banner Link URL</Label>
            <Input value={b.link} onChange={e => updateBanner({ link: e.target.value })} type="url" />
          </div>
          {b.enabled && (
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
              <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-primary via-primary/90 to-accent px-4 py-2.5 text-sm font-medium text-white rounded-lg">
                <a href={b.link} className="hover:underline" target="_blank" rel="noopener noreferrer">{b.text}</a>
                <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-white/20"><X className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured Webinar Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Featured Webinar
            <label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
              <input type="checkbox" checked={w.enabled} onChange={e => updateWebinar({ enabled: e.target.checked })} className="h-4 w-4 rounded" />
              Enabled
            </label>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Title</Label>
              <Input value={w.title} onChange={e => updateWebinar({ title: e.target.value })} />
            </div>
            <div>
              <Label>Date</Label>
              <Input value={w.date} onChange={e => updateWebinar({ date: e.target.value })} placeholder="February 11, 2026" />
            </div>
            <div>
              <Label>Time</Label>
              <Input value={w.time} onChange={e => updateWebinar({ time: e.target.value })} placeholder="12:00 PM CT" />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea value={w.description} onChange={e => updateWebinar({ description: e.target.value })} rows={3} />
            </div>
            <div className="md:col-span-2">
              <Label>Registration Link</Label>
              <Input value={w.registrationLink} onChange={e => updateWebinar({ registrationLink: e.target.value })} type="url" />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Speaker</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input value={w.speaker.name} onChange={e => updateSpeaker({ name: e.target.value })} />
              </div>
              <div>
                <Label>Title</Label>
                <Input value={w.speaker.title} onChange={e => updateSpeaker({ title: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Bio</Label>
                <Textarea value={w.speaker.bio} onChange={e => updateSpeaker({ bio: e.target.value })} rows={2} />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Host</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input value={w.host.name} onChange={e => updateHost({ name: e.target.value })} />
              </div>
              <div>
                <Label>Title</Label>
                <Input value={w.host.title} onChange={e => updateHost({ title: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Webinar Preview */}
          {w.enabled && (
            <div className="border-t pt-4">
              <Label className="text-xs text-muted-foreground mb-3 flex items-center gap-1"><Eye className="h-3 w-3" /> Preview</Label>
              <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-accent/5 p-8">
                <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" /> UPCOMING LIVE EVENT
                </div>
                <h3 className="text-xl font-bold mb-2">{w.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">{w.date} • {w.time}</p>
                <p className="text-muted-foreground mb-4 text-sm">{w.description}</p>
                <div className="flex flex-wrap gap-6 text-sm mb-4">
                  {w.speaker.name && (
                    <div>
                      <p className="font-semibold">🎤 {w.speaker.name}</p>
                      <p className="text-muted-foreground text-xs">{w.speaker.title}</p>
                    </div>
                  )}
                  {w.host.name && (
                    <div>
                      <p className="font-semibold">🎙️ {w.host.name}</p>
                      <p className="text-muted-foreground text-xs">{w.host.title}</p>
                    </div>
                  )}
                </div>
                <Button size="sm">Register Now →</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pb-8">
        <Button onClick={save} disabled={saving} size="lg" className="gap-2">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
