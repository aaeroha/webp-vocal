import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AudioLines,
  Check,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Maximize2,
  Music,
  Piano,
  Play,
  RotateCcw,
  RotateCw,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { VOICE_TYPES } from '../data/content';
import { useReveal } from '../hooks/useReveal';
import {
  playInstrumentSample,
  preloadInstrument,
  type InstrumentType,
} from '../utils/instrumentSampler';

interface PianoKey {
  note: string;
  labelRu: string;
  sciLabel: string;
  freq: number;
  isBlack: boolean;
}

const INSTRUMENTS: { id: InstrumentType; label: string; shortLabel: string }[] = [
  { id: 'piano', label: 'Акустическое пианино', shortLabel: 'Пианино' },
  { id: 'strings', label: 'Струнные', shortLabel: 'Струнные' },
  { id: 'harpsichord', label: 'Клавесин', shortLabel: 'Клавесин' },
  { id: 'organ', label: 'Орган', shortLabel: 'Орган' },
];

function InstrumentIcon({ id }: { id: InstrumentType }) {
  if (id === 'piano') return <Piano className="h-4 w-4" />;
  if (id === 'strings') return <AudioLines className="h-4 w-4" />;
  if (id === 'harpsichord') return <Sparkles className="h-4 w-4" />;
  return <Columns3 className="h-4 w-4" />;
}

const PIANO_KEYS_HIGH: PianoKey[] = [
  { note: 'C4', labelRu: 'До', sciLabel: 'c1', freq: 261.63, isBlack: false },
  { note: 'C#4', labelRu: 'До♯', sciLabel: 'c#1', freq: 277.18, isBlack: true },
  { note: 'D4', labelRu: 'Ре', sciLabel: 'd1', freq: 293.66, isBlack: false },
  { note: 'D#4', labelRu: 'Ми♭', sciLabel: 'eb1', freq: 311.13, isBlack: true },
  { note: 'E4', labelRu: 'Ми', sciLabel: 'e1', freq: 329.63, isBlack: false },
  { note: 'F4', labelRu: 'Фа', sciLabel: 'f1', freq: 349.23, isBlack: false },
  { note: 'F#4', labelRu: 'Фа♯', sciLabel: 'f#1', freq: 369.99, isBlack: true },
  { note: 'G4', labelRu: 'Соль', sciLabel: 'g1', freq: 392.0, isBlack: false },
  { note: 'G#4', labelRu: 'Соль♯', sciLabel: 'g#1', freq: 415.3, isBlack: true },
  { note: 'A4', labelRu: 'Ля', sciLabel: 'a1', freq: 440.0, isBlack: false },
  { note: 'A#4', labelRu: 'Си♭', sciLabel: 'bb1', freq: 466.16, isBlack: true },
  { note: 'B4', labelRu: 'Си', sciLabel: 'h1', freq: 493.88, isBlack: false },
  { note: 'C5', labelRu: 'До', sciLabel: 'c2', freq: 523.25, isBlack: false },
];

const PIANO_KEYS_LOW: PianoKey[] = [
  { note: 'F2', labelRu: 'Фа', sciLabel: 'F', freq: 87.31, isBlack: false },
  { note: 'F#2', labelRu: 'Фа♯', sciLabel: 'F#', freq: 92.5, isBlack: true },
  { note: 'G2', labelRu: 'Соль', sciLabel: 'G', freq: 98.0, isBlack: false },
  { note: 'G#2', labelRu: 'Соль♯', sciLabel: 'G#', freq: 103.83, isBlack: true },
  { note: 'A2', labelRu: 'Ля', sciLabel: 'A', freq: 110.0, isBlack: false },
  { note: 'A#2', labelRu: 'Си♭', sciLabel: 'B', freq: 116.54, isBlack: true },
  { note: 'B2', labelRu: 'Си', sciLabel: 'H', freq: 123.47, isBlack: false },
  { note: 'C3', labelRu: 'До', sciLabel: 'c', freq: 130.81, isBlack: false },
  { note: 'C#3', labelRu: 'До♯', sciLabel: 'c#', freq: 138.59, isBlack: true },
  { note: 'D3', labelRu: 'Ре', sciLabel: 'd', freq: 146.83, isBlack: false },
  { note: 'D#3', labelRu: 'Ми♭', sciLabel: 'eb', freq: 155.56, isBlack: true },
  { note: 'E3', labelRu: 'Ми', sciLabel: 'e', freq: 164.81, isBlack: false },
  { note: 'F3', labelRu: 'Фа', sciLabel: 'f', freq: 174.61, isBlack: false },
  { note: 'G3', labelRu: 'Соль', sciLabel: 'g', freq: 196.0, isBlack: false },
  { note: 'A3', labelRu: 'Ля', sciLabel: 'a', freq: 220.0, isBlack: false },
];

