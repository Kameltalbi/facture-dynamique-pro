
import { useEffect, useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ApiProvider } from "../contexts/ApiContext";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  adminOnly?: boolean;
  isAdmin: boolean;
}

const SidebarLink = ({ to, icon, label, active, adminOnly = false, isAdmin }: SidebarLinkProps) => {
  if (adminOnly && !isAdmin) return null;
  
  return (
    <Link to={to} className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
      active ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
    )}>
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const Layout = () => {
  const { user, signOut, isAdmin: isUserAdmin } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const isAdmin = isUserAdmin();

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <ApiProvider>
      <div className="min-h-screen flex bg-background">
        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:relative",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:w-16 md:translate-x-0"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className={cn("font-bold text-xl text-invoice-blue", !isSidebarOpen && "md:hidden")}>
                Ma Facture
              </h1>
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-1 rounded-md hover:bg-secondary md:hidden"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
            
            {/* Sidebar Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <SidebarLink
                to="/dashboard"
                icon={<LayoutDashboard size={20} />}
                label="Tableau de bord"
                active={location.pathname === "/dashboard"}
                isAdmin={isAdmin}
              />
              <SidebarLink
                to="/clients"
                icon={<Users size={20} />}
                label="Clients"
                active={location.pathname === "/clients"}
                isAdmin={isAdmin}
              />
              <SidebarLink
                to="/produits"
                icon={<Package size={20} />}
                label="Produits"
                active={location.pathname === "/produits"}
                adminOnly={true}
                isAdmin={isAdmin}
              />
              <SidebarLink
                to="/facturation"
                icon={<FileText size={20} />}
                label="Facturation"
                active={location.pathname === "/facturation"}
                isAdmin={isAdmin}
              />
            </nav>
            
            {/* Sidebar Footer */}
            <div className="p-4 border-t">
              {user && (
                <div className="flex flex-col">
                  <div className={cn("mb-2", !isSidebarOpen && "md:hidden")}>
                    <p className="text-sm font-medium">{user.nom}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={signOut}
                    className="flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} />
                    <span className={cn(!isSidebarOpen && "md:hidden")}>Déconnexion</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className={cn(
            "fixed bottom-4 left-4 z-30 p-2 rounded-full bg-primary text-primary-foreground shadow-lg md:hidden",
            isSidebarOpen && "hidden"
          )}
        >
          <Menu size={24} />
        </button>

        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-hidden transition-all duration-200",
          isSidebarOpen ? "md:ml-0" : "md:ml-0"
        )}>
          <div className="container mx-auto p-4 md:p-6 h-full overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </ApiProvider>
  );
};

export default Layout;
