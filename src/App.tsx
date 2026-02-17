import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ContactModalProvider } from "@/components/ContactModal";
import { ScrollToTop } from "@/components/ScrollToTop";

// Lazy load pages for better code splitting
const Index = lazy(() => import("./pages/Index"));
const Services = lazy(() => import("./pages/Services"));
const Compliance = lazy(() => import("./pages/Compliance"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Webinars = lazy(() => import("./pages/Webinars"));
const DmarcChecker = lazy(() => import("./pages/DmarcChecker"));
const RiskAssessment = lazy(() => import("./pages/RiskAssessment"));
const SecurityCheck = lazy(() => import("./pages/SecurityCheck"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPostEditor = lazy(() => import("./pages/admin/AdminPostEditor"));
const AdminWebinarDashboard = lazy(() => import("./pages/admin/AdminWebinarDashboard"));
const AdminWebinarEditor = lazy(() => import("./pages/admin/AdminWebinarEditor"));
const WebinarDetail = lazy(() => import("./pages/WebinarDetail"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

// QueryClient instance
const queryClient = new QueryClient();

const AppContent = () => (
  <>
    <Toaster />
    <Sonner />
    <ScrollToTop />
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/services" element={<Services />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/webinars" element={<Webinars />} />
        <Route path="/webinars/:slug" element={<WebinarDetail />} />
        
        {/* Unified Security Check tool */}
        <Route path="/security-check" element={<SecurityCheck />} />
        
        {/* Redirects to unified tool */}
        <Route path="/risk-assessment" element={<Navigate to="/security-check" replace />} />
        <Route path="/dmarc-checker" element={<Navigate to="/security-check" replace />} />
        
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="new" element={<AdminPostEditor />} />
          <Route path="edit/:slug" element={<AdminPostEditor />} />
          <Route path="webinars" element={<AdminWebinarDashboard />} />
          <Route path="webinars/new" element={<AdminWebinarEditor />} />
          <Route path="webinars/edit/:slug" element={<AdminWebinarEditor />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <MotionConfig reducedMotion="user">
          <ContactModalProvider>
            <AppContent />
          </ContactModalProvider>
        </MotionConfig>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
