import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AudioWaveform,
  CalendarCheck,
  ChevronDown,
  Info,
  Mic,
  MicOff,
  Music,
  RefreshCw,
  Sparkles,
  Square,
  User,
  X,
} from 'lucide-react';
import { VOICE_TEST_CONTENT, VOICE_TYPES, type VoiceTypeProfile } from '../data/content';
import { playInstrumentSample, preloadInstrument } from '../utils/instrumentSampler';

interface VoiceTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

type Gender = 'female' | 'male';
type TaskMode = 'song' | 'phrase';
type Step = 'gender' | 'mode' | 'record' | 'mic-error' | 'result';

const NOTE_NAMES_RU = ['До', 'До♯', 'Ре', 'Ми♭', 'Ми', 'Фа', 'Фа♯', 'Соль', 'Соль♯', 'Ля', 'Си♭', 'Си'];
const NOTE_NAMES_EN = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];

function hzToNoteLabel(hz: number): string {
  if (!hz || hz < 50 || hz > 1400) return '—';
  const midi = Math.round(69 + 12 * Math.log2(hz / 440));
  const noteIdx = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES_RU[noteIdx]} (${NOTE_NAMES_EN[noteIdx]}${octave})`;
}

function detectPitchHz(buffer: Float32Array, sampleRate: number): number | null {
  const size = buffer.length;
  let rms = 0;
  for (let i = 0; i < size; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / size);
  if (rms < 0.015) return null;

  let r1 = 0;
  let r2 = size - 1;
  const threshold = 0.2;
  for (let i = 0; i < size / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < size / 2; i++) {
    if (Math.abs(buffer[size - i]) < threshold) {
      r2 = size - i;
      break;
    }
  }

  const trimmed = buffer.slice(r1, r2);
  const len = trimmed.length;
  if (len < 64) return null;

  const correlations = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let sum = 0;
    for (let j = 0; j < len - i; j++) {
      sum += trimmed[j] * trimmed[j + i];
    }
    correlations[i] = sum;
  }

  let d = 0;
  while (d < len - 1 && correlations[d] > correlations[d + 1]) {
    d++;
  }

  let maxVal = -1;
  let maxPos = -1;
  for (let i = d; i < len; i++) {
    if (correlations[i] > maxVal) {
      maxVal = correlations[i];
      maxPos = i;
    }
  }

  if (maxPos <= 0 || maxVal <= 0) return null;

  const x1 = maxPos > 0 ? correlations[maxPos - 1] : correlations[maxPos];
  const x2 = correlations[maxPos];
  const x3 = maxPos < len - 1 ? correlations[maxPos + 1] : correlations[maxPos];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  const betterPos = a !== 0 ? maxPos - b / (2 * a) : maxPos;

  const freq = sampleRate / betterPos;
  if (freq < 65 || freq > 1100) return null;
  return freq;
}

function classifyVoice(gender: Gender, samplesHz: number[]): {
  profile: VoiceTypeProfile;
  medianHz: number;
  minSampleHz: number;
  maxSampleHz: number;
  score: number;
} {
  const candidates = VOICE_TYPES.filter((v) => v.gender === gender);
  if (samplesHz.length === 0) {
    return {
      profile: candidates[1] ?? candidates[0],
      medianHz: gender === 'female' ? 245 : 135,
      minSampleHz: gender === 'female' ? 200 : 110,
      maxSampleHz: gender === 'female' ? 320 : 195,
      score: 91,
    };
  }

  const sorted = [...samplesHz].sort((a, b) => a - b);
  const medianHz = sorted[Math.floor(sorted.length / 2)];
  const minSampleHz = sorted[Math.max(0, Math.floor(sorted.length * 0.1))];
  const maxSampleHz = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.9))];

  let matched = candidates[1] ?? candidates[0];
  if (gender === 'female') {
    if (medianHz >= 270) matched = candidates.find((c) => c.id === 'soprano') ?? matched;
    else if (medianHz >= 205) matched = candidates.find((c) => c.id === 'mezzo') ?? matched;
    else matched = candidates.find((c) => c.id === 'contralto') ?? matched;
  } else {
    if (medianHz >= 162) matched = candidates.find((c) => c.id === 'tenor') ?? matched;
    else if (medianHz >= 112) matched = candidates.find((c) => c.id === 'baritone') ?? matched;
    else matched = candidates.find((c) => c.id === 'bass') ?? matched;
  }

  const richness = Math.min(8, Math.floor(samplesHz.length / 10));
  const score = Math.min(98, 90 + richness);

  return { profile: matched, medianHz, minSampleHz, maxSampleHz, score };
}

function ConfettiFireworksCanvas() {
  const confettiRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#FACC15', '#F59E0B', '#10B981', '#38BDF8', '#FB7185', '#E2A856', '#FFFFFF'];

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      rot: number;
      rotSpeed: number;
      shape: 'rect' | 'circle';
    }

    const particles: Particle[] = [];

    const launchBurst = (cx: number, cy: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const speed = 3 + Math.random() * 8.5;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          size: 4 + Math.random() * 5.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.25,
          shape: Math.random() > 0.35 ? 'rect' : 'circle',
        });
      }
    };

    const w = canvas.width;
    const h = canvas.height;
    launchBurst(w * 0.5, h * 0.38, 65);
    const t1 = window.setTimeout(() => launchBurst(w * 0.28, h * 0.3, 45), 220);
    const t2 = window.setTimeout(() => launchBurst(w * 0.72, h * 0.32, 45), 420);

    let rafId = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.16;
        p.vx *= 0.985;
        p.rot += p.rotSpeed;
        p.alpha -= 0.011;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (particles.length > 0) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={confettiRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60]"
    />
  );
}

export function VoiceTestModal({ isOpen, onClose, onOpenBooking }: VoiceTestModalProps) {
  const [step, setStep] = useState<Step>('gender');
  const [gender, setGender] = useState<Gender>('female');
  const [taskMode, setTaskMode] = useState<TaskMode>('song');
  const [selectedSongIdx, setSelectedSongIdx] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [activeSyllableIdx, setActiveSyllableIdx] = useState<number>(-1);
  const [currentHz, setCurrentHz] = useState<number | null>(null);
  const [hasVoiceDetected, setHasVoiceDetected] = useState(false);

  const [result, setResult] = useState<ReturnType<typeof classifyVoice> | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<number>(0);
  const karaokeTimersRef = useRef<number[]>([]);
  const samplesRef = useRef<number[]>([]);

  const cleanupAudio = useCallback(() => {
    if (animFrameRef.current) {
      window.cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = 0;
    }
    karaokeTimersRef.current.forEach((t) => window.clearTimeout(t));
    karaokeTimersRef.current = [];
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsRecording(false);
    setActiveSyllableIdx(-1);
  }, []);

  const resetAll = useCallback(() => {
    cleanupAudio();
    setStep('gender');
    setSecondsLeft(10);
    setCurrentHz(null);
    setHasVoiceDetected(false);
    setResult(null);
    setDetailsOpen(false);
    setAnimatedScore(0);
    samplesRef.current = [];
  }, [cleanupAudio]);

  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      return;
    }

    // Quietly preload real piano samples for karaoke guide melody
    preloadInstrument('piano').catch(() => {});

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanupAudio();
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
      cleanupAudio();
    };
  }, [isOpen, onClose, cleanupAudio]);

  // Smooth score bar counter animation when result appears
  useEffect(() => {
    if (step !== 'result' || !result) {
      setAnimatedScore(0);
      return;
    }
    let rafId = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedScore(Math.round(result.score * eased));
      if (p < 1) rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [step, result]);

  const finishRecording = useCallback(() => {
    const collected = [...samplesRef.current];
    cleanupAudio();

    if (collected.length < 3) {
      setHasVoiceDetected(false);
      return;
    }

    const finalAnalysis = classifyVoice(gender, collected);
    setResult(finalAnalysis);
    setDetailsOpen(false);
    setStep('result');
  }, [cleanupAudio, gender]);

  const startRecording = async () => {
    setHasVoiceDetected(true);
    samplesRef.current = [];
    setCurrentHz(null);
    setActiveSyllableIdx(-1);

    const activeSong = VOICE_TEST_CONTENT.songs[selectedSongIdx];
    const songDurationMs = activeSong.syllables.reduce((acc, s) => acc + s.ms, 0);
    const totalSec =
      taskMode === 'song' ? Math.max(9, Math.ceil(songDurationMs / 1000) + 1) : 10;

    setSecondsLeft(totalSec);
    setStep('record');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStep('mic-error');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const timeData = new Float32Array(analyser.fftSize);
      const freqData = new Uint8Array(analyser.frequencyBinCount);

      setIsRecording(true);

      // Schedule karaoke melody + syllable highlight with real acoustic piano sample
      if (taskMode === 'song') {
        await preloadInstrument('piano').catch(() => {});
        const pitchScale = gender === 'male' ? 0.5 : 1; // One octave lower for male comfort
        let offsetMs = 350;

        activeSong.syllables.forEach((syl, idx) => {
          const timerId = window.setTimeout(() => {
            setActiveSyllableIdx(idx);
            playInstrumentSample(
              syl.freq * pitchScale,
              'piano',
              Math.max(0.55, syl.ms / 1000 + 0.35),
              0.38
            ).catch(() => {});
          }, offsetMs);
          karaokeTimersRef.current.push(timerId);
          offsetMs += syl.ms;
        });
      }

      let frameCounter = 0;

      const draw = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const cctx = canvas.getContext('2d');
          if (cctx) {
            const width = canvas.width;
            const height = canvas.height;
            cctx.clearRect(0, 0, width, height);

            analyser.getByteFrequencyData(freqData);
            analyser.getFloatTimeDomainData(timeData);

            frameCounter++;
            if (frameCounter % 4 === 0) {
              const hz = detectPitchHz(timeData, ctx.sampleRate);
              if (hz) {
                samplesRef.current.push(hz);
                setCurrentHz(hz);
              }
            }

            const midY = height / 2;
            const barCount = 56;
            const gap = 3;
            const barWidth = Math.max(2, (width - barCount * gap) / barCount);

            cctx.strokeStyle = 'rgba(45, 212, 191, 0.45)';
            cctx.lineWidth = 1.5;
            cctx.beginPath();
            cctx.moveTo(0, midY);
            cctx.lineTo(width, midY);
            cctx.stroke();

            for (let i = 0; i < barCount; i++) {
              const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
              const binIndex = Math.min(
                freqData.length - 1,
                Math.floor((1 - distFromCenter) * 48) + (i % 6)
              );
              const rawAmp = freqData[binIndex] / 255;
              const envelope = Math.max(0.06, rawAmp * (1 - distFromCenter * 0.45));
              const barHalfHeight = Math.max(2, envelope * (height * 0.44));

              const x = i * (barWidth + gap);

              const grad = cctx.createLinearGradient(0, midY - barHalfHeight, 0, midY + barHalfHeight);
              grad.addColorStop(0, '#5EEAD4');
              grad.addColorStop(0.5, '#10B981');
              grad.addColorStop(1, '#5EEAD4');

              cctx.fillStyle = grad;
              cctx.beginPath();
              cctx.roundRect(x, midY - barHalfHeight, barWidth, barHalfHeight * 2, 2);
              cctx.fill();
            }
          }
        }
        animFrameRef.current = window.requestAnimationFrame(draw);
      };

      animFrameRef.current = window.requestAnimationFrame(draw);

      let remaining = totalSec;
      timerRef.current = window.setInterval(() => {
        remaining -= 1;
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          finishRecording();
        }
      }, 1000);
    } catch {
      cleanupAudio();
      setStep('mic-error');
    }
  };

  if (!isOpen) return null;

  const selectedSong = VOICE_TEST_CONTENT.songs[selectedSongIdx];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-test-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      {step === 'result' && result && <ConfettiFireworksCanvas />}

      <div
        onClick={() => {
          cleanupAudio();
          onClose();
        }}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <div className="custom-scrollbar animate-modal-enter relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-zinc-900/12 bg-[#FAF8F5] p-5 shadow-2xl dark:border-white/15 dark:bg-[#16151C] sm:p-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B45309]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#B45309] dark:bg-[#E2A856]/15 dark:text-[#E2A856]">
              <AudioWaveform className="h-3.5 w-3.5" />
              Интерактивный тест голоса
            </span>
            <h3
              id="voice-test-title"
              className="mt-2 font-serif text-2xl font-semibold leading-tight text-zinc-900 dark:text-[#F5F3EF] sm:text-3xl"
            >
              {step === 'gender' && 'Узнайте ваш тип и тембр голоса'}
              {step === 'mode' && 'Выберите песню или распевку'}
              {step === 'record' && 'Пойте в микрофон — идёт живой анализ'}
              {step === 'mic-error' && 'Микрофон не обнаружен'}
              {step === 'result' && 'Отличный природный тембр!'}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              cleanupAudio();
              onClose();
            }}
            aria-label="Закрыть тест голоса"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-900/10 bg-[#F2EDE6] text-zinc-700 transition-colors hover:text-[#B45309] dark:border-white/10 dark:bg-[#0D0C10] dark:text-zinc-300 dark:hover:text-[#E2A856] cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* STEP 1: GENDER */}
        {step === 'gender' && (
          <div className="mt-6 space-y-5">
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              Спойте отрывок знакомой народной песни под мягкий мотив-караоке или короткую распевку — мы измерим ваш частотный диапазон и определим тип голоса.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setGender('female');
                  setStep('mode');
                }}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-zinc-900/10 bg-[#F2EDE6]/90 p-5 text-center transition-all hover:-translate-y-0.5 hover:border-[#B45309]/55 hover:shadow-md dark:border-white/10 dark:bg-[#0D0C10]/85 dark:hover:border-[#E2A856]/55 cursor-pointer"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#B45309]/12 text-[#B45309] transition-transform group-hover:scale-110 dark:bg-[#E2A856]/15 dark:text-[#E2A856]">
                  <User className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-serif text-xl font-semibold text-zinc-900 dark:text-[#F5F3EF]">
                    Женский голос
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Сопрано • Меццо-сопрано • Контральто
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setGender('male');
                  setStep('mode');
                }}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-zinc-900/10 bg-[#F2EDE6]/90 p-5 text-center transition-all hover:-translate-y-0.5 hover:border-[#B45309]/55 hover:shadow-md dark:border-white/10 dark:bg-[#0D0C10]/85 dark:hover:border-[#E2A856]/55 cursor-pointer"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#B45309]/12 text-[#B45309] transition-transform group-hover:scale-110 dark:bg-[#E2A856]/15 dark:text-[#E2A856]">
                  <User className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-serif text-xl font-semibold text-zinc-900 dark:text-[#F5F3EF]">
                    Мужской голос
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Тенор • Баритон • Бас
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: 5 SONGS OR RANDOM PHRASE */}
        {step === 'mode' && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTaskMode('song')}
                className={`rounded-xl border px-3 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  taskMode === 'song'
                    ? 'border-[#B45309] bg-[#B45309]/12 text-[#B45309] dark:border-[#E2A856] dark:bg-[#E2A856]/15 dark:text-[#E2A856]'
                    : 'border-zinc-900/10 bg-[#F2EDE6]/70 text-zinc-700 dark:border-white/10 dark:bg-[#0D0C10]/70 dark:text-zinc-300'
                }`}
              >
                Спеть песню под караоке
              </button>
              <button
                type="button"
                onClick={() => setTaskMode('phrase')}
                className={`rounded-xl border px-3 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  taskMode === 'phrase'
                    ? 'border-[#B45309] bg-[#B45309]/12 text-[#B45309] dark:border-[#E2A856] dark:bg-[#E2A856]/15 dark:text-[#E2A856]'
                    : 'border-zinc-900/10 bg-[#F2EDE6]/70 text-zinc-700 dark:border-white/10 dark:bg-[#0D0C10]/70 dark:text-zinc-300'
                }`}
              >
                Напеть случайную распевку
              </button>
            </div>

            {taskMode === 'song' ? (
              <div className="custom-scrollbar space-y-2 max-h-[260px] overflow-y-auto pr-2">
                {VOICE_TEST_CONTENT.songs.map((song, idx) => {
                  const previewLine = song.syllables.map((s) => s.text).join('');
                  return (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => setSelectedSongIdx(idx)}
                      className={`w-full rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                        selectedSongIdx === idx
                          ? 'border-[#B45309]/70 bg-[#F2EDE6] shadow-sm dark:border-[#E2A856]/70 dark:bg-[#0D0C10]'
                          : 'border-zinc-900/10 bg-[#F2EDE6]/60 hover:border-zinc-900/25 dark:border-white/10 dark:bg-[#0D0C10]/60'
                      }`}
                    >
                      <p className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-[#F5F3EF]">
                        <Music className="h-4 w-4 shrink-0 text-[#B45309] dark:text-[#E2A856]" />
                        {song.title}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs italic text-zinc-600 dark:text-zinc-400">
                        {previewLine}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-900/10 bg-[#F2EDE6]/90 p-5 dark:border-white/10 dark:bg-[#0D0C10]/85">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#B45309] dark:text-[#E2A856]">
                    Задание для распевки
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPhraseIdx((prev) => (prev + 1) % VOICE_TEST_CONTENT.randomPhrases.length)
                    }
                    className="inline-flex items-center gap-1 rounded-full border border-zinc-900/10 bg-[#FAF8F5] px-2.5 py-1 text-[11px] font-medium text-zinc-700 hover:text-[#B45309] dark:border-white/10 dark:bg-[#16151C] dark:text-zinc-300 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Другой текст
                  </button>
                </div>
                <p className="mt-3 font-serif text-xl font-semibold text-zinc-900 dark:text-[#F5F3EF]">
                  {VOICE_TEST_CONTENT.randomPhrases[phraseIdx]}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('gender')}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
              >
                ← Назад
              </button>
              <button
                type="button"
                onClick={startRecording}
                className="btn-sheen inline-flex items-center gap-2 rounded-full bg-[#B45309] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#9A4407] dark:bg-[#E2A856] dark:text-[#0D0C10] dark:hover:bg-[#F3C884] cursor-pointer"
              >
                <Mic className="h-4 w-4" />
                Включить микрофон и спеть
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LIVE RECORDING + SYNTHESIZED KARAOKE GUIDE */}
        {step === 'record' && (
          <div className="mt-5 space-y-5">
            <div className="rounded-2xl border border-[#B45309]/25 bg-[#F2EDE6]/95 p-4 dark:border-[#E2A856]/25 dark:bg-[#0D0C10]/85">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#B45309] dark:text-[#E2A856]">
                  {taskMode === 'song' ? selectedSong.title : 'Спойте распевку'}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    cleanupAudio();
                    setStep('mode');
                  }}
                  className="text-[11px] font-semibold text-zinc-500 transition-colors hover:text-[#B45309] dark:text-zinc-400 dark:hover:text-[#E2A856] cursor-pointer"
                >
                  ← Сменить песню
                </button>
              </div>

              {taskMode === 'song' ? (
                <div className="mt-3 font-serif text-xl sm:text-2xl font-semibold leading-relaxed">
                  {selectedSong.syllables.map((syl, idx) => {
                    const isCurrent = idx === activeSyllableIdx;
                    const isPast = idx < activeSyllableIdx;
                    const hasSpace = syl.text.endsWith(' ');
                    const cleanText = hasSpace ? syl.text.trimEnd() : syl.text;
                    return (
                      <span key={idx}>
                        <span
                          className={`inline-block transition-all duration-150 ${
                            hasSpace ? 'mr-2 sm:mr-2.5' : ''
                          } ${
                            isCurrent
                              ? 'scale-110 rounded-md bg-amber-400/30 px-1 text-[#B45309] underline decoration-2 underline-offset-4 dark:bg-amber-400/20 dark:text-[#FACC15]'
                              : isPast
                              ? 'text-[#B45309] dark:text-[#E2A856]'
                              : 'text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {cleanText}
                        </span>
                        {syl.lineBreak && <br />}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-2 font-serif text-xl font-semibold leading-snug text-zinc-900 dark:text-[#F5F3EF]">
                  {VOICE_TEST_CONTENT.randomPhrases[phraseIdx]}
                </p>
              )}
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-zinc-900/10 bg-[#0D0C10] p-4 shadow-inner dark:border-white/10">
              <canvas
                ref={canvasRef}
                width={500}
                height={130}
                className="h-32 w-full"
              />

              <div className="mt-3 flex items-center justify-between text-xs text-zinc-300">
                {isRecording ? (
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400" />
                    <span>
                      {currentHz
                        ? `Нота: ${hzToNoteLabel(currentHz)} (${Math.round(currentHz)} Гц)`
                        : 'Спойте в такт или протяните звук...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-400 font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span>Микрофон был слишком тихим — голос не распознан</span>
                  </div>
                )}

                <span
                  className={`font-mono font-semibold ${
                    !isRecording ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {secondsLeft} сек
                </span>
              </div>
            </div>

            {!hasVoiceDetected && !isRecording && (
              <div className="rounded-2xl border-2 border-rose-500/75 bg-rose-500/15 p-3.5 text-xs sm:text-sm font-semibold leading-relaxed text-rose-800 dark:text-rose-200">
                Сигнал с микрофона был слишком слабым. Попробуйте поднести микрофон ближе или спойте чуть громче — можно повторить эту же песню или выбрать другую.
              </div>
            )}

            {isRecording ? (
              <button
                type="button"
                onClick={finishRecording}
                className="btn-sheen inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#B45309] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#9A4407] dark:bg-[#E2A856] dark:text-[#0D0C10] dark:hover:bg-[#F3C884] cursor-pointer"
              >
                <Square className="h-4 w-4 fill-current" />
                Завершить и узнать результат
              </button>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={startRecording}
                  className="btn-sheen inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#B45309] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#9A4407] dark:bg-[#E2A856] dark:text-[#0D0C10] dark:hover:bg-[#F3C884] cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4 shrink-0" />
                  <span>Спеть ещё раз</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cleanupAudio();
                    setStep('mode');
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-900/15 px-5 py-3.5 text-sm font-semibold text-zinc-800 hover:border-[#B45309]/40 dark:border-white/15 dark:text-zinc-200 cursor-pointer"
                >
                  <Music className="h-4 w-4 shrink-0" />
                  <span>Выбрать другую</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* MIC UNAVAILABLE / DENIED FALLBACK */}
        {step === 'mic-error' && (
          <div className="mt-6 space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 text-[#B45309] dark:text-[#E2A856]">
              <MicOff className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <p className="font-serif text-2xl font-semibold text-zinc-900 dark:text-[#F5F3EF]">
                Очень жаль, микрофон не отвечает!
              </p>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                Приходите тогда на занятие в студию или онлайн — мы проверим ваш диапазон вживую на профессиональном оборудовании и раскроем ваш талант!
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="btn-sheen inline-flex items-center justify-center gap-2 rounded-full bg-[#B45309] px-6 py-3 text-sm font-semibold text-white dark:bg-[#E2A856] dark:text-[#0D0C10] cursor-pointer"
              >
                <CalendarCheck className="h-4 w-4" />
                Записаться на занятие
              </button>
              <button
                type="button"
                onClick={startRecording}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-900/15 px-5 py-3 text-sm font-semibold text-zinc-800 dark:border-white/15 dark:text-zinc-200 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Проверить снова
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: COHESIVE SINGLE-CARD RESULT + INTERACTIVE DETAILS (HOVER ON DESKTOP / TAP ON MOBILE) */}
        {step === 'result' && result && (
          <div className="mt-5 space-y-5">
            {/* Single unified rich vocal card */}
            <div className="relative overflow-hidden rounded-3xl border border-[#B45309]/35 bg-gradient-to-br from-[#F2EDE6] via-[#FAF8F5] to-[#EFE6D8] p-5 shadow-lg dark:border-[#E2A856]/40 dark:from-[#1D1B26] dark:via-[#15141B] dark:to-[#111016] sm:p-6">
              {/* Highlighted Voice Type + Potential Bar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#B45309] dark:text-[#E2A856]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Ваш тип голоса
                  </p>
                  <h4 className="mt-1 font-serif text-3xl font-bold tracking-tight text-zinc-950 dark:text-[#F5F3EF] sm:text-4xl">
                    {result.profile.name}
                  </h4>
                </div>

                <div className="sm:text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Вокальный потенциал
                  </p>
                  <p className="font-serif text-3xl font-bold leading-none text-emerald-600 dark:text-emerald-400 sm:text-4xl">
                    {animatedScore}%
                  </p>
                </div>
              </div>

              {/* Animated Progress Track */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-900/10 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#B45309] via-[#E2A856] to-emerald-500 transition-[width] duration-700 ease-out"
                  style={{ width: `${animatedScore}%` }}
                />
              </div>

              {/* Praise integrated directly inside main card */}
              <p className="mt-4 text-sm font-medium leading-relaxed text-zinc-800 dark:text-zinc-100">
                Вау, вы супер! У вас выразительный природный тембр и живая музыкальная интонация.
              </p>

              {/* Unified clean 3-stat horizontal bar with color-highlighted notes & bigger typography */}
              <div className="mt-5 grid grid-cols-3 divide-x divide-zinc-900/10 border-y border-zinc-900/10 py-4 text-center dark:divide-white/10 dark:border-white/10">
                <div className="px-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Нижняя нота
                  </p>
                  <p className="mt-1.5 font-serif text-2xl font-bold text-sky-600 dark:text-sky-400 sm:text-3xl">
                    {hzToNoteLabel(result.minSampleHz).split(' ')[0]}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-sky-500/12 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-400/15 dark:text-sky-300">
                    {hzToNoteLabel(result.minSampleHz).split(' ')[1] ?? '—'}
                  </span>
                </div>

                <div className="px-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Верхняя нота
                  </p>
                  <p className="mt-1.5 font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400 sm:text-3xl">
                    {hzToNoteLabel(result.maxSampleHz).split(' ')[0]}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                    {hzToNoteLabel(result.maxSampleHz).split(' ')[1] ?? '—'}
                  </span>
                </div>

                <div className="px-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Опора тона
                  </p>
                  <p className="mt-1.5 font-serif text-2xl font-bold text-[#B45309] dark:text-[#E2A856] sm:text-3xl">
                    {Math.round(result.medianHz)} Гц
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-[#B45309]/10 px-2.5 py-0.5 text-xs font-semibold text-[#B45309] dark:bg-[#E2A856]/15 dark:text-[#E2A856]">
                    Центр тембра
                  </span>
                </div>
              </div>

              {/* Interactive Description: opens on hover (desktop) OR tap (mobile/all) */}
              <div
                onMouseEnter={() => {
                  if (window.matchMedia('(hover: hover)').matches) setDetailsOpen(true);
                }}
                onMouseLeave={() => {
                  if (window.matchMedia('(hover: hover)').matches) setDetailsOpen(false);
                }}
                className="mt-3"
              >
                <button
                  type="button"
                  onClick={() => setDetailsOpen((prev) => !prev)}
                  aria-expanded={detailsOpen}
                  className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left text-xs font-semibold text-[#B45309] transition-colors hover:bg-[#B45309]/8 dark:text-[#E2A856] dark:hover:bg-[#E2A856]/10 cursor-pointer"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    <span>Подробнее о типе «{result.profile.name}» и подтипах</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                      detailsOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    detailsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="mt-2 space-y-2.5 px-2 pb-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                      <p>{result.profile.description}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Полный диапазон типа: <strong className="text-zinc-800 dark:text-zinc-200">{result.profile.rangeLabel}</strong>
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {result.profile.subtypes.map((sub) => (
                          <span
                            key={sub}
                            className="rounded-full border border-[#B45309]/25 bg-white/80 px-2.5 py-0.5 text-[11px] font-medium text-zinc-800 dark:border-[#E2A856]/25 dark:bg-black/40 dark:text-zinc-200"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear final call to action */}
            <p className="text-center font-serif text-lg font-semibold leading-snug text-zinc-900 dark:text-[#F5F3EF]">
              Вы в одном шаге от того, чтобы записаться на урок и раскрыть ваш потенциал!
            </p>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="btn-sheen flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#B45309] px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[#9A4407] dark:bg-[#E2A856] dark:text-[#0D0C10] dark:hover:bg-[#F3C884] cursor-pointer"
              >
                <CalendarCheck className="h-4 w-4" />
                Записаться на урок
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-900/15 px-5 py-3.5 text-sm font-semibold text-zinc-800 hover:border-[#B45309]/40 dark:border-white/15 dark:text-zinc-200 dark:hover:border-[#E2A856]/50 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Пройти снова
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
