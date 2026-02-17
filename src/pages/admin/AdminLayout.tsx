import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FilePlus, LogOut, ChevronLeft, Video, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLogin from "./AdminLogin";

export default function AdminLayout() {
  const [authed, setAuthed] = useState(sessionStorage.getItem("admin_auth") === "true");
  const location = useLocation();
  const navigate = useNavigate();

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setAuthed(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="font-bold text-lg">NS Admin</Link>
            <nav className="flex items-center gap-1 ml-4">
              <Link to="/admin">
                <Button variant={isActive("/admin") ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Posts
                </Button>
              </Link>
              <Link to="/admin/new">
                <Button variant={isActive("/admin/new") ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <FilePlus className="h-4 w-4" /> New Post
                </Button>
              </Link>
              <div className="w-px h-5 bg-border mx-1" />
              <Link to="/admin/webinars">
                <Button variant={location.pathname.startsWith("/admin/webinars") ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <Video className="h-4 w-4" /> Webinars
                </Button>
              </Link>
              <div className="w-px h-5 bg-border mx-1" />
              <Link to="/admin/settings">
                <Button variant={isActive("/admin/settings") ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <Settings className="h-4 w-4" /> Settings
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/blog">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                <ChevronLeft className="h-3 w-3" /> View Blog
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
