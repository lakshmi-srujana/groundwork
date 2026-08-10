"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VerificationSubmission } from "@/lib/dummyData";
import StatusBadge from "./StatusBadge";
import { Check, X, MapPin, ShieldCheck, Sparkles, FileText, Phone } from "lucide-react";

interface VerificationCardProps {
  submission: VerificationSubmission;
  index?: number;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function VerificationCard({
  submission,
  index = 0,
  onApprove,
  onReject,
}: VerificationCardProps) {
  const [currentStatus, setCurrentStatus] = useState(submission.status);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProcessing(true);
    setTimeout(() => {
      setCurrentStatus("Verified");
      setIsProcessing(false);
      if (onApprove) onApprove(submission.id);
    }, 300);
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProcessing(true);
    setTimeout(() => {
      setCurrentStatus("Rejected");
      setIsProcessing(false);
      if (onReject) onReject(submission.id);
    }, 300);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => setShowDetailModal(true)}
        className="groundwork-card p-5 flex flex-col justify-between cursor-pointer group hover:border-[#87A878] relative overflow-hidden"
      >
        {/* Top Header: Volunteer info + Status */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <img
                src={submission.volunteerAvatar}
                alt={submission.volunteerName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div>
                <h4 className="text-sm font-semibold text-[#2D4A2D] group-hover:text-[#6B7C4A] transition-colors">
                  {submission.volunteerName}
                </h4>
                <p className="text-xs text-[#6B7C4A] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C4973A]" />
                  {submission.district} • {submission.wardOrZone}
                </p>
              </div>
            </div>

            <StatusBadge status={currentStatus} size="sm" />
          </div>

          {/* Proof Visual Placeholder / Banner */}
          <div
            className="w-full h-32 rounded-lg relative overflow-hidden mb-4 p-3 flex flex-col justify-between border border-[#87A878]/30 shadow-inner transition-transform group-hover:scale-[1.01]"
            style={{ backgroundColor: submission.imageBgColor || "#2D4A2D" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs text-[11px] text-white font-medium">
                <FileText className="w-3 h-3 text-[#C4973A]" />
                {submission.proofType}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 backdrop-blur-xs text-[11px] text-emerald-300 font-semibold border border-emerald-500/30">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {submission.aiConfidenceScore}% AI Match
              </span>
            </div>

            <div className="relative z-10">
              <p className="text-xs font-medium text-white line-clamp-1">
                {submission.proofThumbnailText}
              </p>
              <p className="text-[10px] text-white/70">
                GPS Tag: {submission.coordinates}
              </p>
            </div>
          </div>

          {/* Task Info & Notes */}
          <div className="space-y-2 mb-4 text-xs">
            <div className="flex items-center justify-between text-[#2D4A2D]">
              <span className="text-[#6B7C4A]">Task Category:</span>
              <span className="font-medium bg-[#F5F0E8] px-2 py-0.5 rounded border border-[#87A878]/30">
                {submission.taskType}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#2D4A2D]">
              <span className="text-[#6B7C4A]">Delivered Items:</span>
              <span className="font-semibold">{submission.itemsDelivered}</span>
            </div>

            <p className="text-[#2D4A2D]/80 text-[11px] bg-[#F5F0E8]/60 p-2 rounded border border-[#87A878]/20 italic line-clamp-2">
              "{submission.notes}"
            </p>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-3 border-t border-[#87A878]/20 flex items-center justify-between gap-2">
          <span className="text-[11px] text-[#6B7C4A]">{submission.timestamp}</span>

          <div className="flex items-center gap-2">
            {currentStatus === "Pending" ? (
              <>
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium btn-gold flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve
                </button>
              </>
            ) : (
              <span className="text-xs text-[#6B7C4A] font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D4A2D]" />
                Action Recorded
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Details Lightbox Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-[#87A878]/30 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#87A878]/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C4973A]">
                    Submission Ref: {submission.id}
                  </span>
                  <StatusBadge status={currentStatus} size="sm" />
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-1 rounded-full text-[#6B7C4A] hover:bg-[#F5F0E8]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={submission.volunteerAvatar}
                  alt={submission.volunteerName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#87A878]"
                />
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#2D4A2D]">
                    {submission.volunteerName}
                  </h3>
                  <p className="text-xs text-[#6B7C4A] flex items-center gap-2">
                    <span>{submission.wardOrZone}, {submission.district}</span>
                    <span className="flex items-center gap-1 text-[#2D4A2D]">
                      <Phone className="w-3 h-3 text-[#C4973A]" />
                      {submission.volunteerPhone}
                    </span>
                  </p>
                </div>
              </div>

              <div
                className="w-full h-44 rounded-lg relative p-4 flex flex-col justify-between text-white"
                style={{ backgroundColor: submission.imageBgColor }}
              >
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 rounded bg-black/50 text-xs">
                    {submission.proofType}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-emerald-900/90 text-emerald-300 text-xs font-semibold">
                    {submission.aiConfidenceScore}% AI Confidence Score
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{submission.proofThumbnailText}</p>
                  <p className="text-xs opacity-80">Geotag: {submission.coordinates}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-[#F5F0E8] p-3 rounded-lg border border-[#87A878]/30 space-y-1">
                  <p className="font-semibold text-[#2D4A2D]">Items & Quantities:</p>
                  <p className="text-[#6B7C4A]">{submission.itemsDelivered}</p>
                </div>
                <div className="bg-[#F5F0E8] p-3 rounded-lg border border-[#87A878]/30 space-y-1">
                  <p className="font-semibold text-[#2D4A2D]">Field Log Notes:</p>
                  <p className="text-[#6B7C4A]">{submission.notes}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {currentStatus === "Pending" ? (
                  <>
                    <button
                      onClick={handleReject}
                      className="px-4 py-2 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                    >
                      Reject Proof
                    </button>
                    <button
                      onClick={handleApprove}
                      className="px-5 py-2 rounded-lg text-xs font-medium btn-gold"
                    >
                      Approve & Verify
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-medium bg-[#2D4A2D] text-white"
                  >
                    Close Inspection
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
