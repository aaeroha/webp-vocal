import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  RotateCcw,
  Sparkles,
  Volume2,
  Waves,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  VOCAL_ATLAS_TECHNIQUES,
  type ResonatorZoneId,
  type VocalTechniqueInfo,
} from '../data/content';
import {
  playInstrumentSample,
  preloadInstrument,
} from '../utils/instrumentSampler';

// Order chips anatomically from top (cranial vault) down to chest/diaphragm
const ANATOMICAL_CHIP_ORDER: VocalTechniqueInfo['id'][] = [
  'head-register',
  'mix',
  'subtone',
  'distortion',
  'belt',
  'chest-support',
];

const ORDERED_TECHNIQUES: VocalTechniqueInfo[] = ANATOMICAL_CHIP_ORDER.map(
  (id) => VOCAL_ATLAS_TECHNIQUES.find((t) => t.id === id)
).filter((t): t is VocalTechniqueInfo => Boolean(t));

const PLAYABLE_INSTRUMENT_NOTE: Record<
  VocalTechniqueInfo['id'],
  { primary: 'strings' | 'piano'; secondary?: 'strings' | 'piano'; fifth?: number }
> = {
  'head-register': { primary: 'strings', secondary: 'piano' },
  mix: { primary: 'piano', secondary: 'strings' },
  subtone: { primary: 'strings' },
  distortion: { primary: 'piano', fifth: 1.4983 }, // clean musical power fifth
  belt: { primary: 'piano', secondary: 'strings' },
  'chest-support': { primary: 'strings', secondary: 'piano' },
};

function playPleasantTechniqueNote(tech: VocalTechniqueInfo): void {
  const cfg = PLAYABLE_INSTRUMENT_NOTE[tech.id] ?? { primary: 'piano' };
  const freq = tech.freqHz;

  playInstrumentSample(freq, cfg.primary, 1.45, 0.58);
  if (cfg.secondary) {
    window.setTimeout(() => {
      playInstrumentSample(freq, cfg.secondary!, 1.35, 0.28);
    }, 35);
  }
  if (cfg.fifth) {
    window.setTimeout(() => {
      playInstrumentSample(freq * cfg.fifth!, cfg.primary, 1.25, 0.34);
    }, 45);
  }
}

interface CrossSectionSlice {
  y: number;
  rx: number;
  zFront: number;
  zBack: number;
  nosePeak: number;
  browDip: number;
  mouthIndent: number;
  chinPeak: number;
  clavicleDip: number;
}

const BUST_SLICES: CrossSectionSlice[] = [
  { y: 1.34, rx: 0.04, zFront: 0.04, zBack: -0.04, nosePeak: 0, browDip: 0, mouthIndent: 0, chinPeak: 0, clavicleDip: 0 },
  { y: 1.26, rx: 0.36, zFront: 0.34, zBack: -0.36, nosePeak: 0, browDip: 0, mouthIndent: 0, chinPeak: 0, clavicleDip: 0 },
  { y: 1.12, rx: 0.50, zFront: 0.50, zBack: -0.52, nosePeak: 0, browDip: 0, mouthIndent: 0, chinPeak: 0, clavicleDip: 0 },
  { y: 0.90, rx: 0.55, zFront: 0.57, zBack: -0.56, nosePeak: 0, browDip: 0, mouthIndent: 0, chinPeak: 0, clavicleDip: 0 },
  { y: 0.72, rx: 0.54, zFront: 0.60, zBack: -0.54, nosePeak: 0.02, browDip: 0.03, mouthIndent: 0, chinPeak: 0, clavicleDip: 0 },
  // Orbital / brow ridge
  { y: 0.58, rx: 0.52, zFront: 0.59, zBack: -0.50, nosePeak: 0.07, browDip: 0.08, mouthIndent: 0, chinPeak: 0, clavicleDip: 0 },
  // Upper nose bridge + cheeks
  { y: 0.45, rx: 0.51, zFront: 0.58, zBack: -0.47, nosePeak: 0.16, browDip: 0.02, mouthIndent: 0, chinPeak: 0, clavicleDip: 0 },
  // Nose tip
  { y: 0.34, rx: 0.49, zFront: 0.57, zBack: -0.44, nosePeak: 0.22, browDip: 0, mouthIndent: 0, chinPeak: 0, clavicleDip: 0 },
  // Philtrum & upper lip
  { y: 0.23, rx: 0.46, zFront: 0.58, zBack: -0.41, nosePeak: 0.04, browDip: 0, mouthIndent: 0.02, chinPeak: 0, clavicleDip: 0 },
  // Lips crevice
  { y: 0.16, rx: 0.44, zFront: 0.56, zBack: -0.39, nosePeak: 0, browDip: 0, mouthIndent: 0.05, chinPeak: 0, clavicleDip: 0 },
  // Lower lip
  { y: 0.10, rx: 0.42, zFront: 0.57, zBack: -0.38, nosePeak: 0, browDip: 0, mouthIndent: 0.01, chinPeak: 0.03, clavicleDip: 0 },
  // Sculpted chin & jawline
  { y: 0.00, rx: 0.38, zFront: 0.55, zBack: -0.36, nosePeak: 0, browDip: 0, mouthIndent: 0, chinPeak: 0.08, clavicleDip: 0 },
  // Submental jaw taper into neck
  { y: -0.14, rx: 0.32, zFront: 0.32, zBack: -0.33, nosePeak: 0, browDip: 0, mouthIndent: 0, chinPeak: 0, clavicleDip: 0 },
  // Upper neck
  { y: -0.28, rx: 0.29, zFront: 0.28, zBack: -0.31, nosePeak: 0, browDip: 0, mouthIndent: 0, chinPeak: 0, clavicleDip: 0 },
  // Lower neck
  { y: -0.46, rx: 0.31, zFront: 0.29, zBack: -0.33, nosePeak: 0, browDip: 0, mouthIndent: 0, chinPeak: 0, clavicleDip: 0.04 },
  // Trapezius / clavicle transition
  { y: -0.64, rx: 0.68, zFront: 0.35, zBack: -0.37, nosePeak: 0, browDip: 0, mouthIndent: 0, chinPeak: 0, clavicleDip: 0.06 },
  // Shoulders & upper thorax
  { y: -0.84, rx: 0.98, zFront: 0.42, zBack: -0.42, nosePeak: 0, browDip: 0, mouthIndent: 0, chinPeak: 0, clavicleDip: 0.03 },
  // Mid chest
  { y: -1.18, rx: 1.04, zFront: 0.45, zBack: -0.44, nosePeak: 0, browDip: 0, mouthIndent: 0, chinPeak: 0, clavicleDip: 0 },
  // Lower ribcage taper
  { y: -1.52, rx: 0.98, zFront: 0.42, zBack: -0.42, nosePeak: 0, browDip: 0, mouthIndent: 0, chinPeak: 0, clavicleDip: 0 },
  // Diaphragmatic base
  { y: -1.74, rx: 0.92, zFront: 0.39, zBack: -0.39, nosePeak: 0, browDip: 0, mouthIndent: 0, chinPeak: 0, clavicleDip: 0 },
];

