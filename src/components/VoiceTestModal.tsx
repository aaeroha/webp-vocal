import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AudioWaveform,
  CalendarCheck,
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

/**
 * Lightweight time-domain autocorrelation pitch estimator (Hz) for vocal range detection.
 */
function detectPitchHz(buffer: Float32Array, sampleRate: number): number | null {
  const size = buffer.length;
  let rms = 0;
  for (let i = 0; i < size; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / size);
  if (rms < 0.015) return null; // Silence or background noise floor

  // Trim low-amplitude edges
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

  // Parabolic interpolation around peak
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
      score: 88,
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

  // Score calculation based on pitch stability and sample richness (always encouraging 89-98%)
  const richness = Math.min(8, Math.floor(samplesHz.length / 10));
  const score = Math.min(98, 89 + richness);

  return { profile: matched, medianHz, minSampleHz, maxSampleHz, score };
}

export function VoiceTestModal({ isOpen, onClose, onOpenBooking }: VoiceTestModalProps) {
  const [step, setStep] = useState<Step>('gender');
  const [gender, setGender] = useState<Gender>('female');
  const [taskMode, setTaskMode] = useState<TaskMode>('song');
  const [selectedSongIdx, setSelectedSongIdx] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [currentHz, setCurrentHz] = useState<number | null>(null);
  const [hasVoiceDetected, setHasVoiceDetected] = useState(false);

  const [result, setResult] = useState<ReturnType<typeof classifyVoice> | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<number>(0);
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const resetAll = useCallback(() => {
    cleanupAudio();
    setStep('gender');
    setSecondsLeft(10);
    setCurrentHz(null);
    setHasVoiceDetected(false);
    setResult(null);
    samplesRef.current = [];
  }, [cleanupAudio]);

  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      return;
    }

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

  const finishRecording = useCallback(() => {
    const collected = [...samplesRef.current];
    cleanupAudio();

    if (collected.length < 3) {
      // User hasn't sung or mic captured only silence
      setHasVoiceDetected(false);
      return;
    }

    const finalAnalysis = classifyVoice(gender, collected);
    setResult(finalAnalysis);
    setStep('result');
  }, [cleanupAudio, gender]);

  const startRecording = async () => {
    setHasVoiceDetected(true);
    samplesRef.current = [];
    setCurrentHz(null);
    setSecondsLeft(10);
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

            // Detect pitch every 4th frame to keep CPU ultra-light
            frameCounter++;
            if (frameCounter % 4 === 0) {
              const hz = detectPitchHz(timeData, ctx.sampleRate);
              if (hz) {
                samplesRef.current.push(hz);
                setCurrentHz(hz);
              }
            }

            // Symmetric mirrored waveform style (inspired by reference screenshot)
            const midY = height / 2;
            const barCount = 56;
            const gap = 3;
            const barWidth = Math.max(2, (width - barCount * gap) / barCount);

            // Center horizontal reference line
            cctx.strokeStyle = 'rgba(45, 212, 191, 0.45)';
            cctx.lineWidth = 1.5;
            cctx.beginPath();
            cctx.moveTo(0, midY);
            cctx.lineTo(width, midY);
            cctx.stroke();

            for (let i = 0; i < barCount; i++) {
              // Symmetric distribution concentrating vocal spectrum in the center
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

      let remaining = 10;
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

  const currentPromptText =
    taskMode === 'song'
      ? VOICE_TEST_CONTENT.songs[selectedSongIdx]
      : {
          title: 'Вокальная распевка',
          hint: 'Спойте эту фразу в комфортном темпе',
          lines: VOICE_TEST_CONTENT.randomPhrases[phraseIdx],
        };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-test-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      <div
        onClick={() => {
          cleanupAudio();
          onClose();
        }}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <div className="animate-modal-enter relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-zinc-900/12 bg-[#FAF8F5] p-5 shadow-2xl dark:border-white/15 dark:bg-[#16151C] sm:p-7">
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
              {step === 'mode' && 'Что споём для анализа?'}
              {step === 'record' && 'Пойте в микрофон — идёт живой анализ'}
              {step === 'mic-error' && 'Микрофон не обнаружен'}
              {step === 'result' && 'Ваш вокальный профиль готов!'}
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
              За 10 секунд проанализируем частотный диапазон вашего голоса и определим природный тип (Сопрано, Меццо, Контральто или Тенор, Баритон, Бас).
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

        {/* STEP 2: SONG OR RANDOM PHRASE */}
        {step === 'mode' && (
          <div className="mt-6 space-y-5">
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
                Спеть отрывок песни
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
              <div className="space-y-2.5">
                {VOICE_TEST_CONTENT.songs.map((song, idx) => (
                  <button
                    key={song.id}
                    type="button"
                    onClick={() => setSelectedSongIdx(idx)}
                    className={`w-full rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                      selectedSongIdx === idx
                        ? 'border-[#B45309]/60 bg-[#F2EDE6] shadow-sm dark:border-[#E2A856]/60 dark:bg-[#0D0C10]'
                        : 'border-zinc-900/10 bg-[#F2EDE6]/60 hover:border-zinc-900/25 dark:border-white/10 dark:bg-[#0D0C10]/60'
                    }`}
                  >
                    <p className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-[#F5F3EF]">
                      <Music className="h-4 w-4 text-[#B45309] dark:text-[#E2A856]" />
                      {song.title}
                    </p>
                    <p className="mt-1 text-xs italic text-zinc-600 dark:text-zinc-300">
                      {song.lines}
                    </p>
                  </button>
                ))}
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
                className="btn-sheen inline-flex items-center gap-2 rounded-full bg-[#B45309] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#9A4407] dark:bg-[#E2A856] dark:text-[#0D0C10] dark:hover:bg-[#EBB86E] cursor-pointer"
              >
                <Mic className="h-4 w-4" />
                Включить микрофон и спеть
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LIVE RECORDING & WAVEFORM CANVAS */}
        {step === 'record' && (
          <div className="mt-5 space-y-5">
            <div className="rounded-2xl border border-[#B45309]/25 bg-[#F2EDE6]/90 p-4 dark:border-[#E2A856]/25 dark:bg-[#0D0C10]/85">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#B45309] dark:text-[#E2A856]">
                {currentPromptText.hint}
              </p>
              <p className="mt-1.5 font-serif text-xl font-semibold leading-snug text-zinc-900 dark:text-[#F5F3EF]">
                {currentPromptText.lines}
              </p>
            </div>

            {/* Live Symmetric Waveform Canvas */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-900/10 bg-[#0D0C10] p-4 shadow-inner dark:border-white/10">
              <canvas
                ref={canvasRef}
                width={500}
                height={130}
                className="h-32 w-full"
              />

              <div className="mt-3 flex items-center justify-between text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400" />
                  <span>
                    {currentHz
                      ? `Нота: ${hzToNoteLabel(currentHz)} (${Math.round(currentHz)} Гц)`
                      : 'Спойте любой звук, я слушаю...'}
                  </span>
                </div>
                <span className="font-mono font-semibold text-amber-400">
                  {secondsLeft} сек
                </span>
              </div>
            </div>

            {!hasVoiceDetected && !isRecording && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                Почти не слышно голоса — проверьте громкость микрофона и попробуйте спеть чуть громче.
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              {isRecording ? (
                <button
                  type="button"
                  onClick={finishRecording}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-[#E2A856] dark:text-[#0D0C10] cursor-pointer"
                >
                  <Square className="h-4 w-4 fill-current" />
                  Завершить и узнать результат
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#B45309] px-6 py-3 text-sm font-semibold text-white cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  Попробовать ещё раз
                </button>
              )}
            </div>
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

        {/* STEP 4: RESULT */}
        {step === 'result' && result && (
          <div className="mt-5 space-y-5">
            <div className="rounded-2xl border border-[#B45309]/35 bg-gradient-to-br from-[#F2EDE6] to-[#FAF8F5] p-5 dark:border-[#E2A856]/40 dark:from-[#1B1924] dark:to-[#121117]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B45309] px-3 py-1 text-xs font-semibold text-white dark:bg-[#E2A856] dark:text-[#0D0C10]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Ваш тип голоса: {result.profile.name}
                </span>
                <span className="font-serif text-xl font-bold text-[#B45309] dark:text-[#E2A856]">
                  Потенциал: {result.score}%
                </span>
              </div>

              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Ориентировочный диапазон: {result.profile.rangeLabel}
              </p>

              <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                {result.profile.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {result.profile.subtypes.map((sub) => (
                  <span
                    key={sub}
                    className="rounded-full border border-zinc-900/10 bg-white/70 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700 dark:border-white/10 dark:bg-black/30 dark:text-zinc-300"
                  >
                    {sub}
                  </span>
                ))}
              </div>

              <div className="mt-4 border-t border-zinc-900/10 pt-3 text-xs text-zinc-600 dark:border-white/10 dark:text-zinc-400">
                Зафиксировано звучание от <strong>{hzToNoteLabel(result.minSampleHz)}</strong> до{' '}
                <strong>{hzToNoteLabel(result.maxSampleHz)}</strong> (средняя опора ~{' '}
                {Math.round(result.medianHz)} Гц).
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <p className="font-serif text-xl font-semibold text-zinc-900 dark:text-[#F5F3EF]">
                Вау, вы супер! Отличный природный тембр 🎉
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                Осталось записаться на урок, чтобы снять зажимы, укрепить опору и раскрыть ваш талант на полную мощность!
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="btn-sheen flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#B45309] px-6 py-3.5 text-sm font-semibold text-white shadow-md dark:bg-[#E2A856] dark:text-[#0D0C10] cursor-pointer"
              >
                <CalendarCheck className="h-4 w-4" />
                Записаться на урок
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-900/15 px-5 py-3.5 text-sm font-semibold text-zinc-800 dark:border-white/15 dark:text-zinc-200 cursor-pointer"
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
