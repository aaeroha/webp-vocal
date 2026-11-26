export type InstrumentType = 'piano' | 'strings' | 'harpsichord' | 'organ';

interface AnchorNote {
  name: string;
  midi: number;
}

const ANCHOR_NOTES: AnchorNote[] = [
  { name: 'F2', midi: 41 },
  { name: 'A2', midi: 45 },
  { name: 'Db3', midi: 49 },
  { name: 'F3', midi: 53 },
  { name: 'A3', midi: 57 },
  { name: 'Db4', midi: 61 },
  { name: 'F4', midi: 65 },
  { name: 'A4', midi: 69 },
  { name: 'C5', midi: 72 },
];

const bufferCache = new Map<string, AudioBuffer>();
const pendingFetches = new Map<string, Promise<AudioBuffer | null>>();

let sharedAudioCtx: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

function freqToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

function findClosestAnchor(targetMidi: number): AnchorNote {
  let closest = ANCHOR_NOTES[0];
  let minDiff = Math.abs(targetMidi - closest.midi);

  for (let i = 1; i < ANCHOR_NOTES.length; i++) {
    const diff = Math.abs(targetMidi - ANCHOR_NOTES[i].midi);
    if (diff < minDiff) {
      minDiff = diff;
      closest = ANCHOR_NOTES[i];
    }
  }
  return closest;
}

async function loadAnchorBuffer(
  ctx: AudioContext,
  instrument: InstrumentType,
  anchorName: string
): Promise<AudioBuffer | null> {
  const cacheKey = `${instrument}:${anchorName}`;
  const cached = bufferCache.get(cacheKey);
  if (cached) return cached;

  const existingPromise = pendingFetches.get(cacheKey);
  if (existingPromise) return existingPromise;

  const promise = (async () => {
    try {
      const res = await fetch(`./media/instruments/${instrument}/${anchorName}.mp3`);
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arr);
      bufferCache.set(cacheKey, decoded);
      return decoded;
    } catch {
      return null;
    } finally {
      pendingFetches.delete(cacheKey);
    }
  })();

  pendingFetches.set(cacheKey, promise);
  return promise;
}

/**
 * Quietly preload the 9 compact MP3 anchor buffers for the chosen instrument
 * so subsequent key presses and karaoke notes play with zero delay.
 */
export async function preloadInstrument(instrument: InstrumentType): Promise<void> {
  const ctx = getSharedAudioContext();
  await Promise.all(ANCHOR_NOTES.map((a) => loadAnchorBuffer(ctx, instrument, a.name)));
}

/**
 * Play a real sampled acoustic instrument note (piano, strings, harpsichord, or organ)
 * pitched smoothly via Web Audio playbackRate from the nearest studio anchor recording.
 */
export async function playInstrumentSample(
  freq: number,
  instrument: InstrumentType = 'piano',
  durationSec = 1.4,
  volume = 0.72
): Promise<void> {
  const ctx = getSharedAudioContext();
  const targetMidi = freqToMidi(freq);
  const anchor = findClosestAnchor(targetMidi);
  const buffer = await loadAnchorBuffer(ctx, instrument, anchor.name);

  if (!buffer) return;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = Math.pow(2, (targetMidi - anchor.midi) / 12);

  const gain = ctx.createGain();
  const now = ctx.currentTime;
  const playDur = Math.min(durationSec, Math.max(0.25, buffer.duration));

  gain.gain.setValueAtTime(volume, now);
  gain.gain.setValueAtTime(volume, now + Math.max(0.05, playDur - 0.18));
  gain.gain.exponentialRampToValueAtTime(0.001, now + playDur);

  source.connect(gain).connect(ctx.destination);
  source.start(now);
  source.stop(now + playDur + 0.02);
}
