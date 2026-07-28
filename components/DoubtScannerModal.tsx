'use client';

import React, { useState, useRef } from 'react';
import { playSound } from '@/lib/sound';
import { SearchIcon, CameraIcon, CheckIcon, BackArrowIcon } from '@/components/ui/Icons';

export interface DoubtScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
}

export const DoubtScannerModal: React.FC<DoubtScannerModalProps> = ({
  isOpen,
  onClose,
  studentId,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [aiResolution, setAiResolution] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleTriggerFileInput = () => {
    playSound('click');
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    playSound('pop');
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      scanDoubtImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const scanDoubtImage = async (base64Image: string) => {
    setLoading(true);
    setError(null);
    setExtractedText(null);
    setAiResolution(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          studentId: studentId || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze doubt image.');
      }

      setExtractedText(data.extractedText || null);
      setAiResolution(data.aiResolution || null);
      playSound('fanfare');
    } catch (err: any) {
      console.error('Doubt scan error:', err);
      setError(err?.message || 'Failed to scan image. Please try again.');
      playSound('wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    playSound('click');
    setImagePreview(null);
    setExtractedText(null);
    setAiResolution(null);
    setError(null);
  };

  const handleClose = () => {
    playSound('click');
    handleReset();
    onClose();
  };

  // Claymorphic container style formulas
  const modalOverlayStyle = "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in";
  const clayModalContainer = "bg-[#f4f7fb] w-full max-w-2xl rounded-3xl p-6 md:p-8 border border-white/80 shadow-[12px_24px_36px_rgba(0,0,0,0.12)] relative flex flex-col gap-6 before:absolute before:inset-0 before:rounded-3xl before:shadow-[inset_3px_5px_10px_rgba(255,255,255,0.9)] before:pointer-events-none";

  return (
    <div className={modalOverlayStyle} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className={clayModalContainer}>
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-700 flex items-center justify-center shadow-[inset_2px_3px_5px_rgba(0,0,0,0.08)] border border-amber-300/40">
              <SearchIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
                AI Doubt Scanner
              </h2>
              <p className="text-xs font-bold text-slate-500">
                Snap or upload your Math & EVS questions for step-by-step guidance
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-slate-200/80 hover:bg-rose-100 hover:text-rose-600 text-slate-600 font-black text-lg flex items-center justify-center transition-all shadow-[inset_1px_2px_4px_rgba(255,255,255,0.8)] cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* HIDDEN FILE INPUT WITH CAMERA CAPTURE */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* INITIAL STATE / UPLOAD TRIGGER BUTTON */}
        {!imagePreview && !loading && (
          <div className="flex flex-col items-center justify-center p-8 bg-white/70 rounded-3xl border-2 border-dashed border-slate-300/80 text-center gap-6 shadow-[inset_2px_4px_8px_rgba(0,0,0,0.03)]">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner border border-amber-200">
              <CameraIcon className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-extrabold text-slate-800 mb-1">
                Got a tricky question?
              </h3>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Take a clear picture of your textbook, homework, or worksheet, and our encouraging AI tutor will break it down for you!
              </p>
            </div>

            {/* LARGE PUFFY BRIGHTLY COLORED CLAY BUTTON */}
            <button
              onClick={handleTriggerFileInput}
              className="bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-600 text-amber-950 font-extrabold text-base shadow-[0_10px_20px_rgba(245,158,11,0.35)] border-t-2 border-white/80 rounded-3xl py-3.5 px-8 hover:-translate-y-0.5 active:translate-y-1 transition-all duration-150 cursor-pointer flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              <CameraIcon className="w-5 h-5" />
              <span>Upload or Snap Photo</span>
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-10 bg-white/80 rounded-3xl border border-white/80 shadow-[inset_2px_4px_8px_rgba(0,0,0,0.02)] text-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 animate-ping opacity-30 absolute inset-0"></div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 text-amber-900 flex items-center justify-center shadow-[0_8px_20px_rgba(245,158,11,0.3)] border-2 border-white relative z-10 animate-pulse">
                <SearchIcon className="w-10 h-10" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight animate-pulse">
                Analyzing Your Question...
              </h3>
              <p className="text-xs font-bold text-amber-700 mt-1">
                Reading your image and preparing step-by-step hints
              </p>
            </div>

            {/* Image Thumbnail Preview during loading */}
            {imagePreview && (
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md">
                <img src={imagePreview} alt="Scanning target" className="w-full h-full object-cover opacity-80" />
              </div>
            )}
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-bold flex items-center justify-between">
            <span>Notice: {error}</span>
            <button
              onClick={handleTriggerFileInput}
              className="px-3 py-1 bg-rose-600 text-white text-xs font-extrabold rounded-xl shadow cursor-pointer hover:bg-rose-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* RESULT DISPLAY */}
        {!loading && aiResolution && (
          <div className="flex flex-col gap-5">
            {/* EXTRACTED QUESTION PREVIEW */}
            {extractedText && (
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-[inset_1px_2px_4px_rgba(0,0,0,0.03)]">
                <span className="bg-amber-200/60 text-amber-900 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                  Target Question
                </span>
                <div>
                  <p className="text-sm font-bold text-amber-950 italic">
                    {extractedText}
                  </p>
                </div>
              </div>
            )}

            {/* STARK WHITE CLAY CARD FOR AI RESOLUTION */}
            <div className="bg-white shadow-[inset_2px_4px_8px_rgba(0,0,0,0.03),0_10px_25px_rgba(0,0,0,0.05)] border border-slate-200/80 rounded-3xl p-6 md:p-7 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4 text-emerald-600 font-extrabold text-sm uppercase tracking-wide border-b border-slate-100 pb-2">
                <CheckIcon />
                <span>Encouraging AI Tutor Explanation</span>
              </div>

              {/* RENDER STEP-BY-STEP RESPONSE */}
              <div className="text-slate-800 text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap flex flex-col gap-2">
                {aiResolution}
              </div>
            </div>

            {/* ACTIONS FOOTER */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={handleReset}
                className="bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-extrabold text-sm px-6 py-3 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
              >
                <CameraIcon className="w-4 h-4" />
                <span>Scan Another Question</span>
              </button>

              <button
                onClick={handleClose}
                className="bg-gradient-to-b from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-sm px-6 py-3 rounded-2xl shadow-[0_6px_16px_rgba(16,185,129,0.3)] border-t border-white/50 hover:-translate-y-0.5 active:translate-y-1 transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckIcon />
                <span>Got It! Thanks</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
