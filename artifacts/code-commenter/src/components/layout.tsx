import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Code2, History, BarChart3, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Generator", icon: Terminal },
    { path: "/history", label: "History", icon: History },
    { path: "/stats", label: "Stats", icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-background text-foreground dark">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-md">
            <Code2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight leading-none text-foreground">Aegis</h1>
            <p className="text-xs text-muted-foreground font-mono mt-1">Code Intelligence</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 pb-4 md:py-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible hide-scrollbar">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background/50 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto p-4 md:p-8 z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
