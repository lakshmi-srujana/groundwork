"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Camera,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  Cpu,
  Database,
  ExternalLink,
  UserCheck,
  PackageCheck,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import StatusBadge from "@/components/ui/StatusBadge";

interface Task {
  id: string;
  title: string;
  description: string | null;
  item_name: string | null;
  quantity: number | null;
  district: string;
  ward: string | null;
  status: string;
}

interface VerificationResult {
  verdict: "verified" | "rejected" | "uncertain";
  confidence: number;
  face_detected: boolean;
  items_visible: boolean;
  item_match?: boolean;
  expected_item?: string;
  detected_items?: string[];
  notes: string;
  ipfs_cid?: string;
  ipfs_url?: string;
  tx_hash?: string;
}

function SubmitProofContent() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const initialTaskId = searchParams.get("taskId");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTaskId || "");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null); // Base64
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<string>(""); // Step description for progress UI
  const [result, setResult] = useState<VerificationResult | null>(null);

  // Fetch pending tasks for current volunteer
  useEffect(() => {
    if (!user) return;
    async function loadTasks() {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("assigned_to", user?.id || "")
        .in("status", ["pending", "submitted"]);

      if (data && data.length > 0) {
        setTasks(data);
        if (!selectedTaskId) {
          setSelectedTaskId(data[0].id);
        }
      }
    }
    loadTasks();
  }, [user, selectedTaskId]);

  // Request Geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => {
          console.warn("Geolocation error:", err);
          setLocationError("GPS signal weak. Using fallback coordinates.");
          setLocation({ lat: 11.5542, lng: 76.1264, accuracy: 15 }); // Wayanad default
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocation({ lat: 11.5542, lng: 76.1264, accuracy: 15 });
    }
  }, []);

  // Start Camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied or unverified camera device.");
    }
  }, []);

  // Stop Camera stream
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Take Photo Snapshot
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64Data = dataUrl.split(",")[1];

    setCapturedImage(base64Data);
    stopCamera();
  };

  // Retake Photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setResult(null);
    startCamera();
  };

  // Submit Proof to Backend + Supabase + Blockchain
  const handleSubmitProof = async () => {
    if (!capturedImage || !selectedTaskId || !user) return;

    const selectedTask = tasks.find((t) => t.id === selectedTaskId);
    if (!selectedTask) return;

    setSubmitting(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

      // 1. AI Vision Verification
      setSubmitStep("Analyzing photo with Gemini Vision AI...");
      const verifyRes = await fetch(`${backendUrl}/verify-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: capturedImage,
          task_title: selectedTask.title,
          task_description: selectedTask.description || "",
          item_name: selectedTask.item_name || "relief supplies",
          quantity: selectedTask.quantity || 1,
          geolocation: location || { lat: 11.5542, lng: 76.1264, accuracy: 10 },
          volunteer_id: user.id,
          task_id: selectedTask.id,
        }),
      });

      if (!verifyRes.ok) throw new Error("AI verification call failed");
      const aiData = await verifyRes.json();

      // 2. IPFS Upload
      setSubmitStep("Uploading proof image to IPFS decentralized storage...");
      const ipfsRes = await fetch(`${backendUrl}/upload-ipfs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: capturedImage }),
      });

      const ipfsData = ipfsRes.ok ? await ipfsRes.json() : { cid: "bafybeig-mock", ipfs_url: "#" };

      // 3. Save Submission to Supabase
      setSubmitStep("Recording submission telemetry in Supabase...");
      const { data: subData, error: subError } = await supabase
        .from("submissions")
        .insert({
          task_id: selectedTask.id,
          volunteer_id: user.id,
          photo_url: ipfsData.ipfs_url,
          photo_base64: capturedImage,
          ipfs_cid: ipfsData.cid,
          geolocation: location,
          face_detected: aiData.face_detected,
          ai_verdict: aiData.verdict,
          ai_confidence: aiData.confidence,
          ai_notes: aiData.notes,
          blockchain_status: "pending",
        })
        .select()
        .single();

      if (subError) throw subError;

      // 4. Update Task Status in Supabase
      const newStatus =
        aiData.verdict === "verified"
          ? "verified"
          : aiData.verdict === "rejected"
          ? "rejected"
          : "submitted";

      await supabase.from("tasks").update({ status: newStatus }).eq("id", selectedTask.id);

      // 5. Blockchain write (if verified)
      let txHash = "";
      if (aiData.verdict === "verified") {
        setSubmitStep("Minting verification hash on Polygon blockchain...");
        try {
          const bcRes = await fetch(`${backendUrl}/write-blockchain`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              volunteer_id: user.id,
              task_id: selectedTask.id,
              ipfs_cid: ipfsData.cid,
              verdict: aiData.verdict,
            }),
          });

          if (bcRes.ok) {
            const bcData = await bcRes.json();
            txHash = bcData.tx_hash;

            // Update submission with tx hash
            if (subData) {
              await supabase
                .from("submissions")
                .update({ blockchain_tx_hash: txHash, blockchain_status: "written" })
                .eq("id", subData.id);
            }
          }
        } catch (bcErr) {
          console.warn("Blockchain write warning:", bcErr);
        }
      }

      setResult({
        verdict: aiData.verdict,
        confidence: aiData.confidence,
        face_detected: aiData.face_detected,
        items_visible: aiData.items_visible,
        item_match: aiData.item_match,
        expected_item: aiData.expected_item,
        detected_items: aiData.detected_items,
        notes: aiData.notes,
        ipfs_cid: ipfsData.cid,
        ipfs_url: ipfsData.ipfs_url,
        tx_hash: txHash,
      });
    } catch (err: any) {
      console.error("Submission failed:", err);
      alert(`Submission Error: ${err.message}`);
    } finally {
      setSubmitting(false);
      setSubmitStep("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#2D4A2D] flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-[#2D4A2D] text-[#F5F0E8] px-6 py-4 border-b border-[#87A878]/30 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard/volunteer"
            className="flex items-center gap-2 text-xs text-[#87A878] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6">
              <Image src="/seal.png" alt="Seal" fill sizes="32px" className="object-contain" />
            </div>
            <span className="font-serif text-lg text-[#C4973A] font-bold tracking-wider">
              GROUNDWORK
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#87A878]/30 shadow-md space-y-6">
          {/* Header text */}
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#2D4A2D]">
              Live Proof Telemetry Capture
            </h1>
            <p className="text-xs text-[#6B7C4A] mt-1">
              Capture live camera evidence. Images are analyzed via Gemini Vision AI and permanently stored on IPFS & Polygon ledger.
            </p>
          </div>

          {/* Task Selector */}
          <div>
            <label className="block text-[#6B7C4A] font-semibold text-xs mb-1.5">
              Select Assigned Task
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              disabled={submitting || !!result}
              className="w-full p-3 rounded-xl border border-[#87A878]/40 bg-[#F5F0E8]/50 text-[#2D4A2D] font-medium text-xs focus:outline-none focus:border-[#2D4A2D]"
            >
              {tasks.length === 0 ? (
                <option value="">No pending tasks available</option>
              ) : (
                tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title} ({task.ward ? `${task.ward}, ` : ""}{task.district})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Location Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#2D4A2D]/5 border border-[#87A878]/20 text-xs">
            <div className="flex items-center gap-2 text-[#2D4A2D]">
              <MapPin className="w-4 h-4 text-[#C4973A] shrink-0" />
              <span>
                {location
                  ? `GPS Geotag: ${location.lat.toFixed(4)}° N, ${location.lng.toFixed(
                      4
                    )}° E (±${Math.round(location.accuracy)}m)`
                  : "Fetching location..."}
              </span>
            </div>
            {locationError && (
              <span className="text-[11px] text-amber-700 font-medium">
                {locationError}
              </span>
            )}
          </div>

          {/* Hidden Canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Viewfinder / Preview / Results View */}
          {!result ? (
            <div className="space-y-4">
              {/* Frame Container */}
              <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden border border-[#87A878]/40 flex items-center justify-center">
                {capturedImage ? (
                  /* Captured Image Preview */
                  <img
                    src={`data:image/jpeg;base64,${capturedImage}`}
                    alt="Captured proof"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* Live Camera Feed */
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Target Overlay guide */}
                    <div className="absolute inset-8 border-2 border-dashed border-[#C4973A]/60 rounded-lg pointer-events-none flex items-center justify-center">
                      <span className="text-[10px] uppercase font-mono text-[#C4973A] bg-black/60 px-2 py-1 rounded">
                        Position payload & volunteer in frame
                      </span>
                    </div>

                    {cameraError && (
                      <div className="absolute inset-0 bg-black/80 p-6 flex flex-col items-center justify-center text-center text-rose-300 text-xs space-y-2">
                        <AlertTriangle className="w-8 h-8 text-rose-400" />
                        <p>{cameraError}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Submitting Overlay */}
                {submitting && (
                  <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-[#C4973A] animate-spin" />
                    <p className="font-serif text-lg font-bold">Verifying Proof</p>
                    <p className="text-xs text-[#87A878]">{submitStep}</p>
                  </div>
                )}
              </div>

              {/* Camera Action Buttons */}
              <div className="flex gap-3">
                {!capturedImage ? (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={!cameraActive || !selectedTaskId}
                    className="flex-1 btn-gold py-3.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    Capture Proof Frame
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={retakePhoto}
                      disabled={submitting}
                      className="flex-1 py-3 rounded-xl border border-[#87A878]/50 text-[#2D4A2D] hover:bg-[#2D4A2D]/5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retake Frame
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitProof}
                      disabled={submitting}
                      className="flex-1 btn-gold py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Submit Verification →
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Verification Results Display */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Verdict Header */}
              <div
                className={`p-6 rounded-2xl border flex flex-col items-center text-center space-y-3 ${
                  result.verdict === "verified"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : result.verdict === "rejected"
                    ? "bg-rose-50 border-rose-200 text-rose-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                {result.verdict === "verified" && (
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
                )}
                {result.verdict === "rejected" && (
                  <XCircle className="w-12 h-12 text-rose-600" />
                )}
                {result.verdict === "uncertain" && (
                  <AlertTriangle className="w-12 h-12 text-amber-600" />
                )}

                <div>
                  <h2 className="font-serif text-2xl font-bold capitalize">
                    Verification {result.verdict}
                  </h2>
                  <p className="text-xs opacity-80 mt-1">
                    Gemini AI Vision Confidence: {(result.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Telemetry Breakdown Cards */}
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F5F0E8]/60 border border-[#87A878]/30 flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-[#2D4A2D] shrink-0" />
                  <div>
                    <p className="font-semibold text-[#2D4A2D] text-[11px]">Face Detected</p>
                    <p className="text-[10px] text-[#6B7C4A]">
                      {result.face_detected ? "Confirmed" : "No face"}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F0E8]/60 border border-[#87A878]/30 flex items-center gap-2.5">
                  <PackageCheck className="w-4 h-4 text-[#2D4A2D] shrink-0" />
                  <div>
                    <p className="font-semibold text-[#2D4A2D] text-[11px]">Items Visible</p>
                    <p className="text-[10px] text-[#6B7C4A]">
                      {result.items_visible ? "Visible" : "Unclear"}
                    </p>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  result.item_match === false
                    ? "bg-rose-50 border-rose-200 text-rose-900"
                    : "bg-[#F5F0E8]/60 border-[#87A878]/30 text-[#2D4A2D]"
                }`}>
                  <ShieldCheck className={`w-4 h-4 shrink-0 ${result.item_match === false ? "text-rose-600" : "text-[#2D4A2D]"}`} />
                  <div>
                    <p className="font-semibold text-[11px]">Item Match</p>
                    <p className={`text-[10px] ${result.item_match === false ? "text-rose-700 font-bold" : "text-[#6B7C4A]"}`}>
                      {result.item_match === true
                        ? "Matched Payload"
                        : result.item_match === false
                        ? "Mismatch Detected"
                        : "Uncertain"}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Notes */}
              <div className="p-4 rounded-xl bg-[#2D4A2D]/5 border border-[#87A878]/20 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2D4A2D]">
                  <Cpu className="w-4 h-4 text-[#C4973A]" />
                  <span>AI Analysis Notes</span>
                </div>
                <p className="text-xs text-[#6B7C4A] leading-relaxed">{result.notes}</p>
              </div>

              {/* IPFS & Blockchain Ledger Badges */}
              <div className="space-y-2 text-xs">
                {result.ipfs_cid && (
                  <div className="p-3 rounded-xl bg-white border border-[#87A878]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <Database className="w-4 h-4 text-[#87A878] shrink-0" />
                      <span className="font-mono text-[11px] truncate">
                        IPFS: {result.ipfs_cid}
                      </span>
                    </div>
                    {result.ipfs_url && (
                      <a
                        href={result.ipfs_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#C4973A] hover:underline flex items-center gap-1 font-medium text-[11px] shrink-0 ml-2"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {result.tx_hash && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm">⛓</span>
                      <span className="font-mono text-[11px] truncate">
                        Polygon Hash: {result.tx_hash}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-bold uppercase shrink-0 ml-2">
                      Minted
                    </span>
                  </div>
                )}
              </div>

              {/* Back to Dashboard CTA */}
              <Link
                href="/dashboard/volunteer"
                className="w-full btn-gold py-3 text-xs font-semibold flex items-center justify-center gap-2 shadow-md"
              >
                Return to Volunteer Portal →
              </Link>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SubmitProofPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center text-xs">Loading Camera Portal...</div>}>
      <SubmitProofContent />
    </Suspense>
  );
}
