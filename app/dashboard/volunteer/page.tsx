"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Layers,
  History,
  Plus,
  LogOut,
  X,
  Calendar,
  Package,
  MapPin,
  Hash,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import TaskCard from "@/components/TaskCard";

interface Task {
  id: string;
  title: string;
  description: string | null;
  item_name: string | null;
  quantity: number | null;
  district: string;
  ward: string | null;
  is_self_pledged: boolean;
  status: string;
  due_date: string | null;
  created_at: string;
}

interface Stats {
  verified: number;
  pending: number;
  onLedger: number;
}

export default function VolunteerDashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({ verified: 0, pending: 0, onLedger: 0 });
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showPledgeModal, setShowPledgeModal] = useState(false);

  // Pledge form state
  const [pledgeForm, setPledgeForm] = useState({
    item_name: "",
    quantity: "",
    description: "",
    ward: "",
    due_date: "",
  });
  const [pledgeLoading, setPledgeLoading] = useState(false);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoadingTasks(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("assigned_to", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  }, [user]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      // Verified submissions count
      const { count: verifiedCount } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("volunteer_id", user.id)
        .eq("ai_verdict", "verified");

      // Pending tasks count (status = 'pending' or 'submitted')
      const { count: pendingCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("assigned_to", user.id)
        .in("status", ["pending", "submitted"]);

      // On Ledger count
      const { count: onLedgerCount } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("volunteer_id", user.id)
        .eq("blockchain_status", "written");

      setStats({
        verified: verifiedCount || 0,
        pending: pendingCount || 0,
        onLedger: onLedgerCount || 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchStats();
    }
  }, [user, fetchTasks, fetchStats]);

  // Supabase Realtime subscription for tasks
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("volunteer-tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `assigned_to=eq.${user.id}`,
        },
        () => {
          fetchTasks();
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchTasks, fetchStats]);

  // Handle pledge submit
  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setPledgeLoading(true);

    try {
      const title = `Delivering ${pledgeForm.quantity} ${pledgeForm.item_name} to ${pledgeForm.ward}`;

      // Try FastAPI backend first, fall back to direct Supabase insert
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      let usedBackend = false;

      try {
        const res = await fetch(`${backendUrl}/pledge-task`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_name: pledgeForm.item_name,
            quantity: parseInt(pledgeForm.quantity),
            description: pledgeForm.description || null,
            district: profile.district || "Unknown",
            ward: pledgeForm.ward,
            volunteer_id: user.id,
            due_date: pledgeForm.due_date || null,
          }),
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        if (res.ok) usedBackend = true;
      } catch {
        // Backend not available — use direct Supabase insert
        console.warn("Backend unreachable, using direct Supabase insert");
      }

      if (!usedBackend) {
        const { error: insertError } = await supabase.from("tasks").insert({
          title,
          description: pledgeForm.description || null,
          item_name: pledgeForm.item_name,
          quantity: parseInt(pledgeForm.quantity),
          district: profile.district || "Unknown",
          ward: pledgeForm.ward,
          assigned_to: user.id,
          assigned_by: null,
          is_self_pledged: true,
          status: "pending",
          due_date: pledgeForm.due_date || null,
        });

        if (insertError) throw insertError;
      }

      // Reset form and close modal
      setPledgeForm({ item_name: "", quantity: "", description: "", ward: "", due_date: "" });
      setShowPledgeModal(false);
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error("Error creating pledge:", err);
      alert("Failed to create pledge. Please try again.");
    } finally {
      setPledgeLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#87A878]/30" />
          <div className="h-4 w-32 bg-[#87A878]/30 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#2D4A2D] flex flex-col font-sans">
      {/* Forest Green Navbar with Gold Groundwork Wordmark */}
      <header className="bg-[#2D4A2D] text-[#F5F0E8] px-6 py-4 border-b border-[#87A878]/30 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image src="/seal.png" alt="Seal" fill sizes="32px" className="object-contain" />
            </div>
            <Link
              href="/"
              className="font-serif text-xl font-bold tracking-widest text-[#C4973A] hover:text-[#d4a84b]"
            >
              GROUNDWORK
            </Link>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="hidden sm:inline text-[#87A878]">
              {profile?.full_name || "Volunteer"}
            </span>
            <Link
              href="/dashboard/volunteer/history"
              className="flex items-center gap-1.5 text-[#87A878] hover:text-white transition-colors"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[#87A878] hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <h1 className="font-serif text-3xl font-bold text-[#2D4A2D]">
            {getGreeting()}, {profile?.full_name || "Volunteer"}.
          </h1>
          <p className="text-sm text-[#6B7C4A] mt-1">
            {profile?.district}
            {profile?.ward && ` • ${profile.ward}`}
          </p>
        </motion.div>

        {/* Stats Bar — Three pills */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#6B7C4A]/[0.08] border border-[#6B7C4A]/[0.16] text-sm font-sans">
            <CheckCircle2 className="w-4 h-4 text-[#2D4A2D]" />
            <span className="text-[#2D4A2D] font-medium">{stats.verified}</span>
            <span className="text-[#6B7C4A]">Verified</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#6B7C4A]/[0.08] border border-[#6B7C4A]/[0.16] text-sm font-sans">
            <Clock className="w-4 h-4 text-[#C4973A]" />
            <span className="text-[#2D4A2D] font-medium">{stats.pending}</span>
            <span className="text-[#6B7C4A]">Pending</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#6B7C4A]/[0.08] border border-[#6B7C4A]/[0.16] text-sm font-sans">
            <Layers className="w-4 h-4 text-[#8B5E3C]" />
            <span className="text-[#2D4A2D] font-medium">{stats.onLedger}</span>
            <span className="text-[#6B7C4A]">On Ledger ⛓</span>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-[#2D4A2D]">
              Your Tasks
            </h2>
            <span className="text-xs text-[#6B7C4A]">
              {tasks.length} Task{tasks.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loadingTasks ? (
            /* Skeleton loaders */
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white border border-[#87A878]/30 animate-pulse"
                >
                  <div className="flex gap-2 mb-3">
                    <div className="h-5 w-16 bg-[#6B7C4A]/15 rounded-full" />
                    <div className="h-5 w-20 bg-[#6B7C4A]/15 rounded-full" />
                  </div>
                  <div className="h-6 w-3/4 bg-[#6B7C4A]/15 rounded mb-2" />
                  <div className="h-4 w-1/2 bg-[#6B7C4A]/10 rounded" />
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            /* Empty state */
            <div className="text-center py-12">
              <p className="text-[#87A878] font-sans text-sm">
                No tasks yet. Pledge your first relief task below.
              </p>
            </div>
          ) : (
            /* Rendered task cards */
            <div className="grid grid-cols-1 gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task_id={task.id}
                  title={task.title}
                  description={task.description}
                  status={task.status}
                  due_date={task.due_date}
                  is_self_pledged={task.is_self_pledged}
                  item_name={task.item_name}
                  quantity={task.quantity}
                  district={task.district}
                  ward={task.ward}
                />
              ))}
            </div>
          )}
        </div>

        {/* ＋ New Pledge Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowPledgeModal(true)}
            className="btn-gold px-6 py-3 text-sm font-semibold flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            New Pledge
          </button>
        </div>
      </main>

      {/* Pledge Modal */}
      <AnimatePresence>
        {showPledgeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowPledgeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-[#F5F0E8] rounded-2xl shadow-xl w-full max-w-md p-6 md:p-8 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-[#2D4A2D]">
                  Pledge a Relief Task
                </h2>
                <button
                  onClick={() => setShowPledgeModal(false)}
                  className="p-1 rounded-lg hover:bg-[#2D4A2D]/10 transition-colors"
                >
                  <X className="w-5 h-5 text-[#6B7C4A]" />
                </button>
              </div>

              {/* Pledge Form */}
              <form onSubmit={handlePledgeSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#6B7C4A] font-semibold mb-1.5">
                    Item Name
                  </label>
                  <div className="relative">
                    <Package className="w-4 h-4 absolute left-3 top-3 text-[#6B7C4A]" />
                    <input
                      type="text"
                      required
                      value={pledgeForm.item_name}
                      onChange={(e) =>
                        setPledgeForm({ ...pledgeForm, item_name: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none focus:border-[#2D4A2D]"
                      placeholder="e.g. water bottles, tarpaulins"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#6B7C4A] font-semibold mb-1.5">
                    Quantity
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3 top-3 text-[#6B7C4A]" />
                    <input
                      type="number"
                      required
                      min="1"
                      value={pledgeForm.quantity}
                      onChange={(e) =>
                        setPledgeForm({ ...pledgeForm, quantity: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none focus:border-[#2D4A2D]"
                      placeholder="50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#6B7C4A] font-semibold mb-1.5">
                    Ward / Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-[#6B7C4A]" />
                    <input
                      type="text"
                      required
                      value={pledgeForm.ward}
                      onChange={(e) =>
                        setPledgeForm({ ...pledgeForm, ward: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none focus:border-[#2D4A2D]"
                      placeholder="e.g. Ward 7, Meppadi"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#6B7C4A] font-semibold mb-1.5">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={pledgeForm.description}
                    onChange={(e) =>
                      setPledgeForm({ ...pledgeForm, description: e.target.value })
                    }
                    className="w-full p-3 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none focus:border-[#2D4A2D]"
                    placeholder="Any additional details..."
                  />
                </div>

                <div>
                  <label className="block text-[#6B7C4A] font-semibold mb-1.5">
                    Due Date (Optional)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-3 text-[#6B7C4A]" />
                    <input
                      type="date"
                      value={pledgeForm.due_date}
                      onChange={(e) =>
                        setPledgeForm({ ...pledgeForm, due_date: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none focus:border-[#2D4A2D]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={pledgeLoading}
                  className="w-full btn-gold py-3 text-xs font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {pledgeLoading ? "Creating Pledge..." : "Submit Pledge →"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
