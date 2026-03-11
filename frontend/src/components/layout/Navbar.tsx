"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSearch,
  LayoutDashboard,
  Layers,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { checkHealth } from "@/lib/api";

const navItems = [
  { href: "/", label: "Analyze", icon: FileSearch },
  { href: "/batch", label: "Batch", icon: Layers },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Navbar() {
  const pathname = usePathname();
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    checkHealth().then(setHealthy);
    const id = setInterval(() => checkHealth().then(setHealthy), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/40">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:glow-primary transition-shadow">
            <FileSearch className="h-5 w-5 text-primary-light" />
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-semibold tracking-tight gradient-text">
              ReqQuality AI
            </span>
            <span className="ml-2 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              v2.0
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                  active
                    ? "text-primary-light bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* API Status */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <Activity
              className={cn(
                "h-3.5 w-3.5",
                healthy === true
                  ? "text-green-400"
                  : healthy === false
                  ? "text-red-400"
                  : "text-zinc-500 animate-pulse"
              )}
            />
            <span className="hidden sm:inline text-muted-foreground">
              {healthy === true
                ? "API Connected"
                : healthy === false
                ? "API Offline"
                : "Checking..."}
            </span>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border/40 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition",
                      active
                        ? "text-primary-light bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
