'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScriptData, ScriptPart, fallbackBeginnerScript } from '@/lib/scriptLoader';
import { playSound } from '@/lib/sound';
import { CheckIcon, StarIcon, TrophyIcon } from '@/components/ui/Icons';

interface ScriptPlayerProps {
  subjectId: string;
  chapterId: string;
  level: string;
  onComplete?: () => void;
}

const AVATAR_MAP: Record<string, { label: string; title: string; colorBg: string }> = {
  doraemon: { label: 'BOT', title: 'Doraemon (Fraction Explorer)', colorBg: 'bg-blue-500/15 text-blue-600 border-blue-200' },
  baker: { label: 'CHEF', title: 'Chef Baker (Ratio Master)', colorBg: 'bg-amber-500/15 text-amber-600 border-amber-200' },
  astronaut: { label: 'ASTRO', title: 'Commander Astro', colorBg: 'bg-purple-500/15 text-purple-600 border-purple-200' },
  scientist: { label: 'DOC', title: 'Dr. Atom', colorBg: 'bg-emerald-500/15 text-emerald-600 border-emerald-200' },
  leo: { label: 'LEO', title: 'Leo (Student)', colorBg: 'bg-indigo-500/15 text-indigo-600 border-indigo-200' },
};

export const ScriptPlayer: React.FC<ScriptPlayerProps> = ({
  subjectId,
  chapterId,
  level,
  onComplete,
}) => {
  const router = useRouter();

  const [script, setScript] = useState<ScriptData | null>(null);
  const [loading, setLoading] = useState(true);

  // Script Navigation State
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);

  // Diagnostic MCQ Gate State
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isMcqAnswered, setIsMcqAnswered] = useState(false);

  // Fetch / Resolve Script JSON Data
  useEffect(() => {
    async function loadScript() {
      setLoading(true);
      const levelNormalized = (level || 'beginner').toLowerCase();
      try {
        const importedScript = await import(
          `@/content/scripts/${subjectId}/${chapterId}/${levelNormalized}.json`
        );
        setScript(importedScript.default || importedScript);
      } catch (e) {
        console.warn(`Script not found for ${subjectId}/${chapterId}/${levelNormalized}, using fallback`);
        setScript(fallbackBeginnerScript);
      } finally {
        setLoading(false);
      }
    }

    loadScript();
  }, [subjectId, chapterId, level]);

  if (loading || !script) {
    return (
      <div className="p-8 text-center bg-white/80 backdrop-blur rounded-[2rem] shadow-xl border border-white/60">
        <p className="text-sm font-bold text-slate-600">Loading Interactive Script Player...</p>
      </div>
    );
  }

  const parts = script.parts || [];
  const currentPart: ScriptPart = parts[currentPartIndex] || parts[0];
  const beats = currentPart?.beats || [];
  const isMcqPart = currentPart?.id === 'diagnostic_pause';
  const isLastPart = currentPartIndex === parts.length - 1;

  // Handle Beat Advancement & Next Controls
  const handleNext = () => {
    playSound('click');

    if (!isMcqPart) {
      if (currentBeatIndex < beats.length - 1) {
        setCurrentBeatIndex((prev) => prev + 1);
      } else if (currentPartIndex < parts.length - 1) {
        const nextIdx = currentPartIndex + 1;
        setCurrentPartIndex(nextIdx);
        setCurrentBeatIndex(0);
        setSelectedOptionId(null);
        setIsMcqAnswered(false);

        if (parts[nextIdx].id === 'xp_recap') {
          playSound('fanfare');
        }
      }
    } else {
      // Diagnostic MCQ advancement
      if (currentPartIndex < parts.length - 1) {
        const nextIdx = currentPartIndex + 1;
        setCurrentPartIndex(nextIdx);
        setCurrentBeatIndex(0);
        setSelectedOptionId(null);
        setIsMcqAnswered(false);

        if (parts[nextIdx].id === 'xp_recap') {
          playSound('fanfare');
        }
      }
    }
  };

  // Handle Diagnostic MCQ Choice Selection
  const handleSelectMcqOption = (optId: string) => {
    if (isMcqAnswered) return;

    setSelectedOptionId(optId);
    setIsMcqAnswered(true);

    const isCorrect = optId === currentPart.correctOptionId;
    playSound(isCorrect ? 'correct' : 'wrong');
  };

  const handleFinishScript = () => {
    playSound('click');
    if (onComplete) {
      onComplete();
    } else {
      router.push(`/learning/${subjectId}/${chapterId}/${level}/quiz`);
    }
  };

  const clayCardFormula =
    'bg-white/90 backdrop-blur-sm shadow-[10px_20px_30px_rgba(0,0,0,0.05)] border border-white/60 relative overflow-hidden before:absolute before:inset-0 before:shadow-[inset_2px_4px_8px_rgba(255,255,255,0.8)] before:pointer-events-none rounded-[2rem]';

  return (
    <div className={`${clayCardFormula} p-6 md:p-8 flex flex-col gap-6 font-sans`}>
      {/* 1. SCRIPT PLAYER HEADER & 5-PART STEPPER */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full px-3.5 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs border border-amber-200">
              {script.chapterTitle || 'Micro-Lesson Script'}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Part {currentPartIndex + 1} of {parts.length}
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {currentPart.id?.toUpperCase().replace('_', ' ')}
          </span>
        </div>

        {/* 5-Segment Progress Bar */}
        <div className="grid grid-cols-5 gap-2">
          {parts.map((p, idx) => {
            const isActive = idx === currentPartIndex;
            const isCompleted = idx < currentPartIndex;

            return (
              <div key={p.id || idx} className="flex flex-col gap-1">
                <div className="bg-slate-100 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08)] rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : isActive
                        ? 'bg-amber-400'
                        : 'bg-transparent'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 text-center truncate">
                  {p.id?.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN SCENE DIRECTION & DIALOGUE AREA */}
      {!isMcqPart ? (
        <div className="flex flex-col gap-4 my-2">
          {beats.slice(0, currentBeatIndex + 1).map((beat, bIdx) => {
            const isLeo = beat.speaker === 'leo';
            const avatarInfo = AVATAR_MAP[beat.speaker] || {
              label: 'GUIDE',
              title: beat.speaker,
              colorBg: 'bg-slate-100 text-slate-700 border-slate-200',
            };

            return (
              <div
                key={bIdx}
                className={`flex gap-3 animate-fadeIn ${
                  isLeo ? 'flex-row-reverse text-right' : 'flex-row'
                }`}
              >
                {/* Speaker Avatar Icon */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-xs shadow-[inset_2px_3px_5px_rgba(0,0,0,0.08)] border shrink-0 ${avatarInfo.colorBg}`}
                >
                  {avatarInfo.label}
                </div>

                {/* Speech Bubble */}
                <div
                  className={`max-w-xl p-4 rounded-3xl border shadow-sm flex flex-col gap-1 ${
                    isLeo
                      ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 text-slate-800 rounded-tr-none'
                      : 'bg-white border-slate-200/80 text-slate-800 rounded-tl-none shadow-[2px_4px_12px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  <span className="text-[11px] font-extrabold opacity-60 uppercase tracking-wider">
                    {avatarInfo.title}
                  </span>

                  {beat.stageDirection && (
                    <p className="text-xs italic font-semibold text-amber-700 bg-amber-50/80 p-2 rounded-xl border border-amber-200/60 my-1">
                      {beat.stageDirection}
                    </p>
                  )}

                  <p className="text-sm md:text-base font-semibold leading-relaxed">
                    {beat.line}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 4. INTERACTIVE DIAGNOSTIC MCQ GATE */
        <div className="flex flex-col gap-6 my-2 p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-[inset_1px_2px_4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            <span className="rounded-full px-3 py-1 bg-purple-100 text-purple-700 font-extrabold text-xs border border-purple-200">
              Diagnostic Checkpoint
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-extrabold text-slate-800 leading-snug">
            {currentPart.prompt}
          </h3>

          {/* MCQ Option Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(currentPart.options || []).map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const isCorrect = opt.id === currentPart.correctOptionId;

              let optionStyle = "bg-white text-slate-800 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300";
              if (isMcqAnswered) {
                if (isCorrect) {
                  optionStyle = "bg-emerald-500 text-white border-emerald-400 shadow-[0_6px_12px_rgba(16,185,129,0.35)] scale-[1.02]";
                } else if (isSelected) {
                  optionStyle = "bg-rose-500 text-white border-rose-400 shadow-[0_6px_12px_rgba(244,63,94,0.35)]";
                } else {
                  optionStyle = "bg-white text-slate-400 border-slate-200 opacity-50";
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectMcqOption(opt.id)}
                  disabled={isMcqAnswered}
                  className={`p-4 rounded-2xl border-2 font-extrabold text-base transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-slate-100/40 border border-current flex items-center justify-center text-sm font-black">
                      {opt.id}
                    </span>
                    <span>{opt.text}</span>
                  </span>
                  {isMcqAnswered && isCorrect && <CheckIcon />}
                </button>
              );
            })}
          </div>

          {/* Answer Feedback & Explanation Box */}
          {isMcqAnswered && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col gap-1.5 animate-fadeIn shadow-sm">
              <div className="flex items-center gap-2 font-extrabold text-sm">
                {selectedOptionId === currentPart.correctOptionId ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckIcon />
                    <span>Correct Answer!</span>
                  </span>
                ) : (
                  <span className="text-rose-600">Not Quite — Here's Why:</span>
                )}
              </div>
              <p className="text-xs md:text-sm font-semibold text-slate-600 leading-relaxed">
                {currentPart.explanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. XP RECAP BADGE UNLOCK POP-IN */}
      {isLastPart && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-100 via-amber-50 to-yellow-100 border-2 border-amber-300/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-sm">
              <TrophyIcon className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-amber-700 tracking-wider">Badge Unlocked!</span>
              <h3 className="text-xl font-black text-amber-950">{currentPart.badge || 'Level Master Unlocked!'}</h3>
            </div>
          </div>
          <span className="bg-amber-400 text-amber-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1">
            <StarIcon className="w-4 h-4 text-amber-950 fill-current" />
            <span>+100 XP</span>
          </span>
        </div>
      )}

      {/* 6. BOTTOM CONTROLS & ADVANCEMENT BUTTON */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500">
          {isMcqPart && !isMcqAnswered
            ? 'Please select an answer to continue.'
            : isLastPart
            ? 'Micro-lesson complete! Ready for your evaluation quiz?'
            : 'Click continue to progress through the script.'}
        </p>

        {isLastPart ? (
          <button onClick={handleFinishScript} className="clay-btn-green">
            Proceed to Practice Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={isMcqPart && !isMcqAnswered}
            className={`clay-btn-blue ${
              isMcqPart && !isMcqAnswered ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
};
