"use client";

import { useState } from "react";
import { LIVE_TASKS_DATA, LiveTask } from "@/lib/dummyData";
import StatusBadge from "@/components/ui/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ListTodo, MapPin, Shield, ChevronRight, X, AlertCircle, Phone } from "lucide-react";

export default function LiveTasksPage() {
  const [tasks, setTasks] = useState<LiveTask[]>(LIVE_TASKS_DATA);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [districtFilter, setDistrictFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<LiveTask | null>(null);

  // Extract unique districts
  const districtsList = ["All", ...Array.from(new Set(tasks.map((t) => t.district.split(" ")[0])))];

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus =
      statusFilter === "All" ||
      t.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesDistrict =
      districtFilter === "All" ||
      t.district.toLowerCase().includes(districtFilter.toLowerCase());

    const matchesSearch =
      t.taskId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.volunteer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.district.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesDistrict && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#87A878]/30"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7C4A] mb-1">
            <ListTodo className="w-4 h-4 text-[#C4973A]" />
            <span>Active Operations Ledger • Live Telemetry</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#2D4A2D]">
            Live Relief Tasks
          </h1>
          <p className="text-sm text-[#6B7C4A] mt-1">
            Complete active micro-relief task directory across Wayanad, Cachar, Jorhat, Chamoli, and Malappuram hubs.
          </p>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#2D4A2D]">
          <span className="px-3 py-1.5 rounded-lg bg-white border border-[#87A878]/30 shadow-2xs">
            Total Displayed: <strong className="text-[#C4973A]">{filteredTasks.length}</strong> tasks
          </span>
        </div>
      </motion.div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#87A878]/30 shadow-xs">
        {/* Filter Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Select */}
          <div className="flex items-center gap-1.5 text-xs text-[#6B7C4A]">
            <Filter className="w-3.5 h-3.5 text-[#C4973A]" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F5F0E8] border border-[#87A878]/40 text-[#2D4A2D] text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2D4A2D]"
            >
              <option value="All">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* District Select */}
          <div className="flex items-center gap-1.5 text-xs text-[#6B7C4A]">
            <MapPin className="w-3.5 h-3.5 text-[#6B7C4A]" />
            <span>District:</span>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-[#F5F0E8] border border-[#87A878]/40 text-[#2D4A2D] text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2D4A2D]"
            >
              {districtsList.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All Districts" : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-[#6B7C4A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Task ID, volunteer, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-[#87A878]/40 bg-[#F5F0E8]/50 focus:bg-white focus:outline-none focus:border-[#2D4A2D] text-[#2D4A2D] placeholder-[#6B7C4A]"
          />
        </div>
      </div>

      {/* Tasks Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="groundwork-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#2D4A2D]">
            <thead className="bg-[#2D4A2D] text-[#F5F0E8] uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th scope="col" className="px-5 py-3.5">
                  Task ID
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Volunteer
                </th>
                <th scope="col" className="px-5 py-3.5">
                  District
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Task Type
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Priority
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Last Updated
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#87A878]/20 bg-white">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className="hover:bg-[#F5F0E8]/70 transition-colors cursor-pointer group"
                  >
                    {/* Task ID */}
                    <td className="px-5 py-4 font-mono font-semibold text-[#2D4A2D] group-hover:text-[#C4973A]">
                      {t.taskId}
                    </td>

                    {/* Volunteer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={t.volunteerAvatar}
                          alt={t.volunteer}
                          className="w-7 h-7 rounded-full object-cover border border-[#87A878]/30"
                        />
                        <span className="font-semibold text-[#2D4A2D]">
                          {t.volunteer}
                        </span>
                      </div>
                    </td>

                    {/* District */}
                    <td className="px-5 py-4 font-medium text-[#6B7C4A]">
                      {t.district}
                    </td>

                    {/* Task Type */}
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#F5F0E8] border border-[#87A878]/30 font-medium text-[#2D4A2D]">
                        {t.taskType}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.priority === "Critical"
                            ? "bg-rose-100 text-rose-800"
                            : t.priority === "High"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <StatusBadge status={t.status} size="sm" />
                    </td>

                    {/* Last Updated */}
                    <td className="px-5 py-4 text-[#6B7C4A]">
                      {t.lastUpdated}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(t);
                        }}
                        className="p-1 rounded hover:bg-[#87A878]/20 text-[#6B7C4A] group-hover:text-[#2D4A2D] transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-[#6B7C4A]">
                    No matching relief tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Inspect Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-[#87A878]/30 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#87A878]/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#C4973A]">
                    {selectedTask.taskId}
                  </span>
                  <StatusBadge status={selectedTask.status} size="sm" />
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1 rounded-full text-[#6B7C4A] hover:bg-[#F5F0E8]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F5F0E8]/70 border border-[#87A878]/20">
                  <img
                    src={selectedTask.volunteerAvatar}
                    alt={selectedTask.volunteer}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#87A878]"
                  />
                  <div>
                    <h4 className="font-semibold text-sm text-[#2D4A2D]">
                      {selectedTask.volunteer}
                    </h4>
                    <p className="text-[#6B7C4A]">Assigned Field Agent</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[#2D4A2D]">
                  <div className="bg-[#F5F0E8] p-2.5 rounded border border-[#87A878]/20">
                    <span className="text-[10px] text-[#6B7C4A] uppercase font-bold block">
                      Target Sector
                    </span>
                    <span className="font-semibold">{selectedTask.district}</span>
                  </div>
                  <div className="bg-[#F5F0E8] p-2.5 rounded border border-[#87A878]/20">
                    <span className="text-[10px] text-[#6B7C4A] uppercase font-bold block">
                      Task Priority
                    </span>
                    <span className="font-semibold">{selectedTask.priority}</span>
                  </div>
                  <div className="bg-[#F5F0E8] p-2.5 rounded border border-[#87A878]/20">
                    <span className="text-[10px] text-[#6B7C4A] uppercase font-bold block">
                      Supplies Batch
                    </span>
                    <span className="font-semibold">{selectedTask.quantity}</span>
                  </div>
                  <div className="bg-[#F5F0E8] p-2.5 rounded border border-[#87A878]/20">
                    <span className="text-[10px] text-[#6B7C4A] uppercase font-bold block">
                      Impacted Victims
                    </span>
                    <span className="font-semibold">{selectedTask.beneficiariesCount} people</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#2D4A2D]/5 border border-[#2D4A2D]/20 space-y-1">
                  <span className="text-[10px] text-[#2D4A2D] font-bold uppercase block">
                    GPS Geotag Telemetry:
                  </span>
                  <p className="font-mono text-xs text-[#2D4A2D]">{selectedTask.gpsTag}</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium btn-gold"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
