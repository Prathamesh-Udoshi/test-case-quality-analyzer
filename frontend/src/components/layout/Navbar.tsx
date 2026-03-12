"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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
  { href: "/analyze", label: "Analyze", icon: FileSearch },
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
    <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
            <FileSearch className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight gradient-text">
              ReqQuality AI
            </span>
            <span className="text-[10px] font-medium text-zinc-600 bg-zinc-800/60 px-1.5 py-0.5 rounded-full">
              v2.0
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  active
                    ? "text-indigo-400 bg-indigo-500/10"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
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
            <span className="hidden sm:inline text-zinc-500">
              {healthy === true
                ? "API Connected"
                : healthy === false
                ? "API Offline"
                : "Checking..."}
            </span>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-zinc-800 transition"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-zinc-400" />
            ) : (
              <Menu className="h-5 w-5 text-zinc-400" />
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
            className="md:hidden border-t border-zinc-800 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition",
                      active
                        ? "text-indigo-400 bg-indigo-500/10"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
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
