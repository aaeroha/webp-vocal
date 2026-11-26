import { useCallback, useEffect, useRef, useState } from 'react';
import { Music, Play, Volume2 } from 'lucide-react';
import { VOICE_TYPES } from '../data/content';
import { useReveal } from '../hooks/useReveal';

interface PianoKey {
  note: string;
  labelRu: string;
  sciLabel: string;
  freq: number;
  isBlack: boolean;
  kbd?: string;
}

const PIANO_KEYS_HIGH: PianoKey[] = [
  { note: 'C4', labelRu: 'До', sciLabel: 'c1', freq: 261.63, isBlack: false, kbd: 'A' },
  { note: 'C#4', labelRu: 'До♯', sciLabel: 'c#1', freq: 277.18, isBlack: true, kbd: 'W' },
  { note: 'D4', labelRu: 'Ре', sciLabel: 'd1', freq: 293.66, isBlack: false, kbd: 'S' },
  { note: 'D#4', labelRu: 'Ми♭', sciLabel: 'eb1', freq: 311.13, isBlack: true, kbd: 'E' },
  { note: 'E4', labelRu: 'Ми', sciLabel: 'e1', freq: 329.63, isBlack: false, kbd: 'D' },
  { note: 'F4', labelRu: 'Фа', sciLabel: 'f1', freq: 349.23, isBlack: false, kbd: 'F' },
  { note: 'F#4', labelRu: 'Фа♯', sciLabel: 'f#1', freq: 369.99, isBlack: true, kbd: 'T' },
  { note: 'G4', labelRu: 'Соль', sciLabel: 'g1', freq: 392.0, isBlack: false, kbd: 'G' },
  { note: 'G#4', labelRu: 'Соль♯', sciLabel: 'g#1', freq: 415.3, isBlack: true, kbd: 'Y' },
  { note: 'A4', labelRu: 'Ля', sciLabel: 'a1', freq: 440.0, isBlack: false, kbd: 'H' },
  { note: 'A#4', labelRu: 'Си♭', sciLabel: 'bb1', freq: 466.16, isBlack: true, kbd: 'U' },
  { note: 'B4', labelRu: 'Си', sciLabel: 'h1', freq: 493.88, isBlack: false, kbd: 'J' },
  { note: 'C5', labelRu: 'До', sciLabel: 'c2', freq: 523.25, isBlack: false, kbd: 'K' },
];

const PIANO_KEYS_LOW: PianoKey[] = [
  { note: 'F2', labelRu: 'Фа', sciLabel: 'F', freq: 87.31, isBlack: false },
  { note: 'F#2', labelRu: 'Фа♯', sciLabel: 'F#', freq: 92.5, isBlack: true },
  { note: 'G2', labelRu: 'Соль', sciLabel: 'G', freq: 98.0, isBlack: false },
  { note: 'G#2', labelRu: 'Соль♯', sciLabel: 'G#', freq: 103.83, isBlack: true },
  { note: 'A2', labelRu: 'Ля', sciLabel: 'A', freq: 110.0, isBlack: false, kbd: 'A' },
  { note: 'A#2', labelRu: 'Си♭', sciLabel: 'B', freq: 116.54, isBlack: true, kbd: 'W' },
  { note: 'B2', labelRu: 'Си', sciLabel: 'H', freq: 123.47, isBlack: false, kbd: 'S' },
  { note: 'C3', labelRu: 'До', sciLabel: 'c', freq: 130.81, isBlack: false, kbd: 'D' },
  { note: 'C#3', labelRu: 'До♯', sciLabel: 'c#', freq: 138.59, isBlack: true, kbd: 'R' },
  { note: 'D3', labelRu: 'Ре', sciLabel: 'd', freq: 146.83, isBlack: false, kbd: 'F' },
  { note: 'D#3', labelRu: 'Ми♭', sciLabel: 'eb', freq: 155.56, isBlack: true, kbd: 'T' },
  { note: 'E3', labelRu: 'Ми', sciLabel: 'e', freq: 164.81, isBlack: false, kbd: 'G' },
  { note: 'F3', labelRu: 'Фа', sciLabel: 'f', freq: 174.61, isBlack: false, kbd: 'H' },
  { note: 'G3', labelRu: 'Соль', sciLabel: 'g', freq: 196.0, isBlack: false, kbd: 'J' },
  { note: 'A3', labelRu: 'Ля', sciLabel: 'a', freq: 220.0, isBlack: false, kbd: 'K' },
];

