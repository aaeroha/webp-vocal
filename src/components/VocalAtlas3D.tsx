import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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
  playVocalTechniqueVoice,
  preloadInstrument,
} from '../utils/instrumentSampler';

// Order chips anatomically from cranial vault down to chest/diaphragm
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

function createHolographicGlassMaterial(
  initialAccentHex: string,
  fadeMode: 'head' | 'thorax'
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uAccentColor: { value: new THREE.Color(initialAccentHex) },
    },
    vertexShader: `
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      varying vec3 vLocalPos;
      void main() {
        vLocalPos = position;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        vNormalView = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader:
      fadeMode === 'head'
        ? `
          uniform vec3 uAccentColor;
          varying vec3 vNormalView;
          varying vec3 vViewPos;
          varying vec3 vLocalPos;
          void main() {
            vec3 viewDir = normalize(vViewPos);
            float ndotv = abs(dot(normalize(vNormalView), viewDir));
            float fresnel = pow(1.0 - ndotv, 2.05);
            // Smoothly fade lower shoulder edge of LeePerrySmith into the thoracic ribcage envelope
            float bottomFade = smoothstep(-3.96, -2.55, vLocalPos.y);
            vec3 baseColor = vec3(0.48, 0.60, 0.78);
            vec3 rimColor = mix(vec3(0.76, 0.85, 0.98), uAccentColor, 0.28);
            vec3 col = mix(baseColor, rimColor, fresnel);
            float alpha = (0.055 + fresnel * 0.56) * bottomFade;
            gl_FragColor = vec4(col, alpha);
          }
        `
        : `
          uniform vec3 uAccentColor;
          varying vec3 vNormalView;
          varying vec3 vViewPos;
          varying vec3 vLocalPos;
          void main() {
            vec3 viewDir = normalize(vViewPos);
            float ndotv = abs(dot(normalize(vNormalView), viewDir));
            float fresnel = pow(1.0 - ndotv, 2.15);
            // Seamless top blend into LeePerrySmith shoulders and clean base fade
            float topFade = 1.0 - smoothstep(-0.88, -0.58, vLocalPos.y);
            float bottomFade = smoothstep(-1.76, -1.56, vLocalPos.y);
            vec3 baseColor = vec3(0.44, 0.56, 0.74);
            vec3 rimColor = mix(vec3(0.74, 0.84, 0.96), uAccentColor, 0.28);
            vec3 col = mix(baseColor, rimColor, fresnel);
            float alpha = (0.045 + fresnel * 0.48) * topFade * bottomFade;
            gl_FragColor = vec4(col, alpha);
          }
        `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

function buildThoraxEnvelopeGeometry(): THREE.BufferGeometry {
  // Smooth organic ribcage shell from clavicle (-0.56) down to diaphragmatic waist (-1.76)
  const slices = [
    { y: -0.56, rx: 0.98, zf: 0.36, zb: 0.38 },
    { y: -0.74, rx: 1.12, zf: 0.43, zb: 0.43 },
    { y: -0.96, rx: 1.07, zf: 0.45, zb: 0.44 },
    { y: -1.24, rx: 1.00, zf: 0.44, zb: 0.42 },
    { y: -1.52, rx: 0.94, zf: 0.41, zb: 0.40 },
    { y: -1.76, rx: 0.88, zf: 0.38, zb: 0.38 },
  ];

  const radialSegs = 56;
  const cols = radialSegs + 1;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let r = 0; r < slices.length; r++) {
    const s = slices[r];
    for (let c = 0; c < cols; c++) {
      const theta = (c / radialSegs) * Math.PI * 2;
      const x = Math.sin(theta) * s.rx;
      const cosT = Math.cos(theta);
      const z = cosT >= 0 ? cosT * s.zf : cosT * s.zb;
      positions.push(x, s.y, z);
    }
  }

  for (let r = 0; r < slices.length - 1; r++) {
    for (let c = 0; c < radialSegs; c++) {
      const a = r * cols + c;
      const b = a + 1;
      const d = (r + 1) * cols + c;
      const e = d + 1;
      indices.push(a, d, b);
      indices.push(b, d, e);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

function createSculptedLungGeometry(side: -1 | 1): THREE.BufferGeometry {
  const geom = new THREE.SphereGeometry(1, 28, 24);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    const apexTaper = 0.56 + (1 - vy) * 0.25;
    let x = vx * 0.31 * apexTaper;
    let y = vy * 0.38;
    let z = vz * 0.23 * (0.72 + (1 - vy) * 0.16);

    const isMedial = (side === -1 && vx > 0) || (side === 1 && vx < 0);
    if (isMedial) {
      x *= 0.56;
    }

    if (vy < -0.55) {
      y += Math.pow((-vy - 0.55) / 0.45, 1.4) * 0.085;
    }

    z -= vy * 0.025;
    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

function createDiaphragmDomeGeometry(): THREE.BufferGeometry {
  const geom = new THREE.PlaneGeometry(1.50, 0.70, 38, 18);
  geom.rotateX(-Math.PI / 2);

  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const nx = x / 0.75;
    const nz = z / 0.35;

    const edgeDrop = Math.pow(nx * nx * 0.72 + nz * nz * 0.85, 1.2) * 0.21;
    const cupolaLift = Math.exp(-Math.pow((Math.abs(nx) - 0.45) * 2.6, 2)) * 0.085;
    pos.setY(i, cupolaLift - edgeDrop);
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
  const [verticalPan, setVerticalPan] = useState<number>(0);
  const [calloutCoords, setCalloutCoords] = useState<{
    ax: number;
    ay: number;
    cx: number;
    cy: number;
    visible: boolean;
  }>({ ax: 220, ay: 220, cx: 520, cy: 220, visible: true });

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

  // Preload realistic choir/voice vocal banks quietly on mount
  useEffect(() => {
    const timer = window.setTimeout(() => {
      preloadInstrument('choir_aahs');
      preloadInstrument('voice_oohs');
    }, 300);
    return () => window.clearTimeout(timer);
  }, []);

  const triggerTechniquePlay = (tech: VocalTechniqueInfo) => {
    setSelectedId(tech.id);
    setPlayingId(tech.id);
    if (soundTimerRef.current) window.clearTimeout(soundTimerRef.current);
    playVocalTechniqueVoice(tech.freqHz, tech.id);
    soundTimerRef.current = window.setTimeout(() => {
      setPlayingId(null);
    }, 1500);
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvasHost = canvasHostRef.current;
    if (!container || !canvasHost) return;

    const width = canvasHost.clientWidth || 640;
    const height = canvasHost.clientHeight || 520;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 40);
    camera.position.set(1.05, 0.10, 5.75);
    cameraRef.current = camera;

    const applyResponsiveCameraFrustum = (w: number, h: number) => {
      camera.aspect = w / h;
      if (w >= 768) {
        // Shift camera view offset rightward so the 3D bust renders around ~36% from left,
        // closer to the left colored chips, leaving a wider reading zone on the right.
        const viewShiftPx = Math.round(w * 0.145);
        camera.setViewOffset(w, h, viewShiftPx, 0, w, h);
      } else {
        camera.clearViewOffset();
      }
      camera.updateProjectionMatrix();
    };
    applyResponsiveCameraFrustum(width, height);

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
    controls.target.set(0, -0.14, 0);
    controlsRef.current = controls;

    // Studio anatomical lighting
    scene.add(new THREE.AmbientLight(0xdce6f5, 0.76));

    const keyLight = new THREE.DirectionalLight(0xfff1d6, 1.45);
    keyLight.position.set(2.8, 3.6, 4.2);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7c8cff, 1.05);
    rimLight.position.set(-3.4, 1.4, -2.5);
    scene.add(rimLight);

    const warmUnderLight = new THREE.PointLight(0xe2a856, 0.85, 9);
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
    // 1. REALISTIC SCULPTED HUMAN HEAD, NECK & SHOULDERS (.GLB) + THORAX
    // ------------------------------------------------------------------
    const headHoloMat = createHolographicGlassMaterial(activeTech.accentColor, 'head');
    const thoraxHoloMat = createHolographicGlassMaterial(activeTech.accentColor, 'thorax');

    let isDisposed = false;
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      './media/models/LeePerrySmith.glb',
      (gltf) => {
        if (isDisposed) return;
        const headRoot = gltf.scene;
        headRoot.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            mesh.material = headHoloMat;
            mesh.renderOrder = 2;
          }
        });
        headRoot.scale.setScalar(0.28);
        headRoot.position.set(0, 0.16, 0);
        atlasGroup.add(headRoot);
      },
      undefined,
      () => {
        // Fallback minimal head ellipse only if model failed to load
        if (isDisposed) return;
        const fallbackHead = new THREE.Mesh(new THREE.SphereGeometry(0.46, 32, 24), thoraxHoloMat);
        fallbackHead.scale.set(0.86, 1.15, 0.96);
        fallbackHead.position.set(0, 0.56, 0.08);
        atlasGroup.add(fallbackHead);
      }
    );

    const thoraxMesh = new THREE.Mesh(buildThoraxEnvelopeGeometry(), thoraxHoloMat);
    thoraxMesh.renderOrder = 2;
    atlasGroup.add(thoraxMesh);

    // Subtle holographic floor scan ring
    const baseRingMat = new THREE.MeshBasicMaterial({
      color: 0xe2a856,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    });
    const baseRing = new THREE.Mesh(new THREE.RingGeometry(0.92, 0.98, 64), baseRingMat);
    baseRing.rotation.x = -Math.PI / 2;
    baseRing.position.y = -1.75;
    atlasGroup.add(baseRing);

    // ------------------------------------------------------------------
    // 2. RESPIRATORY SYSTEM: TRACHEA + Y-BRONCHI + LUNGS + RIBS + DIAPHRAGM
    // ------------------------------------------------------------------
    const chestGroup = new THREE.Group();

    const tracheaMat = makeZoneMat('chest', 0x10b981, 0.42);
    const tracheaCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.088, 0.098, 0.52, 24),
      tracheaMat
    );
    tracheaCore.position.set(0, -0.64, 0.05);
    chestGroup.add(tracheaCore);

    const ringMat = makeZoneMat('chest', 0x34d399, 0.72);
    for (let i = 0; i < 9; i++) {
      const tRing = new THREE.Mesh(new THREE.TorusGeometry(0.104, 0.012, 10, 28), ringMat);
      tRing.rotation.x = Math.PI / 2;
      tRing.position.set(0, -0.43 - i * 0.052, 0.05);
      chestGroup.add(tRing);
    }

    const leftBronchusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.88, 0.05),
      new THREE.Vector3(-0.14, -0.97, 0.03),
      new THREE.Vector3(-0.34, -1.06, 0.02),
    ]);
    const rightBronchusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.88, 0.05),
      new THREE.Vector3(0.14, -0.97, 0.03),
      new THREE.Vector3(0.34, -1.06, 0.02),
    ]);
    chestGroup.add(
      new THREE.Mesh(new THREE.TubeGeometry(leftBronchusCurve, 16, 0.048, 14, false), tracheaMat),
      new THREE.Mesh(new THREE.TubeGeometry(rightBronchusCurve, 16, 0.048, 14, false), tracheaMat)
    );

    const lungMat = makeZoneMat('chest', 0x10b981, 0.50);
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
    leftLung.add(new THREE.Mesh(leftLungGeom, lungWireMat));

    const rightLungGeom = createSculptedLungGeometry(1);
    const rightLung = new THREE.Mesh(rightLungGeom, lungMat);
    rightLung.position.set(0.42, -1.16, 0.03);
    rightLung.rotation.z = -0.08;
    rightLung.add(new THREE.Mesh(rightLungGeom, lungWireMat));

    chestGroup.add(leftLung, rightLung);

    const sternumCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.80, 0.30),
      new THREE.Vector3(0, -1.10, 0.34),
      new THREE.Vector3(0, -1.42, 0.30),
    ]);
    chestGroup.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(sternumCurve, 20, 0.032, 12, false),
        makeZoneMat('chest', 0x34d399, 0.62)
      )
    );

    const ribMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.22,
    });
    for (let r = 0; r < 5; r++) {
      const ry = -0.84 - r * 0.145;
      const spreadX = 0.65 + Math.sin((r / 4) * Math.PI) * 0.24;
      const depthZ = 0.25 + Math.sin((r / 4) * Math.PI) * 0.09;
      for (const side of [-1, 1] as const) {
        const ribCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 0.10, ry + 0.04, -depthZ),
          new THREE.Vector3(side * spreadX, ry - 0.01, -0.02),
          new THREE.Vector3(side * (spreadX * 0.72), ry - 0.04, depthZ),
          new THREE.Vector3(side * 0.06, ry - 0.05, depthZ + 0.05),
        ]);
        chestGroup.add(
          new THREE.Mesh(new THREE.TubeGeometry(ribCurve, 18, 0.009, 6, false), ribMat)
        );
      }
    }

    const diaphragm = new THREE.Mesh(
      createDiaphragmDomeGeometry(),
      makeZoneMat('chest', 0x059669, 0.68)
    );
    diaphragm.position.set(0, -1.52, 0.02);
    chestGroup.add(diaphragm);

    atlasGroup.add(chestGroup);
    zoneMeshes.chest.push(chestGroup);

    // ------------------------------------------------------------------
    // 3. LARYNX & TRUE VOCAL FOLDS
    // ------------------------------------------------------------------
    const larynxGroup = new THREE.Group();

    const cricoid = new THREE.Mesh(
      new THREE.TorusGeometry(0.125, 0.024, 12, 32),
      makeZoneMat('larynx', 0xfbbf24, 0.8)
    );
    cricoid.rotation.x = Math.PI / 2;
    cricoid.position.set(0, -0.36, 0.07);
    larynxGroup.add(cricoid);

    const thyroid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.145, 0.135, 0.145, 6, 1, false),
      makeZoneMat('larynx', 0xf59e0b, 0.74)
    );
    thyroid.scale.set(0.90, 1.0, 1.15);
    thyroid.position.set(0, -0.28, 0.13);
    larynxGroup.add(thyroid);

    const trueFoldMat = makeZoneMat('larynx', 0xfde68a, 0.92);
    const leftFold = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.016, 0.155), trueFoldMat);
    leftFold.position.set(-0.025, -0.27, 0.10);
    leftFold.rotation.y = -0.18;
    const rightFold = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.016, 0.155), trueFoldMat);
    rightFold.position.set(0.025, -0.27, 0.10);
    rightFold.rotation.y = 0.18;
    larynxGroup.add(leftFold, rightFold);

    atlasGroup.add(larynxGroup);
    zoneMeshes.larynx.push(larynxGroup);

    // ------------------------------------------------------------------
    // 4. FALSE FOLDS & EPIGLOTTIS
    // ------------------------------------------------------------------
    const falseGroup = new THREE.Group();
    const falseMat = makeZoneMat('false-folds', 0xf43f5e, 0.85);

    const leftFalse = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.022, 0.145), falseMat);
    leftFalse.position.set(-0.042, -0.19, 0.13);
    const rightFalse = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.022, 0.145), falseMat);
    rightFalse.position.set(0.042, -0.19, 0.13);

    const epiglottis = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.042, 0.10, 8, 16),
      falseMat
    );
    epiglottis.scale.set(1.2, 1.0, 0.32);
    epiglottis.position.set(0, -0.11, 0.21);
    epiglottis.rotation.x = 0.42;

    falseGroup.add(leftFalse, rightFalse, epiglottis);
    atlasGroup.add(falseGroup);
    zoneMeshes['false-folds'].push(falseGroup);

    // ------------------------------------------------------------------
    // 5. PHARYNX & ORAL PALATE ARCH
    // ------------------------------------------------------------------
    const palateGroup = new THREE.Group();
    const pharynxCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.14, 0.09),
      new THREE.Vector3(0, 0.08, 0.02),
      new THREE.Vector3(0, 0.25, 0.18),
      new THREE.Vector3(0, 0.26, 0.41),
    ]);
    palateGroup.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(pharynxCurve, 28, 0.112, 20, false),
        makeZoneMat('palate', 0x38bdf8, 0.56)
      )
    );

    const palateDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 26, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      makeZoneMat('palate', 0x38bdf8, 0.78)
    );
    palateDome.scale.set(0.86, 0.62, 1.26);
    palateDome.position.set(0, 0.22, 0.28);
    palateGroup.add(palateDome);

    atlasGroup.add(palateGroup);
    zoneMeshes.palate.push(palateGroup);

    // ------------------------------------------------------------------
    // 6. RESONANT MASK (Nasal Bridge & Sinuses behind LeePerrySmith Nose)
    // ------------------------------------------------------------------
    const maskGroup = new THREE.Group();
    const maskMat = makeZoneMat('mask', 0xe2a856, 0.78);

    const nasalChamber = new THREE.Mesh(new THREE.SphereGeometry(0.105, 22, 18), maskMat);
    nasalChamber.scale.set(0.78, 0.90, 1.42);
    nasalChamber.position.set(0, 0.45, 0.43);

    const leftCheekSinus = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 16), maskMat);
    leftCheekSinus.scale.set(0.9, 0.85, 1.12);
    leftCheekSinus.position.set(-0.14, 0.39, 0.38);

    const rightCheekSinus = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 16), maskMat);
    rightCheekSinus.scale.set(0.9, 0.85, 1.12);
    rightCheekSinus.position.set(0.14, 0.39, 0.38);

    const frontalSinus = new THREE.Mesh(new THREE.SphereGeometry(0.092, 20, 16), maskMat);
    frontalSinus.scale.set(1.32, 0.58, 0.65);
    frontalSinus.position.set(0, 0.62, 0.46);

    maskGroup.add(nasalChamber, leftCheekSinus, rightCheekSinus, frontalSinus);
    atlasGroup.add(maskGroup);
    zoneMeshes.mask.push(maskGroup);

    // ------------------------------------------------------------------
    // 7. CRANIAL RESONANCE DOME (Head Register)
    // ------------------------------------------------------------------
    const headGroup = new THREE.Group();
    const headDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 30, 22),
      makeZoneMat('head', 0xa78bfa, 0.54)
    );
    headDome.scale.set(0.92, 0.80, 1.06);
    headDome.position.set(0, 0.88, 0.04);

    const headHalo = new THREE.Mesh(
      new THREE.TorusGeometry(0.37, 0.012, 12, 48),
      makeZoneMat('head', 0xc4b5fd, 0.66)
    );
    headHalo.rotation.x = Math.PI / 2 - 0.14;
    headHalo.position.set(0, 0.94, 0.04);

    headGroup.add(headDome, headHalo);
    atlasGroup.add(headGroup);
    zoneMeshes.head.push(headGroup);

    // ------------------------------------------------------------------
    // 8. ACOUSTIC PARTICLES & ORGAN ANCHOR DOT
    // ------------------------------------------------------------------
    const particleCount = 42;
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 0.42;
      particlePos[i * 3 + 1] = -0.3 + Math.random() * 1.1;
      particlePos[i * 3 + 2] = 0.06 + (Math.random() - 0.5) * 0.34;
    }
    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xe2a856,
      size: 0.028,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    atlasGroup.add(new THREE.Points(particleGeom, particleMat));

    const anchorDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xe2a856 })
    );
    atlasGroup.add(anchorDot);

    // ------------------------------------------------------------------
    // ANIMATION LOOP & RESPONSIVE PROJECTION
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
      applyResponsiveCameraFrustum(w, h);
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

      atlasGroup.position.y = THREE.MathUtils.lerp(
        atlasGroup.position.y,
        panOffsetRef.current,
        0.14
      );
      controls.target.set(0, -0.14 + panOffsetRef.current * 0.25, 0);

      // Gentle 3/4 alive idle rotation
      atlasGroup.rotation.y = Math.sin(t * 0.32) * 0.14 + 0.16;

      headHoloMat.uniforms.uAccentColor.value.set(current.accentColor);
      thoraxHoloMat.uniforms.uAccentColor.value.set(current.accentColor);

      const activeSet = new Set<ResonatorZoneId>(current.activeZones);
      (Object.keys(zoneMaterials) as ResonatorZoneId[]).forEach((zKey) => {
        const isActive = activeSet.has(zKey);
        const pulse = isActive ? 0.42 + Math.sin(t * 4.4) * 0.22 : 0.05;
        const targetOp = isActive ? 0.88 : 0.20;

        zoneMaterials[zKey].forEach((m) => {
          m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, pulse, 0.12);
          m.opacity = THREE.MathUtils.lerp(m.opacity, targetOp, 0.12);
        });

        const baseScale = zKey === 'chest'
          ? isActive
            ? 1.015 + Math.sin(t * 2.1) * 0.024
            : 1.0 + Math.sin(t * 1.4) * 0.009
          : isActive
          ? 1.02 + Math.sin(t * 5.0) * 0.013
          : 1.0;

        zoneMeshes[zKey].forEach((obj) => {
          obj.scale.lerp(new THREE.Vector3(baseScale, baseScale, baseScale), 0.12);
        });
      });

      const [ax, ay, az] = current.anchor3D;
      tempTargetAnchor.set(ax, ay, az);
      anchorDot.position.lerp(tempTargetAnchor, 0.18);
      (anchorDot.material as THREE.MeshBasicMaterial).color.set(current.accentColor);
      baseRingMat.color.set(current.accentColor);

      particleMat.color.set(current.accentColor);
      const pAttr = particleGeom.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let py = pAttr.getY(i) + 0.004;
        if (py > ay + 0.55) py = Math.max(-1.45, ay - 0.55);
        pAttr.setY(i, py);
      }
      pAttr.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);

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
      isDisposed = true;
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
    cam.position.set(1.05, 0.10, 5.75);
    controls.target.set(0, -0.14, 0);
    controls.update();
  };

  const thumbTopPercent = ((0.9 - verticalPan) / 1.8) * 100;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-[26px] border border-zinc-200/80 bg-[#0b0d17] shadow-2xl dark:border-white/10"
    >
      {/* Ambient scan aura shifted slightly toward the model on left */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60 transition-colors duration-700"
        style={{
          background: `radial-gradient(ellipse 62% 62% at 36% 48%, ${activeTech.accentColor}1d, transparent 70%), radial-gradient(circle at 80% 20%, rgba(56,189,248,0.08), transparent 48%)`,
        }}
      />

      {/* Full-width 3D Viewport */}
      <div
        ref={canvasHostRef}
        className="relative h-[360px] w-full cursor-grab active:cursor-grabbing sm:h-[430px] md:h-[580px] lg:h-[620px]"
      >
        {/* Top-left subtle diagnostic pill */}
        <div className="pointer-events-none absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/35 px-3 py-1.5 text-[11px] font-medium text-zinc-200 backdrop-blur-md">
          <span
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: activeTech.accentColor }}
          />
          <span>3D-скан · Вращайте и приближайте</span>
        </div>

        {/* DESKTOP LEFT OVERLAY: Colored technique chips running TOP-TO-BOTTOM close to 3D model */}
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

        {/* DESKTOP LIVE DOTTED SVG LEADER LINE */}
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

        {/* DESKTOP RIGHT-INSIDE OVERLAY: Wider floating glass callout card using reclaimed horizontal space */}
        <div
          ref={calloutRef}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute right-12 top-1/2 z-20 hidden w-[345px] -translate-y-1/2 rounded-2xl border bg-[#0e101c]/90 p-5 text-white shadow-2xl backdrop-blur-md transition-colors duration-300 md:block lg:right-14 lg:w-[420px] xl:w-[460px]"
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

        {/* FAR-RIGHT TRANSPARENT VERTICAL PAN SLIDER + ZOOM LOUPE CONTROLS AT BOTTOM */}
        <div
          className="absolute right-2.5 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3 sm:right-4"
          onPointerDown={(e) => e.stopPropagation()}
        >
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

      {/* MOBILE CLEAN UNOBSTRUCTED STACK (< md) */}
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
              <span>Звучит голос</span>
            </>
          ) : (
            <>
              <Volume2 className="h-3.5 w-3.5" />
              <span>Голос</span>
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