// 10 existing 5-note sequences + 5 new 7-note sequences (High Register c1-c2)
const WARMUP_PATTERNS_HIGH: string[][] = [
  // 5-note classics
  ['C4', 'E4', 'G4', 'E4', 'C4'],
  ['C4', 'D4', 'E4', 'F4', 'G4'],
  ['G4', 'F4', 'E4', 'D4', 'C4'],
  ['C4', 'F4', 'A4', 'F4', 'C4'],
  ['D4', 'F#4', 'A4', 'F#4', 'D4'],
  ['E4', 'G#4', 'B4', 'G#4', 'E4'],
  ['C4', 'E4', 'C4', 'G4', 'C4'],
  ['F4', 'A4', 'C5', 'A4', 'F4'],
  ['A4', 'G4', 'E4', 'D4', 'C4'],
  ['C4', 'D4', 'F4', 'G4', 'A4'],
  // 5 new 7-note vocal warmups
  ['C4', 'D4', 'E4', 'F4', 'G4', 'F4', 'E4'],
  ['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'C4'],
  ['D4', 'E4', 'F#4', 'A4', 'F#4', 'E4', 'D4'],
  ['G4', 'A4', 'B4', 'C5', 'B4', 'A4', 'G4'],
  ['C4', 'E4', 'F4', 'G4', 'A4', 'G4', 'C4'],
];

// 10 existing 5-note sequences + 5 new 7-note sequences (Low Register F-a)
const WARMUP_PATTERNS_LOW: string[][] = [
  // 5-note classics
  ['F2', 'A2', 'C3', 'A2', 'F2'],
  ['A2', 'B2', 'C3', 'D3', 'E3'],
  ['E3', 'D3', 'C3', 'B2', 'A2'],
  ['G2', 'B2', 'D3', 'B2', 'G2'],
  ['C3', 'E3', 'G3', 'E3', 'C3'],
  ['F2', 'G2', 'A2', 'C3', 'D3'],
  ['A2', 'C#3', 'E3', 'C#3', 'A2'],
  ['D3', 'F3', 'A3', 'F3', 'D3'],
  ['G2', 'C3', 'E3', 'C3', 'G2'],
  ['A2', 'C3', 'D3', 'E3', 'A3'],
  // 5 new 7-note vocal warmups
  ['F2', 'G2', 'A2', 'C3', 'D3', 'C3', 'A2'],
  ['A2', 'C#3', 'E3', 'A3', 'E3', 'C#3', 'A2'],
  ['C3', 'D3', 'E3', 'F3', 'G3', 'F3', 'C3'],
  ['G2', 'A2', 'B2', 'D3', 'B2', 'A2', 'G2'],
  ['A2', 'B2', 'C3', 'E3', 'G3', 'E3', 'A2'],
];

type ChallengePhase = 'idle' | 'demo' | 'practice' | 'completed';

export function VocalPiano() {
  const { ref, isVisible } = useReveal({ threshold: 0.08 });
  const [registerMode, setRegisterMode] = useState<'high' | 'low'>('high');
  const [instrument, setInstrument] = useState<InstrumentType>('piano');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('mezzo');
  const [activeNote, setActiveNote] = useState<string | null>(null);

  const [phase, setPhase] = useState<ChallengePhase>('idle');
  const [patternIdx, setPatternIdx] = useState<number>(0);
  const [demoStepIdx, setDemoStepIdx] = useState<number>(-1);
  const [userStepIdx, setUserStepIdx] = useState<number>(0);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const warmupTimersRef = useRef<number[]>([]);
  const activeTimeoutRef = useRef<number>(0);

  useEffect(() => {
    if (!isModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isModalOpen]);

  const keys = registerMode === 'high' ? PIANO_KEYS_HIGH : PIANO_KEYS_LOW;
  const whiteKeys = keys.filter((k) => !k.isBlack);
  const patterns = registerMode === 'high' ? WARMUP_PATTERNS_HIGH : WARMUP_PATTERNS_LOW;
  const activeSequenceNotes = patterns[patternIdx % patterns.length];
  const selectedProfile = VOICE_TYPES.find((v) => v.id === selectedProfileId) ?? VOICE_TYPES[1];

  const keyLookup = useCallback(
    (noteCode: string) => keys.find((k) => k.note === noteCode),
    [keys]
  );

  const tickerItems = patterns.map((seq) =>
    seq
      .map((n) => {
        const k = keyLookup(n);
        return k ? `${k.labelRu}-${k.sciLabel}` : n;
      })
      .join(' · ')
  );

  useEffect(() => {
    if (!isVisible) return;
    preloadInstrument(instrument).catch(() => {});
  }, [isVisible, instrument]);

  const clearTimers = useCallback(() => {
    warmupTimersRef.current.forEach((id) => window.clearTimeout(id));
    warmupTimersRef.current = [];
  }, []);

  const resetWarmup = useCallback(() => {
    clearTimers();
    setPhase('idle');
    setDemoStepIdx(-1);
    setUserStepIdx(0);
    setWrongFlash(false);
  }, [clearTimers]);

  const triggerKeyVisual = useCallback((noteCode: string, highlightMs = 680) => {
    if (activeTimeoutRef.current) {
      window.clearTimeout(activeTimeoutRef.current);
    }
    setActiveNote(noteCode);
    activeTimeoutRef.current = window.setTimeout(() => {
      setActiveNote((prev) => (prev === noteCode ? null : prev));
    }, highlightMs);
  }, []);

  const handleUserPressKey = useCallback(
    (key: PianoKey) => {
      playInstrumentSample(key.freq, instrument, 1.5, 0.8).catch(() => {});
      triggerKeyVisual(key.note, 450);

      if (phase === 'practice') {
        const expectedNote = activeSequenceNotes[userStepIdx];
        if (key.note === expectedNote) {
          const nextStep = userStepIdx + 1;
          setUserStepIdx(nextStep);
          setWrongFlash(false);
          if (nextStep >= activeSequenceNotes.length) {
            setPhase('completed');
          }
        } else {
          setWrongFlash(true);
          window.setTimeout(() => setWrongFlash(false), 380);
        }
      }
    },
    [instrument, phase, activeSequenceNotes, userStepIdx, triggerKeyVisual]
  );

  const startDemoSequence = useCallback(
    async (seqIndex: number) => {
      await preloadInstrument(instrument).catch(() => {});
      clearTimers();

      const seq = patterns[seqIndex % patterns.length];
      setPatternIdx(seqIndex % patterns.length);
      setPhase('demo');
      setDemoStepIdx(-1);
      setUserStepIdx(0);
      setWrongFlash(false);

      const noteStepMs = 870;
      seq.forEach((noteCode, idx) => {
        const targetKey = keys.find((k) => k.note === noteCode);
        if (!targetKey) return;
        const timer = window.setTimeout(() => {
          setDemoStepIdx(idx);
          playInstrumentSample(targetKey.freq, instrument, 1.35, 0.82).catch(() => {});
          triggerKeyVisual(targetKey.note, 760);

          if (idx === seq.length - 1) {
            const switchTimer = window.setTimeout(() => {
              setDemoStepIdx(-1);
              setPhase('practice');
            }, 920);
            warmupTimersRef.current.push(switchTimer);
          }
        }, 260 + idx * noteStepMs);
        warmupTimersRef.current.push(timer);
      });
    },
    [clearTimers, instrument, keys, patterns, triggerKeyVisual]
  );

  const playWarmupChallenge = () => {
    const nextIdx =
      (patternIdx + 1 + Math.floor(Math.random() * (patterns.length - 1))) % patterns.length;
    startDemoSequence(nextIdx);
  };

  const replayCurrentWarmup = () => {
    startDemoSequence(patternIdx);
  };

  useEffect(() => {
    return () => {
      clearTimers();
      if (activeTimeoutRef.current) window.clearTimeout(activeTimeoutRef.current);
    };
  }, [clearTimers]);

  const handleSelectVoiceProfile = (id: string, gender: 'female' | 'male') => {
    setSelectedProfileId(id);
    const nextReg = gender === 'male' ? 'low' : 'high';
    if (nextReg !== registerMode) {
      setRegisterMode(nextReg);
      resetWarmup();
    }
  };

  const handleSwitchRegister = (mode: 'high' | 'low') => {
    if (mode !== registerMode) {
      setRegisterMode(mode);
      resetWarmup();
    }
  };

  const selectedProfileIdx = Math.max(
    0,
    VOICE_TYPES.findIndex((v) => v.id === selectedProfileId)
  );
  const activeInstrumentMeta = INSTRUMENTS.find((i) => i.id === instrument) ?? INSTRUMENTS[0];

  const handleProfileIndexChange = (idx: number) => {
    const clamped = Math.max(0, Math.min(VOICE_TYPES.length - 1, idx));
    const target = VOICE_TYPES[clamped];
    if (target) {
      handleSelectVoiceProfile(target.id, target.gender);
    }
  };

  const renderPianoConsole = (inModal: boolean) => (
    <div className={inModal ? 'flex min-h-0 flex-1 flex-col gap-2' : 'space-y-4'}>
      {/* Ultra-Compact Unified Toolbar: Voice Slider + Register Toggle + Icon-Based Instruments + Playback */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-900/8 bg-[#FAF8F5]/85 dark:border-white/8 dark:bg-[#0D0C10]/75 ${
          inModal ? 'mt-1.5 p-2 sm:p-2.5' : 'mt-5 p-3 sm:p-4'
        }`}
      >
        {/* Voice Profile & Register Slider Control */}
        <div className="flex flex-1 min-w-[230px] flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-zinc-900/12 bg-[#F2EDE6] px-2 py-1 dark:border-white/12 dark:bg-[#16151C]">
            <button
              type="button"
              onClick={() => handleProfileIndexChange(selectedProfileIdx - 1)}
              disabled={selectedProfileIdx <= 0}
              aria-label="Предыдущий тип голоса"
              className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-600 hover:bg-black/5 disabled:opacity-35 dark:text-zinc-300 dark:hover:bg-white/10 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <input
              type="range"
              min={0}
              max={VOICE_TYPES.length - 1}
              step={1}
              value={selectedProfileIdx}
              onChange={(e) => handleProfileIndexChange(Number(e.target.value))}
              aria-label="Выбор типа голоса"
              className="w-20 sm:w-28 accent-[#B45309] dark:accent-[#E2A856] cursor-pointer"
            />

            <button
              type="button"
              onClick={() => handleProfileIndexChange(selectedProfileIdx + 1)}
              disabled={selectedProfileIdx >= VOICE_TYPES.length - 1}
              aria-label="Следующий тип голоса"
              className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-600 hover:bg-black/5 disabled:opacity-35 dark:text-zinc-300 dark:hover:bg-white/10 cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-200">
            <Volume2 className="h-3.5 w-3.5 shrink-0 text-[#B45309] dark:text-[#E2A856]" />
            <span className="font-bold text-zinc-900 dark:text-[#F5F3EF] whitespace-nowrap">
              {selectedProfile.name}
            </span>
            <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
              ({selectedProfile.rangeLabel.split(' ')[0]})
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleSwitchRegister(registerMode === 'high' ? 'low' : 'high')}
            title="Переключить октаву клавиатуры"
            className="rounded-full border border-[#B45309]/30 bg-[#B45309]/10 px-2.5 py-1 text-[11px] font-bold text-[#B45309] transition-colors hover:bg-[#B45309]/20 dark:border-[#E2A856]/35 dark:bg-[#E2A856]/15 dark:text-[#E2A856] cursor-pointer"
          >
            {registerMode === 'high' ? 'c1–c2' : 'F–a'}
          </button>
        </div>

        {/* Instrument Icons + Warmup Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Compact Icon-Only Instrument Selector with active tooltip/title */}
          <div
            className="inline-flex items-center gap-1 rounded-full border border-zinc-900/10 bg-[#F2EDE6] p-1 dark:border-white/10 dark:bg-[#16151C]"
            role="group"
            aria-label="Выбор тембра инструмента"
          >
            {INSTRUMENTS.map((inst) => {
              const active = instrument === inst.id;
              return (
                <button
                  key={inst.id}
                  type="button"
                  title={inst.label}
                  aria-label={inst.label}
                  onClick={() => setInstrument(inst.id)}
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all cursor-pointer ${
                    active
                      ? 'bg-[#B45309] text-white shadow-xs dark:bg-[#E2A856] dark:text-[#0D0C10]'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
                >
                  <InstrumentIcon id={inst.id} />
                </button>
              );
            })}
            <span className="hidden lg:inline px-2 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              {activeInstrumentMeta.shortLabel}
            </span>
          </div>

          {phase !== 'idle' && (
            <button
              type="button"
              onClick={replayCurrentWarmup}
              disabled={phase === 'demo'}
              title="Повторить распевку"
              aria-label="Повторить распевку"
              className="inline-flex h-8 items-center gap-1 rounded-full border border-[#B45309]/40 bg-[#FAF8F5] px-2.5 sm:px-3.5 text-xs font-semibold text-[#B45309] transition-all hover:bg-[#B45309]/10 disabled:opacity-60 dark:border-[#E2A856]/40 dark:bg-[#16151C] dark:text-[#E2A856] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Повторить</span>
            </button>
          )}

          <button
            type="button"
            onClick={playWarmupChallenge}
            disabled={phase === 'demo'}
            className="btn-sheen inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-full bg-[#B45309] px-3.5 sm:px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#9A4407] disabled:opacity-70 dark:bg-[#E2A856] dark:text-[#0D0C10] dark:hover:bg-[#F3C884] cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>
              {phase === 'demo'
                ? 'Слушаем...'
                : phase === 'idle'
                  ? 'Распевка'
                  : 'Другая'}
            </span>
          </button>

          {!inModal && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              title="Открыть пианино на весь экран"
              aria-label="Открыть пианино на весь экран"
              className="inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-full border border-zinc-900/15 bg-[#FAF8F5] px-3 text-xs font-semibold text-zinc-700 transition-colors hover:border-[#B45309]/50 hover:text-[#B45309] dark:border-white/15 dark:bg-[#16151C] dark:text-zinc-200 dark:hover:border-[#E2A856]/50 dark:hover:text-[#E2A856] cursor-pointer"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">На весь экран</span>
            </button>
          )}
        </div>
      </div>

      {/* Compact Interactive Scoreboard / Marquee Ticker */}
      <div
        className={`rounded-2xl border border-[#B45309]/25 bg-[#FAF8F5]/95 dark:border-[#E2A856]/25 dark:bg-[#0D0C10]/90 ${
          inModal ? 'px-2.5 py-1.5 sm:p-2.5' : 'p-3.5 sm:p-4'
        }`}
      >
        {phase === 'idle' ? (
          <div className="overflow-hidden">
            <div className="relative overflow-hidden whitespace-nowrap py-0.5">
              <div className="animate-piano-ticker gap-8 text-xs font-medium text-zinc-700 dark:text-zinc-200">
                {[...tickerItems, ...tickerItems].map((line, i) => (
                  <span key={i} className="inline-flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#B45309] dark:bg-[#E2A856]" />
                    <span>{line}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#B45309] dark:text-[#E2A856]">
                {phase === 'demo' && 'Слушайте ноты...'}
                {phase === 'practice' && `Нажмите ${activeSequenceNotes.length} нот по порядку`}
                {phase === 'completed' && (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    Браво! Все {activeSequenceNotes.length} нот точно!
                  </span>
                )}
              </span>

              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                {phase === 'completed'
                  ? `${activeSequenceNotes.length}/${activeSequenceNotes.length}`
                  : phase === 'practice'
                    ? `${userStepIdx}/${activeSequenceNotes.length}`
                    : 'Показ'}
              </span>
            </div>

            <div
              className="grid gap-1 sm:gap-2"
              style={{
                gridTemplateColumns: `repeat(${activeSequenceNotes.length}, minmax(0, 1fr))`,
              }}
            >
              {activeSequenceNotes.map((noteCode, idx) => {
                const k = keyLookup(noteCode);
                const isMatched =
                  phase === 'completed' || (phase === 'practice' && idx < userStepIdx);
                const isDemoActive = phase === 'demo' && idx === demoStepIdx;
                const isCurrentTarget = phase === 'practice' && idx === userStepIdx;

                return (
                  <div
                    key={`${noteCode}-${idx}`}
                    className={`flex flex-col items-center justify-center rounded-xl border px-1 py-1 sm:px-2 sm:py-1.5 text-center transition-all duration-200 ${
                      isMatched
                        ? 'border-emerald-500 bg-emerald-500/18 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : isDemoActive
                          ? 'scale-105 border-amber-500 bg-amber-400/25 text-[#9A4407] dark:border-[#FACC15] dark:bg-amber-400/25 dark:text-[#FDE047]'
                          : isCurrentTarget
                            ? `border-[#B45309] bg-[#B45309]/10 text-[#B45309] ring-2 ring-[#B45309]/35 dark:border-[#E2A856] dark:bg-[#E2A856]/15 dark:text-[#E2A856] ${
                                wrongFlash ? 'animate-pulse border-rose-500 text-rose-500' : ''
                              }`
                            : 'border-zinc-900/10 bg-[#F2EDE6]/80 text-zinc-500 dark:border-white/10 dark:bg-[#16151C] dark:text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-0.5">
                      {isMatched && <Check className="h-3 w-3 shrink-0" />}
                      <span className="text-[11px] sm:text-sm font-bold leading-none">
                        {k?.labelRu ?? noteCode}
                      </span>
                    </div>
                    <span className="text-[9px] sm:text-[11px] font-medium opacity-80">
                      {k?.sciLabel ?? ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Full-Width Playable Piano Keyboard (auto-fits landscape viewport height cleanly) */}
      <div className={`relative ${inModal ? 'flex-1 min-h-[150px]' : ''} overflow-x-auto pb-1 custom-scrollbar`}>
        <div
          className={`relative flex w-full select-none rounded-2xl border border-zinc-900/20 bg-zinc-950 p-1.5 sm:p-2.5 shadow-2xl dark:border-white/15 dark:bg-black/90 ${
            inModal
              ? 'h-full min-h-[155px] min-w-[460px] sm:min-w-0 landscape:min-w-0'
              : 'h-56 sm:h-68 min-w-[560px]'
          }`}
        >
          {whiteKeys.map((wKey) => {
            const isPressed = activeNote === wKey.note;
            const isHighlighted = selectedProfile.pianoNotes.includes(wKey.note);

            const wIdx = keys.findIndex((k) => k.note === wKey.note);
            const nextKey = keys[wIdx + 1];
            const hasBlackAfter = nextKey && nextKey.isBlack;

            return (
              <div key={wKey.note} className="relative flex-1">
                <button
                  type="button"
                  onPointerDown={() => handleUserPressKey(wKey)}
                  aria-label={`Нота ${wKey.labelRu} (${wKey.sciLabel})`}
                  className={`group relative flex h-full w-[calc(100%-3px)] flex-col items-center justify-end rounded-b-xl border-b-[5px] pb-2 sm:pb-3 transition-all duration-100 cursor-pointer ${
                    isPressed
                      ? 'translate-y-0.5 scale-[0.985] border-amber-600 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 text-zinc-950 shadow-[0_0_26px_rgba(245,158,11,0.9)] ring-2 ring-amber-400 z-10'
                      : isHighlighted
                        ? 'border-amber-300 bg-[#FFFDF6] text-zinc-900 hover:bg-amber-50'
                        : 'border-zinc-300 bg-[#FAF8F5] text-zinc-800 hover:bg-white'
                  }`}
                >
                  {isHighlighted && !isPressed && (
                    <span className="mb-1 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#B45309]" />
                  )}
                  <span className="text-[11px] sm:text-base font-extrabold leading-none tracking-tight">
                    {wKey.labelRu}
                  </span>
                  <span className="mt-0.5 text-[9px] sm:text-xs font-semibold text-zinc-500">
                    {wKey.sciLabel}
                  </span>
                </button>

                {hasBlackAfter && (
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      handleUserPressKey(nextKey);
                    }}
                    aria-label={`Нота ${nextKey.labelRu} (${nextKey.sciLabel})`}
                    className={`absolute -right-[32%] top-0 z-20 flex h-[58%] w-[62%] flex-col items-center justify-end rounded-b-lg border-b-[4px] pb-1.5 sm:pb-2 transition-all duration-100 cursor-pointer ${
                      activeNote === nextKey.note
                        ? 'translate-y-0.5 scale-[0.97] border-amber-500 bg-gradient-to-b from-amber-300 to-amber-500 text-zinc-950 shadow-[0_0_22px_rgba(250,204,21,0.95)] ring-2 ring-amber-300'
                        : 'border-black bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-[9px] sm:text-xs font-bold leading-none">
                      {nextKey.labelRu}
                    </span>
                    <span className="mt-0.5 text-[8px] sm:text-[10px] opacity-75">
                      {nextKey.sciLabel}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const pianoModal =
    isModalOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Вокальное пианино — полноэкранный режим"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/88 p-2 backdrop-blur-md sm:p-4"
          >
            <div className="animate-modal-enter relative flex h-[96dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-zinc-900/15 bg-[#FAF8F5] p-3 shadow-2xl dark:border-white/15 dark:bg-[#16151C] sm:h-auto sm:max-h-[94dvh] sm:rounded-3xl sm:p-5">
              <div className="flex shrink-0 items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#B45309]/15 text-[#B45309] dark:bg-[#E2A856]/20 dark:text-[#E2A856]">
                    <Music className="h-4 w-4" />
                  </span>
                  <h3 className="font-serif text-base font-semibold text-zinc-900 dark:text-[#F5F3EF] sm:text-xl">
                    Вокальное пианино • {activeInstrumentMeta.shortLabel}
                  </h3>
                </div>

                {/* Portrait mobile hint inline on small portrait screens */}
                <div className="hidden max-sm:portrait:flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold text-[#9A4407] dark:text-[#FDE047]">
                  <RotateCw className="h-3 w-3 shrink-0" />
                  <span>Поверните экран</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Закрыть пианино"
                  className="inline-flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-zinc-900/10 bg-[#F2EDE6] text-zinc-800 transition-colors hover:text-[#B45309] dark:border-white/10 dark:bg-[#0D0C10] dark:text-[#F5F3EF] dark:hover:text-[#E2A856] cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {renderPianoConsole(true)}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <section id="vocal-piano" className="relative z-10 py-14 sm:py-20 lg:py-24">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`reveal-scale overflow-hidden rounded-3xl border border-zinc-900/10 bg-[#F2EDE6]/92 p-5 dark:border-white/10 dark:bg-[#16151C]/95 sm:p-8 lg:p-10 ${
            isVisible ? 'is-visible' : ''
          }`}
        >
          {/* Section Header */}
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#B45309] dark:text-[#E2A856]">
              <Music className="h-3.5 w-3.5" />
              Интерактивный тренажёр
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-zinc-900 dark:text-[#F5F3EF] sm:text-4xl">
              Вокальное пианино для распевки и настройки слуха
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
              Двигайте ползунок для выбора голоса, выбирайте тембр значками и нажимайте «Распевка» для настройки слуха.
            </p>
          </div>

          {/* Mobile Compact Launcher Card */}
          <div className="mt-5 md:hidden">
            <div className="rounded-2xl border border-[#B45309]/25 bg-[#FAF8F5]/90 p-4 dark:border-[#E2A856]/25 dark:bg-[#0D0C10]/85">
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                Пианино открывается в отдельном полноэкранном окне — в горизонтальном положении телефона все клавиши и управление помещаются целиком.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="btn-sheen mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#B45309] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#9A4407] dark:bg-[#E2A856] dark:text-[#0D0C10] dark:hover:bg-[#F3C884] cursor-pointer"
              >
                <Maximize2 className="h-4 w-4" />
                <span>Открыть вокальное пианино</span>
              </button>
            </div>
          </div>

          {/* Desktop / Tablet Embedded Piano */}
          <div className="hidden md:block">{renderPianoConsole(false)}</div>
        </div>
      </div>

      {pianoModal}
    </section>
  );
}
