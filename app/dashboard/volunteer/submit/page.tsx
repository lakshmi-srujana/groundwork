"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Upload, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";

export default function SubmitProofPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [taskType, setTaskType] = useState("50 Potable Water Canisters");
  const [notes, setNotes] = useState("Handed over to Camp Coordinator at Ward 7 Meppadi. Geotagged at drop site.");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      router.push("/dashboard/volunteer");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#2D4A2D] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#2D4A2D] text-[#F5F0E8] px-6 py-4 border-b border-[#87A878]/30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard/volunteer"
            className="flex items-center gap-2 text-xs text-[#87A878] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Volunteer Tasks
          </Link>
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6">
              <Image src="/seal.png" alt="Seal" fill className="object-contain" />
            </div>
            <span className="font-serif text-lg text-[#C4973A] font-bold">GROUNDWORK</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#87A878]/30 shadow-md space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#2D4A2D]">
              Submit Proof of Task Fulfillment
            </h1>
            <p className="text-xs text-[#6B7C4A] mt-1">
              Upload geotagged photo or receipt telemetry. AI Vision verifies delivery against coordinator roster.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 text-center space-y-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h2 className="font-serif text-xl font-bold text-emerald-900">
                Proof Submitted Successfully!
              </h2>
              <p className="text-xs text-emerald-700">
                AI Vision score: 98% Confidence. Redirecting to volunteer dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div>
                <label className="block text-[#6B7C4A] font-semibold mb-1.5">
                  Select Task
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full p-3 rounded-lg border border-[#87A878]/40 bg-[#F5F0E8]/50 text-[#2D4A2D] font-medium"
                >
                  <option value="50 Potable Water Canisters">Deliver 50 Potable Water Canisters (Wayanad)</option>
                  <option value="ORS & First Aid Packets">Distribute ORS & First Aid Packets (Chooralmala)</option>
                  <option value="Shelter Tarpaulins">Inspect Heavy-Duty Tarpaulin Drop (Riverbank)</option>
                </select>
              </div>

              {/* Photo Upload Dropzone */}
              <div>
                <label className="block text-[#6B7C4A] font-semibold mb-1.5">
                  Geotagged Photo / Receipt Proof
                </label>
                <div className="border-2 border-dashed border-[#87A878]/50 rounded-xl p-6 text-center bg-[#F5F0E8]/40 hover:bg-[#F5F0E8]/80 transition-colors cursor-pointer space-y-2">
                  <Camera className="w-8 h-8 text-[#C4973A] mx-auto" />
                  <p className="font-semibold text-[#2D4A2D]">Click to capture or upload proof image</p>
                  <p className="text-[11px] text-[#6B7C4A]">JPG, PNG or WEBP up to 10MB • Auto GPS tag embedded</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#2D4A2D]/5 text-[#6B7C4A] text-[11px]">
                <MapPin className="w-4 h-4 text-[#C4973A] shrink-0" />
                <span>Auto GPS Tagged: 11.5542° N, 76.1264° E (Accuracy ~3m)</span>
              </div>

              <div>
                <label className="block text-[#6B7C4A] font-semibold mb-1.5">
                  Field Delivery Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-lg border border-[#87A878]/40 bg-[#F5F0E8]/50 text-[#2D4A2D] font-medium focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-gold py-3 text-xs font-semibold flex items-center justify-center gap-2 shadow-md"
              >
                <ShieldCheck className="w-4 h-4" />
                Submit for AI Clearance →
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
