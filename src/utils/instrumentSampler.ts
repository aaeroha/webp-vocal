export type InstrumentType =
  | 'piano'
  | 'strings'
  | 'harpsichord'
  | 'organ'
  | 'choir_aahs'
  | 'voice_oohs';

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

const SEMITONE_OFFSETS: Record<string, number> = {
  C: -9,
  'C#': -8,
  Db: -8,
  D: -7,
  'D#': -6,
  Eb: -6,
  E: -5,
  F: -4,
  'F#': -3,
  Gb: -3,
  G: -2,
  'G#': -1,
  Ab: -1,
  A: 0,
  'A#': 1,
  Bb: 1,
  B: 2,
};

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

/**
 * Standard equal-temperament note-to-frequency conversion (A4 = 440 Hz).
 */
export function noteToFreq(note: string | null): number | null {
  if (!note) return null;
  const match = note.match(/^([A-G][#b]?)(-?\d)$/);
  if (!match) return null;
  const baseOffset = SEMITONE_OFFSETS[match[1]];
  if (baseOffset === undefined) return null;
  const semitonesFromA4 = baseOffset + (Number(match[2]) - 4) * 12;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
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
 * Play a real sampled acoustic instrument note immediately.
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

export interface ScheduledSongEvent {
  startSec: number;
  durationSec: number;
  freq: number | null;
}

/**
 * Schedule an entire song onto the hardware Web Audio clock (`ctx.currentTime`)
 * for sample-accurate BPM rhythm without setTimeout audio jitter.
 * Returns a cleanup function that stops all scheduled notes immediately.
 */
export async function scheduleSongPlayback(
  events: ScheduledSongEvent[],
  instrument: InstrumentType = 'piano',
  leadInSec = 0.35,
  volume = 0.4
): Promise<{ audioStartTime: number; stop: () => void }> {
  await preloadInstrument(instrument);
  const ctx = getSharedAudioContext();
  const audioStartTime = ctx.currentTime + leadInSec;
  const activeNodes: { source: AudioBufferSourceNode; gain: GainNode }[] = [];

  for (const ev of events) {
    if (!ev.freq) continue;
    const targetMidi = freqToMidi(ev.freq);
    const anchor = findClosestAnchor(targetMidi);
    const buffer = bufferCache.get(`${instrument}:${anchor.name}`);
    if (!buffer) continue;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = Math.pow(2, (targetMidi - anchor.midi) / 12);

    const gain = ctx.createGain();
    const noteStart = audioStartTime + ev.startSec;
    const playDur = Math.min(Math.max(0.2, ev.durationSec + 0.12), buffer.duration);

    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.linearRampToValueAtTime(volume, noteStart + 0.015);
    gain.gain.setValueAtTime(volume, noteStart + Math.max(0.04, playDur - 0.12));
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + playDur);

    source.connect(gain).connect(ctx.destination);
    source.start(noteStart);
    source.stop(noteStart + playDur + 0.02);
    activeNodes.push({ source, gain });
  }

  return {
    audioStartTime,
    stop: () => {
      activeNodes.forEach(({ source, gain }) => {
        try {
          gain.gain.cancelScheduledValues(ctx.currentTime);
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          source.stop();
        } catch {
          // already stopped
        }
      });
    },
  };
}

function makeSoftSaturatorCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 256;
  const curve = new Float32Array(new ArrayBuffer(n * 4));
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = Math.tanh(x * amount) / Math.tanh(amount);
  }
  return curve;
}

/**
 * Play a realistic human singing voice demonstration derived from sampled
 * choir_aahs / voice_oohs recordings shaped with subtle vibrato and formants.
 */
export async function playVocalTechniqueVoice(
  freq: number,
  techniqueId: 'chest-support' | 'belt' | 'distortion' | 'subtone' | 'mix' | 'head-register'
): Promise<void> {
  const ctx = getSharedAudioContext();
  const targetMidi = freqToMidi(freq);
  const anchor = findClosestAnchor(targetMidi);

  const voiceBank: InstrumentType =
    techniqueId === 'subtone' || techniqueId === 'head-register'
      ? 'voice_oohs'
      : 'choir_aahs';

  const buffer = await loadAnchorBuffer(ctx, voiceBank, anchor.name);
  if (!buffer) return;

  const now = ctx.currentTime;
  const dur = Math.min(1.55, Math.max(0.95, buffer.duration));
  const rate = Math.pow(2, (targetMidi - anchor.midi) / 12);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rate;

  // Natural vocal vibrato fading in gently after attack
  const vibratoLfo = ctx.createOscillator();
  const vibratoDepth = ctx.createGain();
  vibratoLfo.frequency.value = techniqueId === 'belt' ? 5.6 : 5.1;
  vibratoDepth.gain.setValueAtTime(0, now);
  vibratoDepth.gain.linearRampToValueAtTime(
    techniqueId === 'subtone' ? 7 : 12,
    now + 0.35
  );
  vibratoLfo.connect(vibratoDepth).connect(source.detune);

  // Technique-specific formant & warmth EQ
  const formantFilter = ctx.createBiquadFilter();
  if (techniqueId === 'chest-support') {
    formantFilter.type = 'lowshelf';
    formantFilter.frequency.value = 260;
    formantFilter.gain.value = 5.5;
  } else if (techniqueId === 'belt') {
    formantFilter.type = 'peaking';
    formantFilter.frequency.value = 2500;
    formantFilter.Q.value = 1.3;
    formantFilter.gain.value = 5.5;
  } else if (techniqueId === 'subtone') {
    formantFilter.type = 'lowpass';
    formantFilter.frequency.value = 1650;
    formantFilter.Q.value = 0.7;
  } else if (techniqueId === 'head-register') {
    formantFilter.type = 'highshelf';
    formantFilter.frequency.value = 2400;
    formantFilter.gain.value = 3.2;
  } else {
    formantFilter.type = 'peaking';
    formantFilter.frequency.value = 1250;
    formantFilter.Q.value = 1.0;
    formantFilter.gain.value = 3.5;
  }

  const masterGain = ctx.createGain();
  const peak = techniqueId === 'subtone' ? 0.62 : 0.72;
  masterGain.gain.setValueAtTime(0.0001, now);
  masterGain.gain.linearRampToValueAtTime(peak, now + 0.085);
  masterGain.gain.setValueAtTime(peak, now + dur - 0.34);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  let tailNode: AudioNode = source;
  if (techniqueId === 'distortion') {
    const shaper = ctx.createWaveShaper();
    shaper.curve = makeSoftSaturatorCurve(2.2);
    shaper.oversample = '2x';
    source.connect(shaper);
    tailNode = shaper;

    // Subtle lower-octave false-fold warmth reinforcement
    const subSource = ctx.createBufferSource();
    subSource.buffer = buffer;
    subSource.playbackRate.value = rate * 0.5;
    const subBp = ctx.createBiquadFilter();
    subBp.type = 'bandpass';
    subBp.frequency.value = 480;
    subBp.Q.value = 1.4;
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(0.18, now + 0.14);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    subSource.connect(subBp).connect(subGain).connect(ctx.destination);
    subSource.start(now);
    subSource.stop(now + dur + 0.02);
  }

  tailNode.connect(formantFilter).connect(masterGain).connect(ctx.destination);

  // Gentle vocal breath air layer for Subtone
  if (techniqueId === 'subtone') {
    const breathLen = Math.floor(ctx.sampleRate * dur);
    const breathBuf = ctx.createBuffer(1, breathLen, ctx.sampleRate);
    const ch = breathBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < breathLen; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.04 * white) / 1.04;
      ch[i] = last * 1.8;
    }
    const breathSrc = ctx.createBufferSource();
    breathSrc.buffer = breathBuf;
    const breathBp = ctx.createBiquadFilter();
    breathBp.type = 'bandpass';
    breathBp.frequency.value = 1850;
    breathBp.Q.value = 1.1;
    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0.0001, now);
    breathGain.gain.linearRampToValueAtTime(0.032, now + 0.12);
    breathGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    breathSrc.connect(breathBp).connect(breathGain).connect(ctx.destination);
    breathSrc.start(now);
    breathSrc.stop(now + dur + 0.02);
  }

  vibratoLfo.start(now);
  source.start(now);
  vibratoLfo.stop(now + dur + 0.02);
  source.stop(now + dur + 0.02);
}