export function VocalPiano() {
  const { ref, isVisible } = useReveal({ threshold: 0.08 });
  const [registerMode, setRegisterMode] = useState<'high' | 'low'>('high');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('mezzo');
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isPlayingWarmup, setIsPlayingWarmup] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const warmupTimersRef = useRef<number[]>([]);

  const keys = registerMode === 'high' ? PIANO_KEYS_HIGH : PIANO_KEYS_LOW;
  const whiteKeys = keys.filter((k) => !k.isBlack);
  const selectedProfile = VOICE_TYPES.find((v) => v.id === selectedProfileId) ?? VOICE_TYPES[1];

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback(
    (key: PianoKey, durationSec = 0.85) => {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Rich warm electric piano synthesis: fundamental + 2nd harmonic
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const harmonicGain = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(key.freq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(key.freq * 2, now);
      harmonicGain.gain.setValueAtTime(0.18, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      osc1.connect(gain);
      osc2.connect(harmonicGain);
      harmonicGain.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + durationSec + 0.05);
      osc2.stop(now + durationSec + 0.05);

      setActiveNote(key.note);
      window.setTimeout(() => {
        setActiveNote((prev) => (prev === key.note ? null : prev));
      }, Math.min(450, durationSec * 650));
    },
    [getAudioContext]
  );

  const playWarmupScale = () => {
    warmupTimersRef.current.forEach((id) => window.clearTimeout(id));
    warmupTimersRef.current = [];
    setIsPlayingWarmup(true);

    // Gentle 5-note warmup ascending & descending pattern (1-2-3-2-1)
    const sequenceIndices = [0, 2, 4, 2, 0];
    sequenceIndices.forEach((wIdx, step) => {
      const targetKey = whiteKeys[wIdx];
      if (!targetKey) return;
      const timer = window.setTimeout(() => {
        playTone(targetKey, 0.55);
        if (step === sequenceIndices.length - 1) {
          window.setTimeout(() => setIsPlayingWarmup(false), 550);
        }
      }, step * 420);
      warmupTimersRef.current.push(timer);
    });
  };

  useEffect(() => {
    return () => {
      warmupTimersRef.current.forEach((id) => window.clearTimeout(id));
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleSelectVoiceProfile = (id: string, gender: 'female' | 'male') => {
    setSelectedProfileId(id);
    setRegisterMode(gender === 'male' ? 'low' : 'high');
  };

  return (
    <section id="vocal-piano" className="relative z-10 py-14 sm:py-20 lg:py-24">
      <div
        ref={ref}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div
          className={`reveal-scale overflow-hidden rounded-3xl border border-zinc-900/10 bg-[#F2EDE6]/92 p-6 dark:border-white/10 dark:bg-[#16151C]/95 sm:p-10 ${
            isVisible ? 'is-visible' : ''
          }`}
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#B45309] dark:text-[#E2A856]">
                <Music className="h-3.5 w-3.5" />
                Интерактивный тренажёр
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-zinc-900 dark:text-[#F5F3EF] sm:text-4xl">
                Вокальное пианино для распевки и настройки слуха
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
                Нажимайте на клавиши, чтобы услышать чистую ноту и пропеть её в унисон. Выберите тип голоса, чтобы посмотреть ориентировочный диапазон.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex rounded-full border border-zinc-900/10 bg-[#FAF8F5] p-1 dark:border-white/10 dark:bg-[#0D0C10]">
                <button
                  type="button"
                  onClick={() => setRegisterMode('high')}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    registerMode === 'high'
                      ? 'bg-[#B45309] text-white dark:bg-[#E2A856] dark:text-[#0D0C10]'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  Первая октава (c1–c2)
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterMode('low')}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    registerMode === 'low'
                      ? 'bg-[#B45309] text-white dark:bg-[#E2A856] dark:text-[#0D0C10]'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  Низкий регистр (F–a)
                </button>
              </div>

              <button
                type="button"
                onClick={playWarmupScale}
                disabled={isPlayingWarmup}
                className="btn-sheen inline-flex items-center gap-2 rounded-full bg-[#B45309] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#9A4407] disabled:opacity-65 dark:bg-[#E2A856] dark:text-[#0D0C10] cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isPlayingWarmup ? 'Звучит распевка...' : 'Сыграть распевку'}</span>
              </button>
            </div>
          </div>

          {/* Voice Types Reference Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {VOICE_TYPES.map((vt) => {
              const active = vt.id === selectedProfileId;
              return (
                <button
                  key={vt.id}
                  type="button"
                  onClick={() => handleSelectVoiceProfile(vt.id, vt.gender)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'border-[#B45309] bg-[#B45309]/12 text-[#B45309] dark:border-[#E2A856] dark:bg-[#E2A856]/15 dark:text-[#E2A856]'
                      : 'border-zinc-900/10 bg-[#FAF8F5]/80 text-zinc-700 hover:border-[#B45309]/35 dark:border-white/10 dark:bg-[#0D0C10]/70 dark:text-zinc-300'
                  }`}
                >
                  {vt.name}
                </button>
              );
            })}
          </div>

          {/* Selected Voice Type Summary Strip */}
          <div className="mt-4 flex flex-col gap-1.5 rounded-2xl border border-zinc-900/8 bg-[#FAF8F5]/85 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between dark:border-white/8 dark:bg-[#0D0C10]/75">
            <div className="flex flex-wrap items-center gap-2">
              <Volume2 className="h-4 w-4 shrink-0 text-[#B45309] dark:text-[#E2A856]" />
              <span className="font-semibold text-zinc-900 dark:text-[#F5F3EF]">
                {selectedProfile.name}:
              </span>
              <span className="text-zinc-600 dark:text-zinc-300">
                {selectedProfile.rangeLabel}
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Подтипы: {selectedProfile.subtypes.join(', ')}
            </span>
          </div>

          {/* Interactive Playable Piano Keyboard */}
          <div className="relative mt-6 overflow-x-auto pb-2">
            <div className="relative mx-auto flex h-44 min-w-[540px] max-w-4xl select-none rounded-2xl border border-zinc-900/15 bg-zinc-900 p-2 shadow-xl dark:border-white/15 dark:bg-black/80 sm:h-52">
              {whiteKeys.map((wKey) => {
                const isPressed = activeNote === wKey.note;
                const isHighlighted = selectedProfile.pianoNotes.includes(wKey.note);

                // Find if there is a sharp/black key right after this white key
                const wIdx = keys.findIndex((k) => k.note === wKey.note);
                const nextKey = keys[wIdx + 1];
                const hasBlackAfter = nextKey && nextKey.isBlack;

                return (
                  <div key={wKey.note} className="relative flex-1">
                    <button
                      type="button"
                      onPointerDown={() => playTone(wKey)}
                      aria-label={`Нота ${wKey.labelRu} (${wKey.sciLabel})`}
                      className={`group relative flex h-full w-[calc(100%-3px)] flex-col items-center justify-end rounded-b-xl border-b-4 pb-3 transition-all duration-75 cursor-pointer ${
                        isPressed
                          ? 'translate-y-0.5 border-amber-600 bg-amber-100 text-amber-950'
                          : isHighlighted
                          ? 'border-amber-300 bg-[#FFFDF7] text-zinc-900 hover:bg-amber-50'
                          : 'border-zinc-300 bg-[#FAF8F5] text-zinc-700 hover:bg-white'
                      }`}
                    >
                      {isHighlighted && (
                        <span className="mb-1.5 h-1.5 w-1.5 rounded-full bg-[#B45309]" />
                      )}
                      <span className="text-xs font-bold leading-none">{wKey.labelRu}</span>
                      <span className="mt-0.5 text-[10px] text-zinc-500">{wKey.sciLabel}</span>
                    </button>

                    {hasBlackAfter && (
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          playTone(nextKey);
                        }}
                        aria-label={`Нота ${nextKey.labelRu} (${nextKey.sciLabel})`}
                        className={`absolute -right-[32%] top-0 z-20 flex h-[60%] w-[62%] flex-col items-center justify-end rounded-b-lg border-b-4 pb-2 transition-all duration-75 cursor-pointer ${
                          activeNote === nextKey.note
                            ? 'translate-y-0.5 border-amber-500 bg-amber-500 text-zinc-950'
                            : 'border-black bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        <span className="text-[9px] font-semibold">{nextKey.labelRu}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
