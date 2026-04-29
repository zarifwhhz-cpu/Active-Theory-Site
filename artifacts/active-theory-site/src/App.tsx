import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Public site
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import { CustomCursor } from "@/components/CustomCursor";
import { Navbar } from "@/components/Navbar";
import { BackgroundAnimation } from "@/components/BackgroundAnimation";

// Admin
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminSettings from "@/pages/admin/Settings";
import AdminProjects from "@/pages/admin/Projects";
import AdminServices from "@/pages/admin/Services";
import AdminAwards from "@/pages/admin/Awards";
import AdminSocialLinks from "@/pages/admin/SocialLinks";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function PublicSite() {
  return (
    <>
      <BackgroundAnimation />
      <div className="bg-noise" />
      <CustomCursor />
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function AdminArea() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/projects" component={AdminProjects} />
      <Route path="/admin/services" component={AdminServices} />
      <Route path="/admin/awards" component={AdminAwards} />
      <Route path="/admin/social-links" component={AdminSocialLinks} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Routed() {
  const [location] = useLocation();
  if (location.startsWith("/admin")) return <AdminArea />;
  return <PublicSite />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Routed />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
