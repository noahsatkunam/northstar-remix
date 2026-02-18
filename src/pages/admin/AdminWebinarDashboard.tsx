import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FilePlus, Edit, Trash2, Eye, EyeOff, Video, Calendar } from "lucide-react";

interface Webinar {
  title: string;
  slug: string;
  status: string;
  type: string;
  date: string;
  duration: string;
  updatedAt: string;
}

const API = import.meta.env.VITE_BACKEND_URL || "https://northstar-backend-frnb.onrender.com";

export default function AdminWebinarDashboard() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"all" | "upcoming" | "past">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const fetchWebinars = async () => {
    try {
      const res = await fetch(`${API}/api/webinars`);
      const data = await res.json();
      setWebinars(data);
    } catch (err) {
      console.error("Failed to fetch webinars:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWebinars(); }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete webinar "${slug}"? This cannot be undone.`)) return;
    try {
      await fetch(`${API}/api/webinars/${slug}`, { method: "DELETE" });
      setWebinars(webinars.filter(w => w.slug !== slug));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  let filtered = webinars;
  if (typeFilter !== "all") filtered = filtered.filter(w => w.type === typeFilter);
  if (statusFilter !== "all") filtered = filtered.filter(w => w.status === statusFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Webinars</h1>
          <p className="text-muted-foreground text-sm">{webinars.length} total webinars</p>
        </div>
        <Link to="/admin/webinars/new">
          <Button className="gap-2"><FilePlus className="h-4 w-4" /> New Webinar</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-1">
          <span className="text-sm text-muted-foreground self-center mr-1">Type:</span>
          {(["all", "upcoming", "past"] as const).map(f => (
            <Button key={f} variant={typeFilter === f ? "secondary" : "ghost"} size="sm" onClick={() => setTypeFilter(f)} className="capitalize">
              {f} {f === "all" ? `(${webinars.length})` : `(${webinars.filter(w => w.type === f).length})`}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          <span className="text-sm text-muted-foreground self-center mr-1">Status:</span>
          {(["all", "published", "draft"] as const).map(f => (
            <Button key={f} variant={statusFilter === f ? "secondary" : "ghost"} size="sm" onClick={() => setStatusFilter(f)} className="capitalize">
              {f}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No webinars found.</p>
          <Link to="/admin/webinars/new"><Button variant="link" className="mt-2">Create your first webinar</Button></Link>
        </div>
      ) : (
        <div className="border rounded-lg bg-background overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-sm text-muted-foreground">
                <th className="py-3 px-4 font-medium">Title</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Duration</th>
                <th className="py-3 px-4 font-medium">Updated</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(webinar => (
                <tr key={webinar.slug} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <Link to={`/admin/webinars/edit/${webinar.slug}`} className="font-medium hover:text-primary transition-colors">
                      {webinar.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      webinar.type === "upcoming" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {webinar.type === "upcoming" ? <Calendar className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                      {webinar.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      webinar.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {webinar.status === "published" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {webinar.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {webinar.date ? new Date(webinar.date).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{webinar.duration || "-"}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {webinar.updatedAt ? new Date(webinar.updatedAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/webinars/edit/${webinar.slug}`}>
                        <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(webinar.slug)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
