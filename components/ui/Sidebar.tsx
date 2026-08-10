"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { COORDINATOR_PROFILE } from "@/lib/dummyData";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  ClipboardCheck,
  ListTodo,
  Users,
  FileBarChart2,
  ShieldAlert,
  MapPin,
  Radio,
  LogOut,
} from "lucide-react";

interface SidebarBadges {
  verificationQueue: number;
  liveTasks: number;
  volunteers: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [badges, setBadges] = useState<SidebarBadges>({
    verificationQueue: 0,
    liveTasks: 0,
    volunteers: 0,
  });

  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBadges = async () => {
      try {
        const [{ count: subCount }, { count: taskCount }, { count: volCount }] =
          await Promise.all([
            supabase
              .from("submissions")
              .select("*", { count: "exact", head: true })
              .or("ai_verdict.is.null,ai_verdict.eq.uncertain"),
            supabase
              .from("tasks")
              .select("*", { count: "exact", head: true })
              .eq("status", "pending"),
            supabase
              .from("profiles")
              .select("*", { count: "exact", head: true })
              .eq("role", "volunteer"),
          ]);

        if (isMounted) {
          setBadges({
            verificationQueue: subCount || 0,
            liveTasks: taskCount || 0,
            volunteers: volCount || 0,
          });
        }
      } catch (err) {
        console.error("Sidebar badge fetch error:", err);
      }
    };

    fetchBadges();

    const channel = supabase
      .channel("sidebar-badge-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, fetchBadges)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchBadges)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchBadges)
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      window.location.href = "/auth/signin";
    }
  };

  const formatBadge = (n: number): string => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  const navLinks = [
    {
      name: "Overview",
      href: "/dashboard/coordinator",
      icon: LayoutDashboard,
      exact: true,
      badge: null as string | null,
    },
    {
      name: "Verification Queue",
      href: "/dashboard/coordinator/verification",
      icon: ClipboardCheck,
      badge: badges.verificationQueue > 0 ? formatBadge(badges.verificationQueue) : null,
    },
    {
      name: "Live Tasks",
      href: "/dashboard/coordinator/tasks",
      icon: ListTodo,
      badge: badges.liveTasks > 0 ? formatBadge(badges.liveTasks) : null,
    },
    {
      name: "Volunteers",
      href: "/dashboard/coordinator/volunteers",
      icon: Users,
      badge: badges.volunteers > 0 ? formatBadge(badges.volunteers) : null,
    },
    {
      name: "Reports",
      href: "/dashboard/coordinator/reports",
      icon: FileBarChart2,
      badge: null,
    },
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-64 fixed left-0 top-0 bottom-0 bg-[#2D4A2D] text-[#F5F0E8] flex flex-col justify-between z-40 border-r border-[#6B7C4A]/30 shadow-xl">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-[#6B7C4A]/30">
          <Link href="/dashboard/coordinator" className="block group">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-lg bg-[#C4973A] flex items-center justify-center text-[#2D4A2D] font-serif font-bold text-lg shadow-sm">
                G
              </span>
              <h1 className="font-serif text-2xl font-bold tracking-wide text-[#C4973A] group-hover:text-[#F5F0E8] transition-colors">
                Groundwork
              </h1>
            </div>
            <p className="text-[11px] text-[#87A878] tracking-wider uppercase font-medium flex items-center gap-1 mt-1">
              <Radio className="w-3 h-3 text-[#C4973A] animate-pulse" />
              AI Micro-Relief Network
            </p>
          </Link>
        </div>

        {/* Region Alert Badge */}
        <div className="px-4 py-3 mx-4 my-4 rounded-lg bg-[#6B7C4A]/25 border border-[#87A878]/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C4973A]">
            <ShieldAlert className="w-3.5 h-3.5" />
            Active Command Sector
          </div>
          <p className="text-[11px] text-[#F5F0E8]/90 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#87A878]" />
            Wayanad & Assam Sector
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.href, link.exact);
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                  active
                    ? "bg-[#C4973A] text-[#2D4A2D] font-semibold shadow-md"
                    : "text-[#F5F0E8]/80 hover:bg-[#6B7C4A]/30 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? "text-[#2D4A2D]" : "text-[#87A878] group-hover:text-[#C4973A]"
                    }`}
                  />
                  <span>{link.name}</span>
                </div>

                {link.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      active
                        ? "bg-[#2D4A2D] text-[#F5F0E8]"
                        : "bg-[#87A878]/30 text-[#F5F0E8]"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Logout Footer */}
      <div className="p-4 border-t border-[#6B7C4A]/30 bg-[#263E26]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative shrink-0">
              <img
                src={COORDINATOR_PROFILE.avatar}
                alt={COORDINATOR_PROFILE.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#C4973A]"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#2D4A2D]" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-[#F5F0E8] truncate">
                {COORDINATOR_PROFILE.name}
              </h4>
              <p className="text-[10px] text-[#87A878] truncate">
                {COORDINATOR_PROFILE.role}
              </p>
              <span className="inline-block mt-0.5 text-[9px] text-[#C4973A] font-medium uppercase tracking-wider">
                {COORDINATOR_PROFILE.verifiedBadge}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            title="Sign Out"
            className="p-2 rounded-lg bg-[#6B7C4A]/30 hover:bg-rose-900/60 text-[#F5F0E8] hover:text-rose-200 transition-colors shrink-0 flex items-center justify-center border border-[#87A878]/20"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
