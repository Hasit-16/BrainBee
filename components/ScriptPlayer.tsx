'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScriptData, ScriptPart, fallbackBeginnerScript } from '@/lib/scriptLoader';
import { playSound } from '@/lib/sound';

interface ScriptPlayerProps {
  subjectId: string;
  chapterId: string;
  level: string;
  onComplete?: () => void;
}

const AVATAR_MAP: Record<string, { emoji: string; title: string; colorBg: string }> = {
  doraemon: { emoji: '🤖', title: 'Doraemon (Fraction Explorer)', colorBg: 'bg-blue-500/15 text-blue-600 border-blue-200' },
  baker: { emoji: '👨‍🍳', title: 'Chef Baker (Ratio Master)', colorBg: 'bg-amber-500/15 text-amber-600 border-amber-200' },
  astronaut: { emoji: '👨‍🚀', title: 'Commander Astro', colorBg: 'bg-purple-500/15 text-purple-600 border-purple-200' },
  scientist: { emoji: '🔬', title: 'Dr. Atom', colorBg: 'bg-emerald-500/15 text-emerald-600 border-emerald-200' },
  leo: { emoji: '🧒', title: 'Leo (Student)', colorBg: 'bg-indigo-500/15 text-indigo-600 border-indigo-200' },
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
        // Dynamically import script JSON file
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
        <div className="animate-spin text-4xl mb-3">⏳</div>
        <p className="text-sm font-bold text-slate-600">Loading Interactive Script Player...</p>
      </div>
    );
  }

  const parts = script.parts;
  const currentPart: ScriptPart = parts[currentPartIndex] || parts[0];
  const isMcqPart = currentPart.type === 'mcq' || currentPart.id === 'diagnostic_pause';
  const isLastPart = currentPartIndex === parts.length - 1;

  // Handle Beat Revelation or Advancement
  const handleNext = () => {
    playSound('click');

    if (!isMcqPart) {
      const beats = currentPart.beats || [];
      if (currentBeatIndex < beats.length - 1) {
        setCurrentBeatIndex((prev) => prev + 1);
      } else if (currentPartIndex < parts.length - 1) {
        const nextIdx = currentPartIndex + 1;
        setCurrentPartIndex(nextIdx);
        setCurrentBeatIndex(0);

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

  const guideAvatar = AVATAR_MAP[script.domainGuide.avatarKey] || AVATAR_MAP.doraemon;
  const studentAvatar = AVATAR_MAP[script.student.avatarKey] || AVATAR_MAP.leo;

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-[10px_20px_30px_rgba(0,0,0,0.05)] border border-white/60 relative overflow-hidden before:absolute before:inset-0 before:shadow-[inset_2px_4px_8px_rgba(255,255,255,0.8)] before:pointer-events-none rounded-[2rem] p-6 md:p-8 flex flex-col gap-6 font-sans text-slate-800">
      {/* 1. TOP SEGMENTED PROGRESS BAR */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
          <span>PART {currentPartIndex + 1} OF 5: <span className="text-blue-600 uppercase">{currentPart.label}</span></span>
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">{script.level.toUpperCase()} LEVEL</span>
        </div>

        <div className="grid grid-cols-5 gap-2 bg-slate-100 p-1.5 rounded-full border border-slate-200/50 shadow-inner">
          {parts.map((p, idx) => (
            <div
              key={p.id}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx < currentPartIndex
                  ? 'bg-blue-500 shadow-sm'
                  : idx === currentPartIndex
                  ? 'bg-gradient-to-r from-blue-400 to-indigo-500 shadow-md animate-pulse'
                  : 'bg-slate-200/80'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. SCENE DIRECTION BANNER (IF PRESENT) */}
      {currentPart.sceneDirection && (
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex items-center gap-3 text-xs font-semibold text-amber-900 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.04)]">
          <span className="text-lg">🎬</span>
          <span><strong className="font-extrabold text-amber-950">Scene:</strong> {currentPart.sceneDirection}</span>
        </div>
      )}

      {/* 3. MAIN SCRIPT PLAYBACK AREA */}
      {!isMcqPart ? (
        <div className="flex flex-col gap-4 my-2 min-h-[220px]">
          {(currentPart.beats || []).slice(0, currentBeatIndex + 1).map((beat, idx) => {
            const isStudent = beat.speaker === 'leo';
            const avatar = isStudent ? studentAvatar : guideAvatar;
            const isLatest = idx === currentBeatIndex;

            return (
              <div
                key={idx}
                className={`flex gap-3.5 items-start ${
                  isStudent ? 'flex-row-reverse' : 'flex-row'
                } ${isLatest ? 'animate-fadeIn' : 'opacity-85'}`}
              >
                {/* Speaker Avatar Icon */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-[inset_2px_4px_6px_rgba(0,0,0,0.06)] border ${avatar.colorBg}`}>
                  {avatar.emoji}
                </div>

                {/* Speech Bubble */}
                <div
                  className={`max-w-xl p-4 rounded-2xl flex flex-col gap-1 shadow-md border ${
                    isStudent
                      ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200/70 text-indigo-950 rounded-tr-none'
                      : 'bg-white border-slate-200/80 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider opacity-70">
                    <span>{isStudent ? script.student.name : script.domainGuide.name}</span>
                    {beat.stageDirection && (
                      <span className="italic text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        {beat.stageDirection}
                      </span>
                    )}
                  </div>
                  <p className="text-base font-semibold leading-relaxed">
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
              ⚡ Diagnostic Checkpoint
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
                  {isMcqAnswered && isCorrect && <span className="text-xl">✓</span>}
                  {isMcqAnswered && isSelected && !isCorrect && <span className="text-xl">✗</span>}
                </button>
              );
            })}
          </div>

          {/* Answer Feedback & Explanation Box */}
          {isMcqAnswered && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col gap-1.5 animate-fadeIn shadow-sm">
              <div className="flex items-center gap-2 font-extrabold text-sm">
                {selectedOptionId === currentPart.correctOptionId ? (
                  <span className="text-emerald-600">🎉 Correct Answer!</span>
                ) : (
                  <span className="text-rose-600">💡 Not Quite — Here's Why:</span>
                )}
              </div>
              <p className="text-xs md:text-sm font-semibold text-slate-600 leading-relaxed">
                {currentPart.explanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. XP RECAP BADGE UNLOCK POP-IN (IF ON LAST PART) */}
      {isLastPart && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-100 via-amber-50 to-yellow-100 border-2 border-amber-300/80 flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🏆</span>
            <div>
              <span className="text-xs font-black uppercase text-amber-700 tracking-wider">Badge Unlocked!</span>
              <h3 className="text-xl font-black text-amber-950">{currentPart.badge || 'Level Master Unlocked!'}</h3>
            </div>
          </div>
          <span className="bg-amber-400 text-amber-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-sm">
            +100 XP
          </span>
        </div>
      )}

      {/* 6. BOTTOM CONTROLS & ADVANCEMENT BUTTON */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500">
          {isMcqPart && !isMcqAnswered
            ? '⚠️ Please select an answer to continue.'
            : isLastPart
            ? '🎯 Micro-lesson complete! Ready for your evaluation quiz?'
            : 'Click continue to progress through the script.'}
        </p>

        {isLastPart ? (
          <button onClick={handleFinishScript} className="clay-btn-green">
            Proceed to Practice Quiz 🎯
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={isMcqPart && !isMcqAnswered}
            className={`clay-btn-blue ${
              isMcqPart && !isMcqAnswered ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            Continue ➔
          </button>
        )}
      </div>
    </div>
  );
};
