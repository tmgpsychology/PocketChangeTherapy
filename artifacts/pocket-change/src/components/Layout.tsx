import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAuthUserQueryKey } from "@workspace/api-client-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const logout = useLogout();

  const practitionerNav: NavItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { path: "/clients", label: "Clients", icon: <UsersIcon /> },
    { path: "/settings", label: "Settings", icon: <SettingsIcon /> },
  ];

  const clientNav: NavItem[] = [
    { path: "/portal", label: "Home", icon: <HomeIcon /> },
    { path: "/reminders", label: "Reminders", icon: <BellIcon /> },
    { path: "/settings", label: "Settings", icon: <SettingsIcon /> },
  ];

  const navItems = user?.role === "practitioner" ? practitionerNav : clientNav;

  const isActive = (path: string) => {
    if (path === "/dashboard" && (location === "/" || location === "/dashboard")) return true;
    if (path === "/portal" && (location === "/" || location === "/portal" || location.startsWith("/portal"))) return true;
    return location.startsWith(path) && path !== "/dashboard" && path !== "/portal";
  };

  const handleLogout = async () => {
    await logout.mutateAsync({});
    queryClient.invalidateQueries({ queryKey: getGetAuthUserQueryKey() });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">PC</span>
            </div>
            <span className="font-semibold text-foreground">PocketChange</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
              {user?.role === "practitioner" ? "Practitioner" : "Client"}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} href={item.path}>
                <button className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${active ? "text-primary" : "text-muted-foreground"}`}>
                  <span className={active ? "text-primary" : "text-muted-foreground"}>{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
