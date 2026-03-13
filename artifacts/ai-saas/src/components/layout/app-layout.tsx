import { Link, useLocation } from "wouter";
// @ts-ignore
import { useAuth } from "@workspace/replit-auth-web";
import { Home, Mail, Share2, Code2, Languages, MessageSquare, History, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const auth = useAuth();
  // Fallback gracefully if auth is not fully configured
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const user = auth?.user ?? null;
  const login = auth?.login ?? (() => {});
  const logout = auth?.logout ?? (() => {});

  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/email", label: "Email Drafter", icon: Mail },
    { href: "/social", label: "Social Posts", icon: Share2 },
    { href: "/code", label: "Code Gen", icon: Code2 },
    { href: "/translate", label: "Translator", icon: Languages },
    { href: "/chat", label: "AI Chat", icon: MessageSquare },
    { href: "/history", label: "History", icon: History },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/25">
          <div className="w-full h-full bg-card rounded-[10px] flex items-center justify-center overflow-hidden">
            <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-8 h-8 object-contain" />
          </div>
        </div>
        <span className="font-display font-bold text-xl tracking-tight text-white text-glow">AISaaS</span>
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Toolkit</div>
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group",
                isActive 
                  ? "bg-indigo-500/15 text-indigo-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}>
                <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "group-hover:text-white")} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <motion.div layoutId="active-nav" className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,1)]" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white mb-1">Upgrade to Pro</h4>
          <p className="text-xs text-muted-foreground mb-3">Get unlimited generations and advanced models.</p>
          <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
            View Plans
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-[280px] border-r border-white/5 bg-card/30 backdrop-blur-3xl flex-shrink-0 flex-col hidden lg:flex relative z-10">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] border-r border-white/10 bg-card z-50 flex flex-col shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen relative">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Hero Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none mix-blend-screen z-0" 
        />
        
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-xl flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="text-white hover:bg-white/10">
              <Menu className="w-5 h-5" />
            </Button>
            <span className="font-display font-bold text-lg text-white">AISaaS</span>
          </div>
          
          <div className="hidden lg:block text-sm font-medium text-muted-foreground">
            Welcome back to your workspace
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <img src={user?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} className="w-7 h-7 rounded-full bg-black/50" alt="Profile" />
                <span className="text-sm font-medium hidden sm:block text-white">{user?.firstName || 'User'}</span>
                <div className="w-px h-4 bg-white/10 mx-1 hidden sm:block" />
                <Button variant="ghost" size="icon" onClick={logout} className="h-7 w-7 text-muted-foreground hover:text-white hover:bg-white/10" title="Log Out">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={login} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-6 shadow-lg shadow-indigo-500/20 active-elevate-2 hover-elevate">
                Sign In
              </Button>
            )}
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