function computeBustVertex(slice: CrossSectionSlice, u: number): THREE.Vector3 {
  // u in [0, 1], theta = 0 faces +Z (front)
  const theta = u * Math.PI * 2;
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);

  const x = sinT * slice.rx;
  let z = cosT >= 0 ? cosT * slice.zFront : cosT * Math.abs(slice.zBack);

  if (cosT > 0.15) {
    // Nose bridge bulge tight around center
    const centerFactor = Math.exp(-Math.pow(sinT * 5.2, 2));
    z += slice.nosePeak * centerFactor;

    // Eye socket indentations at x offset +/- 0.36 * rx
    const eyeLeft = Math.exp(-Math.pow((sinT - 0.38) * 5.0, 2));
    const eyeRight = Math.exp(-Math.pow((sinT + 0.38) * 5.0, 2));
    z -= slice.browDip * (eyeLeft + eyeRight);

    // Subtle mouth & chin shaping
    const mouthCenter = Math.exp(-Math.pow(sinT * 4.2, 2));
    z -= slice.mouthIndent * mouthCenter;
    z += slice.chinPeak * Math.exp(-Math.pow(sinT * 3.8, 2));

    // Sternal notch / clavicle valley
    z -= slice.clavicleDip * Math.exp(-Math.pow(sinT * 3.2, 2));
  }

  return new THREE.Vector3(x, slice.y, z);
}

function buildSculptedBustGeometry(radialSegments = 56): {
  surface: THREE.BufferGeometry;
  profileCurvePoints: THREE.Vector3[];
} {
  const rows = BUST_SLICES.length;
  const cols = radialSegments + 1;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const profileCurvePoints: THREE.Vector3[] = [];

  for (let r = 0; r < rows; r++) {
    const slice = BUST_SLICES[r];
    profileCurvePoints.push(computeBustVertex(slice, 0));
    for (let c = 0; c < cols; c++) {
      const u = c / radialSegments;
      const v = computeBustVertex(slice, u);
      positions.push(v.x, v.y, v.z);
      uvs.push(u, r / (rows - 1));
    }
  }

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < radialSegments; c++) {
      const a = r * cols + c;
      const b = a + 1;
      const d = (r + 1) * cols + c;
      const e = d + 1;
      indices.push(a, d, b);
      indices.push(b, d, e);
    }
  }

  const surface = new THREE.BufferGeometry();
  surface.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  surface.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  surface.setIndex(indices);
  surface.computeVertexNormals();

  return { surface, profileCurvePoints };
}

function createSculptedLungGeometry(side: -1 | 1): THREE.BufferGeometry {
  const geom = new THREE.SphereGeometry(1, 28, 24);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    // vy in [-1, 1]; top = +1 (narrow lung apex), bottom = -1 (wide base on diaphragm)
    const apexTaper = 0.58 + (1 - vy) * 0.25;
    let x = vx * 0.30 * apexTaper;
    let y = vy * 0.39;
    let z = vz * 0.24 * (0.72 + (1 - vy) * 0.16);

    // Flatten medial surface facing trachea/heart
    const isMedial = (side === -1 && vx > 0) || (side === 1 && vx < 0);
    if (isMedial) {
      x *= 0.56;
    }

    // Concave base resting gently over diaphragm dome
    if (vy < -0.55) {
      y += Math.pow((-vy - 0.55) / 0.45, 1.4) * 0.085;
    }

    // Slight gentle posterior-inferior sweep
    z -= vy * 0.03;

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

function createDiaphragmDomeGeometry(): THREE.BufferGeometry {
  // Arched twin-cupola diaphragmatic muscle sheet directly beneath left & right lungs
  const widthSegs = 40;
  const depthSegs = 20;
  const geom = new THREE.PlaneGeometry(1.52, 0.72, widthSegs, depthSegs);
  geom.rotateX(-Math.PI / 2);

  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const nx = x / 0.76; // -1..1
    const nz = z / 0.36; // -1..1

    // Double cupola dome (slightly higher right cupola & lower central tendon dip)
    const edgeDrop = Math.pow(nx * nx * 0.72 + nz * nz * 0.85, 1.2) * 0.22;
    const cupolaLift = Math.exp(-Math.pow((Math.abs(nx) - 0.45) * 2.6, 2)) * 0.085;
    const y = cupolaLift - edgeDrop;

    pos.setY(i, y);
  }

  geom.computeVertexNormals();
  return geom;
}

