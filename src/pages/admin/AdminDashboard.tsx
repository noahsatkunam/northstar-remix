import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FilePlus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface Post {
  title: string;
  slug: string;
  status: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
}

const API = import.meta.env.VITE_BACKEND_URL || "https://northstar-backend-frnb.onrender.com";

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API}/api/blog/posts`);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    try {
      await fetch(`${API}/api/blog/posts/${slug}`, { method: "DELETE" });
      setPosts(posts.filter(p => p.slug !== slug));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const filtered = filter === "all" ? posts : posts.filter(p => p.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground text-sm">{posts.length} total posts</p>
        </div>
        <Link to="/admin/new">
          <Button className="gap-2"><FilePlus className="h-4 w-4" /> New Post</Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6">
        {(["all", "published", "draft"] as const).map(f => (
          <Button key={f} variant={filter === f ? "secondary" : "ghost"} size="sm" onClick={() => setFilter(f)} className="capitalize">
            {f} {f === "all" ? `(${posts.length})` : `(${posts.filter(p => p.status === f).length})`}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No posts found.</p>
          <Link to="/admin/new"><Button variant="link" className="mt-2">Create your first post</Button></Link>
        </div>
      ) : (
        <div className="border rounded-lg bg-background overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-sm text-muted-foreground">
                <th className="py-3 px-4 font-medium">Title</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Author</th>
                <th className="py-3 px-4 font-medium">Updated</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => (
                <tr key={post.slug} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <Link to={`/admin/edit/${post.slug}`} className="font-medium hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      post.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {post.status === "published" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {post.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{post.category}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{post.author}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/edit/${post.slug}`}>
                        <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(post.slug)} className="text-red-500 hover:text-red-700">
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
