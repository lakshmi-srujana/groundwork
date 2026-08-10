"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ListTodo,
  MapPin,
  Send,
  Plus,
  X,
  Package,
  Hash,
  User,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import StatusBadge, { StatusType } from "@/components/ui/StatusBadge";
import { useAuth } from "@/components/AuthProvider";

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  item_name: string | null;
  quantity: number | null;
  district: string;
  ward: string | null;
  assigned_to: string | null;
  status: string;
  due_date: string | null;
  is_self_pledged: boolean;
  profiles?: {
    full_name: string | null;
    aapda_mitra_id: string | null;
  } | null;
}

interface VolunteerProfile {
  id: string;
  full_name: string | null;
  district: string | null;
  aapda_mitra_id: string | null;
}

export default function LiveTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dispatch Task Modal
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
    title: "",
    description: "",
    item_name: "",
    quantity: "",
    district: "Wayanad",
    ward: "",
    volunteer_id: "",
    due_date: "",
  });
  const [dispatchLoading, setDispatchLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          profiles:assigned_to ( full_name, aapda_mitra_id )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVolunteers = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, district, aapda_mitra_id")
        .eq("role", "volunteer");

      if (data) {
        setVolunteers(data);
        if (data.length > 0) {
          setDispatchForm((prev) => ({ ...prev, volunteer_id: data[0].id }));
        }
      }
    } catch (err) {
      console.error("Error fetching volunteers:", err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchVolunteers();
  }, [fetchTasks, fetchVolunteers]);

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("coordinator-live-tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => fetchTasks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  // Handle Dispatch submit
  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setDispatchLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/assign-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: dispatchForm.title,
          description: dispatchForm.description || "",
          item_name: dispatchForm.item_name,
          quantity: parseInt(dispatchForm.quantity) || 1,
          district: dispatchForm.district,
          ward: dispatchForm.ward,
          volunteer_id: dispatchForm.volunteer_id,
          coordinator_id: user.id,
          due_date: dispatchForm.due_date || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to dispatch task");

      setShowDispatchModal(false);
      setDispatchForm({
        title: "",
        description: "",
        item_name: "",
        quantity: "",
        district: "Wayanad",
        ward: "",
        volunteer_id: volunteers[0]?.id || "",
        due_date: "",
      });
      fetchTasks();
    } catch (err) {
      console.error("Dispatch error:", err);
    } finally {
      setDispatchLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus =
      statusFilter === "All" || t.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#87A878]/30"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7C4A] mb-1">
            <ListTodo className="w-4 h-4 text-[#C4973A]" />
            <span>Active Operations Directory • Real-Time Task Dispatch</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#2D4A2D]">
            Live Relief Tasks
          </h1>
          <p className="text-sm text-[#6B7C4A] mt-1">
            Dispatch relief assignments directly to field volunteers and monitor progress.
          </p>
        </div>

        <button
          onClick={() => setShowDispatchModal(true)}
          className="btn-gold px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Dispatch New Task
        </button>
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-[#2D4A2D]/10 p-1 rounded-xl border border-[#87A878]/20 text-xs font-medium">
          {["All", "Pending", "Submitted", "Verified", "Rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === st
                  ? "bg-[#2D4A2D] text-white shadow-sm font-semibold"
                  : "text-[#6B7C4A] hover:text-[#2D4A2D]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 text-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B7C4A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search task or volunteer..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none focus:border-[#2D4A2D]"
          />
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-[#87A878]/30 animate-pulse h-28" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#87A878]/30 p-8 space-y-2 text-xs text-[#6B7C4A]">
          <ListTodo className="w-10 h-10 text-[#87A878] mx-auto" />
          <p className="font-semibold text-sm text-[#2D4A2D]">No Tasks Found</p>
          <p>No tasks match your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((t) => {
            const badgeStatus: StatusType =
              t.status === "verified"
                ? "Verified"
                : t.status === "submitted"
                ? "In Progress"
                : t.status === "rejected"
                ? "Rejected"
                : "Pending";

            return (
              <div
                key={t.id}
                className="p-6 rounded-2xl bg-white border border-[#87A878]/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={badgeStatus} size="sm" />
                    {t.is_self_pledged ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#6B7C4A]/15 text-[#6B7C4A] border border-[#6B7C4A]/30 font-semibold text-[11px]">
                        Self-Pledged
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#87A878]/15 text-[#87A878] border border-[#87A878]/30 font-semibold text-[11px]">
                        Assigned
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-[#2D4A2D]">
                    {t.title}
                  </h3>

                  <p className="text-[#6B7C4A]">
                    <span className="font-semibold text-[#2D4A2D]">Assigned Volunteer:</span>{" "}
                    {t.profiles?.full_name || "Unassigned"}
                    {t.profiles?.aapda_mitra_id && ` (${t.profiles.aapda_mitra_id})`}
                    {" • "}
                    <MapPin className="w-3.5 h-3.5 inline text-[#C4973A]" />{" "}
                    {t.ward && `${t.ward}, `}{t.district}
                  </p>

                  {t.item_name && (
                    <p className="text-[#6B7C4A]">
                      Cargo:{" "}
                      <span className="font-medium text-[#2D4A2D]">
                        {t.quantity}x {t.item_name}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dispatch Modal */}
      <AnimatePresence>
        {showDispatchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowDispatchModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#F5F0E8] rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-[#2D4A2D]">
                  Dispatch Task to Volunteer
                </h2>
                <button onClick={() => setShowDispatchModal(false)}>
                  <X className="w-5 h-5 text-[#6B7C4A]" />
                </button>
              </div>

              <form onSubmit={handleDispatchSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#6B7C4A] font-semibold mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.title}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, title: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none"
                    placeholder="Deliver 50 Water Drums"
                  />
                </div>

                <div>
                  <label className="block text-[#6B7C4A] font-semibold mb-1">
                    Assign to Volunteer
                  </label>
                  <select
                    value={dispatchForm.volunteer_id}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, volunteer_id: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none"
                  >
                    {volunteers.length === 0 ? (
                      <option value="">No registered volunteers found</option>
                    ) : (
                      volunteers.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.full_name || "Volunteer"} ({v.district || "Zone"})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#6B7C4A] font-semibold mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      required
                      value={dispatchForm.item_name}
                      onChange={(e) =>
                        setDispatchForm({ ...dispatchForm, item_name: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none"
                      placeholder="Water Canisters"
                    />
                  </div>

                  <div>
                    <label className="block text-[#6B7C4A] font-semibold mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={dispatchForm.quantity}
                      onChange={(e) =>
                        setDispatchForm({ ...dispatchForm, quantity: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none"
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#6B7C4A] font-semibold mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      required
                      value={dispatchForm.district}
                      onChange={(e) =>
                        setDispatchForm({ ...dispatchForm, district: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#6B7C4A] font-semibold mb-1">
                      Ward / Zone
                    </label>
                    <input
                      type="text"
                      required
                      value={dispatchForm.ward}
                      onChange={(e) =>
                        setDispatchForm({ ...dispatchForm, ward: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none"
                      placeholder="Ward 7 Meppadi"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#6B7C4A] font-semibold mb-1">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={dispatchForm.due_date}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, due_date: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={dispatchLoading || volunteers.length === 0}
                  className="w-full btn-gold py-3 font-semibold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {dispatchLoading ? "Dispatching..." : "Dispatch Task →"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