export default function VocalAtlas3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const calloutRef = useRef<HTMLDivElement | null>(null);

  const [selectedId, setSelectedId] = useState<VocalTechniqueInfo['id']>('mix');
  const [hoveredId, setHoveredId] = useState<VocalTechniqueInfo['id'] | null>(null);
  const [playingId, setPlayingId] = useState<VocalTechniqueInfo['id'] | null>(null);
  const [verticalPan, setVerticalPan] = useState<number>(0); // -0.9..0.9
  const [calloutCoords, setCalloutCoords] = useState<{
    ax: number;
    ay: number;
    cx: number;
    cy: number;
    visible: boolean;
  }>({ ax: 240, ay: 220, cx: 480, cy: 220, visible: true });

  const activeTech = useMemo(() => {
    const id = hoveredId || selectedId;
    return VOCAL_ATLAS_TECHNIQUES.find((t) => t.id === id) || VOCAL_ATLAS_TECHNIQUES[0];
  }, [hoveredId, selectedId]);

  const activeTechRef = useRef(activeTech);
  activeTechRef.current = activeTech;

  const panOffsetRef = useRef(0);
  panOffsetRef.current = verticalPan;

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const soundTimerRef = useRef<number | null>(null);

  // Gently preload SoundFont instruments so demo notes sound instant & warm
  useEffect(() => {
    const timer = window.setTimeout(() => {
      preloadInstrument('piano');
      preloadInstrument('strings');
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  const triggerTechniquePlay = (tech: VocalTechniqueInfo) => {
    setSelectedId(tech.id);
    setPlayingId(tech.id);
    if (soundTimerRef.current) window.clearTimeout(soundTimerRef.current);
    playPleasantTechniqueNote(tech);
    soundTimerRef.current = window.setTimeout(() => {
      setPlayingId(null);
    }, 1350);
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvasHost = canvasHostRef.current;
    if (!container || !canvasHost) return;

    const width = canvasHost.clientWidth || 640;
    const height = canvasHost.clientHeight || 520;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 40);
    camera.position.set(1.05, 0.14, 5.55);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    canvasHost.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 2.9;
    controls.maxDistance = 8.4;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.78;
    controls.target.set(0, -0.08, 0);
    controlsRef.current = controls;

    // Studio three-point rim lighting
    scene.add(new THREE.AmbientLight(0xdce6f5, 0.72));

    const keyLight = new THREE.DirectionalLight(0xfff1d6, 1.45);
    keyLight.position.set(2.8, 3.6, 4.2);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7c8cff, 1.05);
    rimLight.position.set(-3.4, 1.4, -2.5);
    scene.add(rimLight);

    const warmUnderLight = new THREE.PointLight(0xe2a856, 0.9, 9);
    warmUnderLight.position.set(0, -1.8, 2.2);
    scene.add(warmUnderLight);

    const atlasGroup = new THREE.Group();
    scene.add(atlasGroup);

    const zoneMaterials: Record<ResonatorZoneId, THREE.MeshStandardMaterial[]> = {
      chest: [],
      larynx: [],
      'false-folds': [],
      palate: [],
      mask: [],
      head: [],
    };

    const zoneMeshes: Record<ResonatorZoneId, THREE.Object3D[]> = {
      chest: [],
      larynx: [],
      'false-folds': [],
      palate: [],
      mask: [],
      head: [],
    };

    const makeZoneMat = (
      zone: ResonatorZoneId,
      baseHex: number,
      opacity = 0.76
    ) => {
      const mat = new THREE.MeshStandardMaterial({
        color: baseHex,
        emissive: baseHex,
        emissiveIntensity: 0.14,
        roughness: 0.34,
        metalness: 0.12,
        transparent: true,
        opacity,
      });
      zoneMaterials[zone].push(mat);
      return mat;
    };

    // ------------------------------------------------------------------
    // 1. OUTER SCULPTED HUMAN PROFILE SHELL (Head + Face + Neck + Thorax)
    // ------------------------------------------------------------------
    const { surface: bustGeom, profileCurvePoints } = buildSculptedBustGeometry(56);

    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0xb6c7e2,
      roughness: 0.25,
      metalness: 0.04,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
      clearcoat: 0.45,
      clearcoatRoughness: 0.25,
    });
    const shellMesh = new THREE.Mesh(bustGeom, shellMat);
    atlasGroup.add(shellMesh);

    // Subtle anatomical gold wireframe sagittal profile + cheek contours
    const frontProfileGeom = new THREE.BufferGeometry().setFromPoints(profileCurvePoints);
    const frontProfileLine = new THREE.Line(
      frontProfileGeom,
      new THREE.LineBasicMaterial({ color: 0xe2a856, transparent: true, opacity: 0.68 })
    );
    atlasGroup.add(frontProfileLine);

    // Back spine line + left/right silhouette cheek/shoulder meridians
    const backCurvePts = BUST_SLICES.map((s) => computeBustVertex(s, 0.5));
    const leftSidePts = BUST_SLICES.map((s) => computeBustVertex(s, 0.25));
    const rightSidePts = BUST_SLICES.map((s) => computeBustVertex(s, 0.75));
    const faintGoldMat = new THREE.LineBasicMaterial({
      color: 0xe2a856,
      transparent: true,
      opacity: 0.24,
    });
    atlasGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(backCurvePts), faintGoldMat));
    atlasGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(leftSidePts), faintGoldMat));
    atlasGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(rightSidePts), faintGoldMat));

    // Delicate orbital brow-jawline ring contours on face so face features read crisp in 3D
    const jawPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 32; i++) {
      const a = -0.34 + (i / 32) * 0.68;
      jawPoints.push(
        new THREE.Vector3(
          Math.sin(a * Math.PI) * 0.39,
          0.01 + Math.abs(a) * 0.14,
          Math.cos(a * Math.PI) * 0.57
        )
      );
    }
    atlasGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(jawPoints),
        new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.28 })
      )
    );

    // Holographic scan ring at chest base
    const baseRingMat = new THREE.MeshBasicMaterial({
      color: 0xe2a856,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    });
    const baseRing = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.01, 64), baseRingMat);
    baseRing.rotation.x = -Math.PI / 2;
    baseRing.position.y = -1.75;
    atlasGroup.add(baseRing);

    // ------------------------------------------------------------------
    // 2. RESPIRATORY SYSTEM: TRACHEA + Y-BRONCHI + LUNGS + RIBS + DIAPHRAGM
    // ------------------------------------------------------------------
    const chestGroup = new THREE.Group();

    // Central trachea airway column
    const tracheaMat = makeZoneMat('chest', 0x10b981, 0.42);
    const tracheaCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.105, 0.54, 24),
      tracheaMat
    );
    tracheaCore.position.set(0, -0.62, 0.04);
    chestGroup.add(tracheaCore);

    // 10 crisp cartilaginous tracheal C-rings
    const ringMat = makeZoneMat('chest', 0x34d399, 0.72);
    for (let i = 0; i < 10; i++) {
      const tRing = new THREE.Mesh(new THREE.TorusGeometry(0.112, 0.013, 10, 28), ringMat);
      tRing.rotation.x = Math.PI / 2;
      tRing.position.set(0, -0.40 - i * 0.052, 0.04);
      chestGroup.add(tRing);
    }

    // Carina Y-Bifurcation (left & right mainstem bronchi entering lung hila)
    const leftBronchusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.87, 0.04),
      new THREE.Vector3(-0.14, -0.97, 0.02),
      new THREE.Vector3(-0.34, -1.06, 0.01),
    ]);
    const rightBronchusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.87, 0.04),
      new THREE.Vector3(0.14, -0.97, 0.02),
      new THREE.Vector3(0.34, -1.06, 0.01),
    ]);
    const leftBronchus = new THREE.Mesh(
      new THREE.TubeGeometry(leftBronchusCurve, 16, 0.052, 14, false),
      tracheaMat
    );
    const rightBronchus = new THREE.Mesh(
      new THREE.TubeGeometry(rightBronchusCurve, 16, 0.052, 14, false),
      tracheaMat
    );
    chestGroup.add(leftBronchus, rightBronchus);

    // Separated anatomical Left & Right Lungs with subtle pleural glow
    const lungMat = makeZoneMat('chest', 0x10b981, 0.48);
    const lungWireMat = new THREE.MeshBasicMaterial({
      color: 0x6ee7b7,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });

    const leftLungGeom = createSculptedLungGeometry(-1);
    const leftLung = new THREE.Mesh(leftLungGeom, lungMat);
    leftLung.position.set(-0.42, -1.16, 0.03);
    leftLung.rotation.z = 0.08;
    const leftLungWire = new THREE.Mesh(leftLungGeom, lungWireMat);
    leftLung.add(leftLungWire);

    const rightLungGeom = createSculptedLungGeometry(1);
    const rightLung = new THREE.Mesh(rightLungGeom, lungMat);
    rightLung.position.set(0.42, -1.16, 0.03);
    rightLung.rotation.z = -0.08;
    const rightLungWire = new THREE.Mesh(rightLungGeom, lungWireMat);
    rightLung.add(rightLungWire);

    chestGroup.add(leftLung, rightLung);

    // Sternum central chest resonance bridge (aligns directly with chest anchor at y=-1.18, z=+0.34)
    const sternumCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.78, 0.31),
      new THREE.Vector3(0, -1.10, 0.35),
      new THREE.Vector3(0, -1.42, 0.31),
    ]);
    const sternum = new THREE.Mesh(
      new THREE.TubeGeometry(sternumCurve, 20, 0.035, 12, false),
      makeZoneMat('chest', 0x34d399, 0.62)
    );
    chestGroup.add(sternum);

    // Delicate anatomical rib arcs wrapping lungs symmetrically
    const ribMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.2,
    });
    for (let r = 0; r < 5; r++) {
      const ry = -0.84 - r * 0.145;
      const spreadX = 0.64 + Math.sin((r / 4) * Math.PI) * 0.24;
      const depthZ = 0.26 + Math.sin((r / 4) * Math.PI) * 0.09;
      for (const side of [-1, 1] as const) {
        const ribCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 0.10, ry + 0.04, -depthZ),
          new THREE.Vector3(side * spreadX, ry - 0.01, -0.02),
          new THREE.Vector3(side * (spreadX * 0.72), ry - 0.04, depthZ),
          new THREE.Vector3(side * 0.06, ry - 0.05, depthZ + 0.05),
        ]);
        chestGroup.add(
          new THREE.Mesh(new THREE.TubeGeometry(ribCurve, 18, 0.01, 6, false), ribMat)
        );
      }
    }

    // Wide Muscular Diaphragm Dome positioned anatomically BENEATH both lungs
    const diaphragmGeom = createDiaphragmDomeGeometry();
    const diaphragmMat = makeZoneMat('chest', 0x059669, 0.68);
    const diaphragm = new THREE.Mesh(diaphragmGeom, diaphragmMat);
    diaphragm.position.set(0, -1.53, 0.02);
    chestGroup.add(diaphragm);

    atlasGroup.add(chestGroup);
    zoneMeshes.chest.push(chestGroup);

    // ------------------------------------------------------------------
    // 3. LARYNX (Thyroid & Cricoid Cartilages + True Vocal Folds)
    // ------------------------------------------------------------------
    const larynxGroup = new THREE.Group();

    const cricoid = new THREE.Mesh(
      new THREE.TorusGeometry(0.135, 0.026, 12, 32),
      makeZoneMat('larynx', 0xfbbf24, 0.8)
    );
    cricoid.rotation.x = Math.PI / 2;
    cricoid.position.set(0, -0.35, 0.05);
    larynxGroup.add(cricoid);

    // Thyroid cartilage shield + anterior laryngeal prominence facing +Z
    const thyroid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.155, 0.145, 0.16, 6, 1, false),
      makeZoneMat('larynx', 0xf59e0b, 0.74)
    );
    thyroid.scale.set(0.92, 1.0, 1.18);
    thyroid.position.set(0, -0.27, 0.12);
    larynxGroup.add(thyroid);

    // Pair of glottic true vocal folds inside larynx
    const trueFoldMat = makeZoneMat('larynx', 0xfde68a, 0.92);
    const leftFold = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.018, 0.17), trueFoldMat);
    leftFold.position.set(-0.028, -0.26, 0.08);
    leftFold.rotation.y = -0.18;
    const rightFold = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.018, 0.17), trueFoldMat);
    rightFold.position.set(0.028, -0.26, 0.08);
    rightFold.rotation.y = 0.18;
    larynxGroup.add(leftFold, rightFold);

    atlasGroup.add(larynxGroup);
    zoneMeshes.larynx.push(larynxGroup);

    // ------------------------------------------------------------------
    // 4. FALSE (VENTRICULAR) FOLDS & EPIGLOTTIS (Distortion / Grit)
    // ------------------------------------------------------------------
    const falseGroup = new THREE.Group();
    const falseMat = makeZoneMat('false-folds', 0xf43f5e, 0.85);

    const leftFalse = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.024, 0.16), falseMat);
    leftFalse.position.set(-0.046, -0.19, 0.11);
    const rightFalse = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.024, 0.16), falseMat);
    rightFalse.position.set(0.046, -0.19, 0.11);

    // Leaf-shaped epiglottis curving behind tongue base
    const epiglottis = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.046, 0.11, 8, 16),
      falseMat
    );
    epiglottis.scale.set(1.2, 1.0, 0.34);
    epiglottis.position.set(0, -0.12, 0.19);
    epiglottis.rotation.x = 0.42;

    falseGroup.add(leftFalse, rightFalse, epiglottis);
    atlasGroup.add(falseGroup);
    zoneMeshes['false-folds'].push(falseGroup);

    // ------------------------------------------------------------------
    // 5. PHARYNX, ORAL CAVITY & SOFT PALATE VAULT (Subtone / Mix)
    // ------------------------------------------------------------------
    const palateGroup = new THREE.Group();
    const pharynxCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.14, 0.06),
      new THREE.Vector3(0, 0.06, -0.02),
      new THREE.Vector3(0, 0.22, 0.14),
      new THREE.Vector3(0, 0.24, 0.39),
    ]);
    const pharynxTube = new THREE.Mesh(
      new THREE.TubeGeometry(pharynxCurve, 28, 0.125, 22, false),
      makeZoneMat('palate', 0x38bdf8, 0.56)
    );
    palateGroup.add(pharynxTube);

    // Domed hard/soft palate arch & uvula accent
    const palateDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      makeZoneMat('palate', 0x38bdf8, 0.78)
    );
    palateDome.scale.set(0.88, 0.65, 1.32);
    palateDome.position.set(0, 0.20, 0.25);
    palateGroup.add(palateDome);

    atlasGroup.add(palateGroup);
    zoneMeshes.palate.push(palateGroup);

    // ------------------------------------------------------------------
    // 6. RESONANT MASK (Nasal Cavity, Turbinates & Maxillary/Frontal Sinuses)
    // ------------------------------------------------------------------
    const maskGroup = new THREE.Group();
    const maskMat = makeZoneMat('mask', 0xe2a856, 0.78);

    // Nasal cavity bridge chamber behind nose tip
    const nasalChamber = new THREE.Mesh(new THREE.SphereGeometry(0.115, 22, 18), maskMat);
    nasalChamber.scale.set(0.82, 0.92, 1.48);
    nasalChamber.position.set(0, 0.42, 0.39);

    // Bilateral maxillary sinus cheeks
    const leftCheekSinus = new THREE.Mesh(new THREE.SphereGeometry(0.082, 18, 16), maskMat);
    leftCheekSinus.scale.set(0.9, 0.85, 1.15);
    leftCheekSinus.position.set(-0.15, 0.36, 0.35);

    const rightCheekSinus = new THREE.Mesh(new THREE.SphereGeometry(0.082, 18, 16), maskMat);
    rightCheekSinus.scale.set(0.9, 0.85, 1.15);
    rightCheekSinus.position.set(0.15, 0.36, 0.35);

    // Frontal sinus pocket behind brow ridge
    const frontalSinus = new THREE.Mesh(new THREE.SphereGeometry(0.10, 20, 16), maskMat);
    frontalSinus.scale.set(1.38, 0.62, 0.68);
    frontalSinus.position.set(0, 0.61, 0.44);

    maskGroup.add(nasalChamber, leftCheekSinus, rightCheekSinus, frontalSinus);
    atlasGroup.add(maskGroup);
    zoneMeshes.mask.push(maskGroup);

    // ------------------------------------------------------------------
    // 7. CRANIAL RESONANCE DOME (Head Register)
    // ------------------------------------------------------------------
    const headGroup = new THREE.Group();
    const headDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 32, 24),
      makeZoneMat('head', 0xa78bfa, 0.56)
    );
    headDome.scale.set(0.96, 0.82, 1.10);
    headDome.position.set(0, 0.89, 0.04);

    const headHalo = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.014, 12, 48),
      makeZoneMat('head', 0xc4b5fd, 0.68)
    );
    headHalo.rotation.x = Math.PI / 2 - 0.14;
    headHalo.position.set(0, 0.96, 0.04);

    headGroup.add(headDome, headHalo);
    atlasGroup.add(headGroup);
    zoneMeshes.head.push(headGroup);

    // ------------------------------------------------------------------
    // 8. ACOUSTIC VIBRATION PARTICLE MIST
    // ------------------------------------------------------------------
    const particleCount = 46;
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 0.46;
      particlePos[i * 3 + 1] = -0.3 + Math.random() * 1.1;
      particlePos[i * 3 + 2] = 0.05 + (Math.random() - 0.5) * 0.35;
    }
    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xe2a856,
      size: 0.03,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    atlasGroup.add(particles);

    // Subtle anchor marker sphere in 3D space (projects to SVG dotted callout)
    const anchorDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.036, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xe2a856 })
    );
    atlasGroup.add(anchorDot);

    // ------------------------------------------------------------------
    // ANIMATION, SMOOTH RESPONSIVE CENTERING & CALLOUT PROJECTION
    // ------------------------------------------------------------------
    let rafId = 0;
    const clock = new THREE.Clock();
    const anchorVec = new THREE.Vector3();
    const tempTargetAnchor = new THREE.Vector3();
    let frameTick = 0;

    const handleResize = () => {
      if (!canvasHost) return;
      const w = canvasHost.clientWidth || 640;
      const h = canvasHost.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(canvasHost);

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const current = activeTechRef.current;
      const hostWidth = canvasHost.clientWidth || 640;
      const hostHeight = canvasHost.clientHeight || 520;
      const isDesktopOverlay = hostWidth >= 768;

      // Center bust nicely inside the unobstructed middle window between left chips & right card on desktop
      const targetModelX = isDesktopOverlay ? -0.18 : 0.0;
      atlasGroup.position.x = THREE.MathUtils.lerp(atlasGroup.position.x, targetModelX, 0.1);
      atlasGroup.position.y = THREE.MathUtils.lerp(
        atlasGroup.position.y,
        panOffsetRef.current,
        0.14
      );
      controls.target.set(isDesktopOverlay ? 0.06 : 0, -0.06 + panOffsetRef.current * 0.25, 0);

      // Gentle ambient 3/4 turn
      atlasGroup.rotation.y = Math.sin(t * 0.32) * 0.14 + 0.16;

      // Highlight active anatomical organs + soft diaphragmatic breath
      const activeSet = new Set<ResonatorZoneId>(current.activeZones);
      (Object.keys(zoneMaterials) as ResonatorZoneId[]).forEach((zKey) => {
        const isActive = activeSet.has(zKey);
        const pulse = isActive ? 0.42 + Math.sin(t * 4.4) * 0.22 : 0.05;
        const targetOp = isActive ? 0.88 : 0.22;

        zoneMaterials[zKey].forEach((m) => {
          m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, pulse, 0.12);
          m.opacity = THREE.MathUtils.lerp(m.opacity, targetOp, 0.12);
        });

        const baseScale = zKey === 'chest'
          ? isActive
            ? 1.015 + Math.sin(t * 2.1) * 0.025
            : 1.0 + Math.sin(t * 1.4) * 0.01
          : isActive
          ? 1.02 + Math.sin(t * 5.0) * 0.014
          : 1.0;

        zoneMeshes[zKey].forEach((obj) => {
          obj.scale.lerp(new THREE.Vector3(baseScale, baseScale, baseScale), 0.12);
        });
      });

      // Update anchor dot smoothly toward the technique's anatomical organ
      const [ax, ay, az] = current.anchor3D;
      tempTargetAnchor.set(ax, ay, az);
      anchorDot.position.lerp(tempTargetAnchor, 0.18);
      (anchorDot.material as THREE.MeshBasicMaterial).color.set(current.accentColor);
      baseRingMat.color.set(current.accentColor);

      // Animated particle flow rising toward active anchor
      particleMat.color.set(current.accentColor);
      const pAttr = particleGeom.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let py = pAttr.getY(i) + 0.0042;
        if (py > ay + 0.55) py = Math.max(-1.45, ay - 0.55);
        pAttr.setY(i, py);
      }
      pAttr.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);

      // Project anchor point & align dotted line directly with inside-right callout card border (~30fps)
      frameTick++;
      if (frameTick % 2 === 0 && isDesktopOverlay && calloutRef.current) {
        anchorDot.getWorldPosition(anchorVec);
        anchorVec.project(camera);

        const sx = (anchorVec.x * 0.5 + 0.5) * hostWidth;
        const sy = (-anchorVec.y * 0.5 + 0.5) * hostHeight;
        const hostRect = canvasHost.getBoundingClientRect();
        const cardRect = calloutRef.current.getBoundingClientRect();

        const cx = cardRect.left - hostRect.left;
        const cy = cardRect.top - hostRect.top + cardRect.height * 0.5;
        const visible =
          anchorVec.z < 1 && sx > 15 && sx < hostWidth - 15 && sy > 15 && sy < hostHeight - 15;

        setCalloutCoords((prev) => {
          if (
            Math.abs(prev.ax - sx) < 0.8 &&
            Math.abs(prev.ay - sy) < 0.8 &&
            Math.abs(prev.cx - cx) < 0.8 &&
            Math.abs(prev.cy - cy) < 0.8 &&
            prev.visible === visible
          ) {
            return prev;
          }
          return { ax: sx, ay: sy, cx, cy, visible };
        });
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === canvasHost) {
        canvasHost.removeChild(renderer.domElement);
      }
      if (soundTimerRef.current) window.clearTimeout(soundTimerRef.current);
    };
  }, []);

  const handleZoom = (factor: number) => {
    const controls = controlsRef.current;
    const cam = cameraRef.current;
    if (!controls || !cam) return;
    const offset = cam.position.clone().sub(controls.target);
    const nextDist = THREE.MathUtils.clamp(offset.length() * factor, 2.9, 8.4);
    offset.setLength(nextDist);
    cam.position.copy(controls.target).add(offset);
    controls.update();
  };

  const handleResetView = () => {
    const controls = controlsRef.current;
    const cam = cameraRef.current;
    setVerticalPan(0);
    if (!controls || !cam) return;
    cam.position.set(1.05, 0.14, 5.55);
    controls.target.set(0, -0.06, 0);
    controls.update();
  };

  // Percentage for tall vertical pan thumb (0% top when pan=+0.9, 100% bottom when pan=-0.9)
  const thumbTopPercent = ((0.9 - verticalPan) / 1.8) * 100;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-[26px] border border-zinc-200/80 bg-[#0b0d17] shadow-2xl dark:border-white/10"
    >
      {/* Subtle diagnostic scan background aura */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60 transition-colors duration-700"
        style={{
          background: `radial-gradient(ellipse 68% 62% at 44% 48%, ${activeTech.accentColor}1d, transparent 70%), radial-gradient(circle at 80% 20%, rgba(56,189,248,0.08), transparent 48%)`,
        }}
      />

      {/* Full-width 3D Viewport housing overlaid desktop UI inside the 3D scene */}
      <div
        ref={canvasHostRef}
        className="relative h-[360px] w-full cursor-grab active:cursor-grabbing sm:h-[430px] md:h-[580px] lg:h-[620px]"
      >
        {/* Top-left subtle diagnostic pill inside frame */}
        <div className="pointer-events-none absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/35 px-3 py-1.5 text-[11px] font-medium text-zinc-200 backdrop-blur-md">
          <span
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: activeTech.accentColor }}
          />
          <span>3D-скан · Вращайте и приближайте</span>
        </div>

        {/* DESKTOP LEFT OVERLAY: Colored technique chips running TOP-TO-BOTTOM */}
        <div
          className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 md:flex lg:left-6"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {ORDERED_TECHNIQUES.map((tech) => {
            const isSelected = activeTech.id === tech.id;
            const isPlaying = playingId === tech.id;
            return (
              <button
                key={tech.id}
                type="button"
                onMouseEnter={() => setHoveredId(tech.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => triggerTechniquePlay(tech)}
                className={`group flex items-center gap-2.5 rounded-full border px-3.5 py-2 text-left text-xs font-medium transition-all duration-200 backdrop-blur-md ${
                  isSelected
                    ? 'scale-[1.03] bg-[#141726]/92 text-white shadow-lg'
                    : 'border-white/12 bg-[#0d101d]/70 text-zinc-300 hover:border-white/25 hover:bg-[#141726]/85 hover:text-white'
                }`}
                style={
                  isSelected
                    ? {
                        borderColor: tech.accentColor,
                        boxShadow: `0 0 22px ${tech.accentColor}38`,
                      }
                    : undefined
                }
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full transition-transform ${
                    isPlaying ? 'scale-125 animate-ping' : ''
                  }`}
                  style={{
                    backgroundColor: tech.accentColor,
                    boxShadow: `0 0 8px ${tech.accentColor}`,
                  }}
                />
                <span className="whitespace-nowrap">{tech.chipLabel}</span>
              </button>
            );
          })}
        </div>

        {/* DESKTOP LIVE DOTTED SVG LEADER LINE from 3D organ to inside floating callout card */}
        <svg
          className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full md:block"
          aria-hidden="true"
        >
          {calloutCoords.visible && (
            <g>
              <circle
                cx={calloutCoords.ax}
                cy={calloutCoords.ay}
                r="8.5"
                fill={activeTech.accentColor}
                fillOpacity="0.22"
              />
              <circle
                cx={calloutCoords.ax}
                cy={calloutCoords.ay}
                r="4"
                fill={activeTech.accentColor}
              />
              <polyline
                points={`${calloutCoords.ax},${calloutCoords.ay} ${(
                  calloutCoords.ax +
                  (calloutCoords.cx - calloutCoords.ax) * 0.42
                ).toFixed(1)},${calloutCoords.cy} ${calloutCoords.cx},${calloutCoords.cy}`}
                fill="none"
                stroke={activeTech.accentColor}
                strokeWidth="1.75"
                strokeDasharray="5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.92"
              />
              <circle
                cx={calloutCoords.cx}
                cy={calloutCoords.cy}
                r="4.5"
                fill={activeTech.accentColor}
              />
            </g>
          )}
        </svg>

        {/* DESKTOP RIGHT-INSIDE OVERLAY: Floating glass callout menu card */}
        <div
          ref={calloutRef}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute right-12 top-1/2 z-20 hidden w-[295px] -translate-y-1/2 rounded-2xl border bg-[#0e101c]/90 p-5 text-white shadow-2xl backdrop-blur-md transition-colors duration-300 md:block lg:right-16 lg:w-[345px]"
          style={{
            borderColor: `${activeTech.accentColor}66`,
            boxShadow: `0 16px 42px rgba(0,0,0,0.52), 0 0 28px ${activeTech.accentColor}1c`,
          }}
        >
          <TechniqueCardContent
            tech={activeTech}
            isPlaying={playingId === activeTech.id}
            onPlay={() => triggerTechniquePlay(activeTech)}
          />
        </div>

        {/* FAR-RIGHT TRANSPARENT VERTICAL PAN SLIDER + ZOOM LOUPE CONTROLS AT BOTTOM (NO dark box/padding) */}
        <div
          className="absolute right-2.5 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3 sm:right-4"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Tall slim vertical pan track */}
          <div
            role="slider"
            tabIndex={0}
            aria-label="Переместить 3D-модель выше или ниже"
            aria-valuemin={-0.9}
            aria-valuemax={0.9}
            aria-valuenow={verticalPan}
            title="Переместить модель вверх / вниз"
            className="relative flex h-44 w-6 cursor-ns-resize touch-none items-center justify-center sm:h-56"
            onPointerDown={(e) => {
              const el = e.currentTarget;
              el.setPointerCapture(e.pointerId);
              const rect = el.getBoundingClientRect();
              const ratio = THREE.MathUtils.clamp((e.clientY - rect.top) / rect.height, 0, 1);
              setVerticalPan(Number((0.9 - ratio * 1.8).toFixed(2)));
            }}
            onPointerMove={(e) => {
              if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = THREE.MathUtils.clamp((e.clientY - rect.top) / rect.height, 0, 1);
              setVerticalPan(Number((0.9 - ratio * 1.8).toFixed(2)));
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setVerticalPan((p) => Number(THREE.MathUtils.clamp(p + 0.1, -0.9, 0.9).toFixed(2)));
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setVerticalPan((p) => Number(THREE.MathUtils.clamp(p - 0.1, -0.9, 0.9).toFixed(2)));
              }
            }}
          >
            <div className="pointer-events-none h-full w-[3px] rounded-full bg-white/25" />
            <div
              className="pointer-events-none absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0b0d17] shadow-md transition-colors"
              style={{
                top: `${thumbTopPercent}%`,
                backgroundColor: activeTech.accentColor,
                boxShadow: `0 0 12px ${activeTech.accentColor}`,
              }}
            />
          </div>

          {/* Magnifying glass +/- & reset buttons placed below the tall slider */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleZoom(0.84)}
              aria-label="Приблизить"
              title="Приблизить"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/85 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/15 hover:text-white"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(1.18)}
              aria-label="Отдалить"
              title="Отдалить"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/85 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/15 hover:text-white"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              aria-label="Сбросить ракурс"
              title="Сбросить ракурс"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/75 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/15 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE CLEAN UNOBSTRUCTED STACK (< md): 3D viewport stays clean above, then colored pills + description card */}
      <div className="border-t border-white/10 bg-[#0d101b]/95 px-3.5 py-4 md:hidden">
        <div className="mb-3.5 grid grid-cols-2 gap-1.5">
          {ORDERED_TECHNIQUES.map((tech) => {
            const isSelected = activeTech.id === tech.id;
            const isPlaying = playingId === tech.id;
            return (
              <button
                key={tech.id}
                type="button"
                onClick={() => triggerTechniquePlay(tech)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-left text-[11.5px] font-medium transition-all ${
                  isSelected
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'border-white/10 bg-white/[0.03] text-zinc-300'
                }`}
                style={
                  isSelected
                    ? {
                        borderColor: tech.accentColor,
                        boxShadow: `0 0 14px ${tech.accentColor}33`,
                      }
                    : undefined
                }
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${isPlaying ? 'animate-ping' : ''}`}
                  style={{ backgroundColor: tech.accentColor }}
                />
                <span className="truncate">{tech.chipLabel}</span>
              </button>
            );
          })}
        </div>

        <div
          className="rounded-2xl border bg-[#0f1320]/90 p-4 text-white"
          style={{ borderColor: `${activeTech.accentColor}55` }}
        >
          <TechniqueCardContent
            tech={activeTech}
            isPlaying={playingId === activeTech.id}
            onPlay={() => triggerTechniquePlay(activeTech)}
          />
        </div>
      </div>
    </div>
  );
}

function TechniqueCardContent({
  tech,
  isPlaying,
  onPlay,
}: {
  tech: VocalTechniqueInfo;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-2.5">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            backgroundColor: `${tech.accentColor}22`,
            color: tech.accentColor,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: tech.accentColor }}
          />
          {tech.badge}
        </span>

        <button
          type="button"
          onClick={onPlay}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition hover:brightness-110 active:scale-95"
          style={{
            borderColor: `${tech.accentColor}75`,
            backgroundColor: isPlaying ? `${tech.accentColor}2f` : 'rgba(255,255,255,0.04)',
            color: tech.accentColor,
          }}
        >
          {isPlaying ? (
            <>
              <Waves className="h-3.5 w-3.5 animate-pulse" />
              <span>Звучит</span>
            </>
          ) : (
            <>
              <Volume2 className="h-3.5 w-3.5" />
              <span>Нота</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-2.5 border-b border-white/10 pb-2.5">
        <h3 className="font-serif text-xl font-semibold leading-snug text-[#F5F3EF] lg:text-2xl">
          {tech.title}
        </h3>
        <p className="mt-0.5 text-xs text-zinc-400">
          {tech.subtitle} · {tech.noteLabel}
        </p>
      </div>

      <div className="mt-3 space-y-2.5 text-[12.5px] leading-relaxed text-zinc-200 lg:text-[13px]">
        <div>
          <p className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#E2A856]">
            <Sparkles className="h-3 w-3" />
            Вокальная механика
          </p>
          <p className="text-zinc-200/95">{tech.physiology}</p>
        </div>

        <div>
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-400">
            Ощущения в теле
          </p>
          <p className="text-zinc-300">{tech.sensation}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11.5px] text-zinc-300">
          <span className="font-semibold text-white">Где применяется: </span>
          {tech.usage}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tech.zoneNames.map((name) => (
          <span
            key={name}
            className="rounded-full border px-2 py-0.5 text-[10.5px] font-medium"
            style={{
              borderColor: `${tech.accentColor}4d`,
              backgroundColor: `${tech.accentColor}12`,
              color: tech.accentColor,
            }}
          >
            {name}
          </span>
        ))}
      </div>
    </>
  );
}
