import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Minus, Plus, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import {
  VOCAL_ATLAS_TECHNIQUES,
  type ResonatorZoneId,
  type VocalTechniqueInfo,
} from '../data/content';
import { getSharedAudioContext } from '../utils/instrumentSampler';

/**
 * Plays a short acoustic vocal demonstration tailored to the selected technique
 * (Chest depth, Subtone airiness, False-fold Grit/Distortion, Belt twang, or Head shine).
 */
function playVocalTechniqueDemo(tech: VocalTechniqueInfo) {
  try {
    const ctx = getSharedAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime + 0.02;
    const dur = 1.4;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.linearRampToValueAtTime(0.26, now + 0.08);
    master.gain.setValueAtTime(0.24, now + dur - 0.35);
    master.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    master.connect(ctx.destination);

    const formant = ctx.createBiquadFilter();
    formant.type = 'lowpass';
    formant.frequency.setValueAtTime(tech.formantHz, now);
    formant.Q.setValueAtTime(1.6 + tech.brightness * 2.4, now);
    formant.connect(master);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(tech.freqHz, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(tech.freqHz, now);

    // Subtle human vocal vibrato
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(5.4, now);
    lfoGain.gain.setValueAtTime(0, now);
    lfoGain.gain.linearRampToValueAtTime(tech.freqHz * 0.011, now + 0.32);
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    // Optional false-fold rasp modulation for Distortion ("Расщепление")
    if (tech.grit && tech.grit > 0) {
      const gritOsc = ctx.createOscillator();
      const gritGain = ctx.createGain();
      gritOsc.type = 'sawtooth';
      gritOsc.frequency.setValueAtTime(48, now);
      gritGain.gain.setValueAtTime(tech.freqHz * 0.055 * tech.grit, now);
      gritOsc.connect(gritGain);
      gritGain.connect(osc1.frequency);
      gritOsc.start(now);
      gritOsc.stop(now + dur + 0.05);
    }

    const mix1 = ctx.createGain();
    mix1.gain.value = 0.24 + tech.brightness * 0.34;
    const mix2 = ctx.createGain();
    mix2.gain.value = 0.65;

    osc1.connect(mix1).connect(formant);
    osc2.connect(mix2).connect(formant);

    osc1.start(now);
    osc2.start(now);
    lfo.start(now);
    osc1.stop(now + dur + 0.05);
    osc2.stop(now + dur + 0.05);
    lfo.stop(now + dur + 0.05);

    if (tech.airiness > 0.03) {
      const bufSize = Math.floor(ctx.sampleRate * dur);
      const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * tech.airiness;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      const airFilter = ctx.createBiquadFilter();
      airFilter.type = 'bandpass';
      airFilter.frequency.setValueAtTime(2100, now);
      airFilter.Q.setValueAtTime(1.3, now);
      noise.connect(airFilter).connect(master);
      noise.start(now);
      noise.stop(now + dur);
    }
  } catch {
    // Web Audio unavailable — fail silently
  }
}

export default function VocalAtlas3D() {
  const [selectedId, setSelectedId] = useState<VocalTechniqueInfo['id']>('mix');
  const [pulseUntil, setPulseUntil] = useState(0);
  // Vertical offset (-0.85..+0.85) moves the 3D apparatus smoothly up & down
  const [verticalPos, setVerticalPos] = useState(0);
  const [anchorScreenPos, setAnchorScreenPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 50,
    y: 50,
    visible: false,
  });

  const mountRef = useRef<HTMLDivElement | null>(null);
  const activeTechRef = useRef<VocalTechniqueInfo>(VOCAL_ATLAS_TECHNIQUES[4]);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const verticalPosRef = useRef(0);
  const pulseUntilRef = useRef(0);

  const selectedTech =
    VOCAL_ATLAS_TECHNIQUES.find((t) => t.id === selectedId) ?? VOCAL_ATLAS_TECHNIQUES[4];

  useEffect(() => {
    activeTechRef.current = selectedTech;
  }, [selectedTech]);

  useEffect(() => {
    verticalPosRef.current = verticalPos;
  }, [verticalPos]);

  useEffect(() => {
    pulseUntilRef.current = pulseUntil;
  }, [pulseUntil]);

  // Hovering a bottom chip highlights the organ & draws the callout line immediately
  const handleHoverTechnique = useCallback((tech: VocalTechniqueInfo) => {
    setSelectedId(tech.id);
  }, []);

  // Clicking a chip or the play button triggers both highlight & synthesized vocal example
  const handleActivateWithSound = useCallback((tech: VocalTechniqueInfo) => {
    setSelectedId(tech.id);
    setPulseUntil(Date.now() + 1450);
    playVocalTechniqueDemo(tech);
  }, []);

  const zoomStep = (direction: 'in' | 'out') => {
    const cam = cameraRef.current;
    const ctrls = controlsRef.current;
    if (!cam || !ctrls) return;
    const offset = new THREE.Vector3().subVectors(cam.position, ctrls.target);
    const factor = direction === 'in' ? 0.82 : 1.22;
    const nextLen = Math.max(2.1, Math.min(5.8, offset.length() * factor));
    offset.setLength(nextLen);
    cam.position.copy(ctrls.target).add(offset);
    ctrls.update();
  };

  const resetView = () => {
    setVerticalPos(0);
    verticalPosRef.current = 0;
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(2.35, 0.15, 3.25);
      controlsRef.current.target.set(0, -0.1, 0.1);
      controlsRef.current.update();
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 560;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(2.35, 0.15, 3.25);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.85;
    controls.minDistance = 2.1;
    controls.maxDistance = 5.8;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;
    controls.target.set(0, -0.1, 0.1);
    controls.minPolarAngle = Math.PI * 0.25;
    controls.maxPolarAngle = Math.PI * 0.75;
    controlsRef.current = controls;

    // Clean Three-Point Studio Medical Lighting
    const hemiLight = new THREE.HemisphereLight(0xfff5e4, 0x1e293b, 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.45);
    keyLight.position.set(3.5, 4.5, 4.2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.65);
    fillLight.position.set(-4.0, 1.0, 2.5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xe2a856, 1.6, 12);
    rimLight.position.set(-2.5, 1.8, -3.0);
    scene.add(rimLight);

    // Master wrapper translated smoothly by the vertical slider
    const viewportOffsetGroup = new THREE.Group();
    scene.add(viewportOffsetGroup);

    const modelGroup = new THREE.Group();
    viewportOffsetGroup.add(modelGroup);

    // GLOWING DIAGNOSTIC RING PODIUM ON FLOOR (like dental scan pedestal)
    const podiumGroup = new THREE.Group();
    podiumGroup.position.set(0, -1.78, 0.05);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const outerRing = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.04, 64), outerRingMat);
    outerRing.rotation.x = -Math.PI / 2;
    const innerDiscMat = new THREE.MeshBasicMaterial({
      color: 0xe2a856,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    });
    const innerDisc = new THREE.Mesh(new THREE.CircleGeometry(0.92, 64), innerDiscMat);
    innerDisc.rotation.x = -Math.PI / 2;
    podiumGroup.add(outerRing, innerDisc);
    modelGroup.add(podiumGroup);

    // 1. SMOOTH TRANSLUCENT SCULPTED HEAD, JAW, NECK & TORSO SHELL (NO UGLY WIREFRAME)
    const bustPoints: THREE.Vector2[] = [
      new THREE.Vector2(0.02, -1.75),
      new THREE.Vector2(1.06, -1.72), // lower ribcage base
      new THREE.Vector2(1.16, -1.36), // chest front/back
      new THREE.Vector2(1.02, -0.98), // shoulders / clavicles
      new THREE.Vector2(0.45, -0.78), // neck base
      new THREE.Vector2(0.37, -0.34), // larynx level
      new THREE.Vector2(0.44, -0.06), // jaw / submental line
      new THREE.Vector2(0.60, 0.16), // cheeks / lips zone
      new THREE.Vector2(0.65, 0.50), // nasal bridge / cheekbones
      new THREE.Vector2(0.63, 0.88), // forehead
      new THREE.Vector2(0.49, 1.18), // upper cranium
      new THREE.Vector2(0.02, 1.32), // top crown
    ];

    const bustGeo = new THREE.LatheGeometry(bustPoints, 64);
    const bPos = bustGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
      const x = bPos.getX(i);
      const y = bPos.getY(i);
      const z = bPos.getZ(i);

      if (y < -0.78) {
        // Anatomic elliptical torso proportions (wider shoulders, slim depth)
        bPos.setX(i, x * 1.14);
        bPos.setZ(i, z * 0.62);
      } else if (y > -0.15 && y < 1.15) {
        // Anatomic cranial elongation front-to-back
        bPos.setX(i, x * 0.92);
        bPos.setZ(i, z * 1.12);
        // Sculpted nose & chin profile on anterior (+Z) midline
        if (z > 0.42 && Math.abs(x) < 0.16) {
          const noseWeight = Math.exp(-Math.pow((y - 0.36) / 0.14, 2));
          const mouthWeight = Math.exp(-Math.pow((y - 0.08) / 0.09, 2));
          const chinWeight = Math.exp(-Math.pow((y + 0.08) / 0.07, 2));
          bPos.setZ(i, z * 1.12 + noseWeight * 0.2 + mouthWeight * 0.09 + chinWeight * 0.11);
        }
      }
    }
    bustGeo.computeVertexNormals();

    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4d4d8,
      transparent: true,
      opacity: 0.19,
      roughness: 0.22,
      metalness: 0.05,
      clearcoat: 0.85,
      clearcoatRoughness: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const shellMesh = new THREE.Mesh(bustGeo, shellMat);
    modelGroup.add(shellMesh);

    // Subtle delicate sagittal midline halo contour to make facial profile immediately clear
    const profileContourPts = [
      new THREE.Vector3(0, -1.72, 0.72),
      new THREE.Vector3(0, -0.96, 0.60),
      new THREE.Vector3(0, -0.76, 0.44),
      new THREE.Vector3(0, -0.34, 0.40),
      new THREE.Vector3(0, -0.09, 0.56), // chin
      new THREE.Vector3(0, 0.02, 0.52),
      new THREE.Vector3(0, 0.10, 0.61), // lower lip
      new THREE.Vector3(0, 0.18, 0.62), // upper lip
      new THREE.Vector3(0, 0.34, 0.82), // nose tip
      new THREE.Vector3(0, 0.54, 0.68), // bridge
      new THREE.Vector3(0, 0.88, 0.67), // forehead
      new THREE.Vector3(0, 1.32, 0.0), // crown
      new THREE.Vector3(0, 0.55, -0.72), // occiput
      new THREE.Vector3(0, -0.75, -0.44), // nape
      new THREE.Vector3(0, -1.72, -0.66), // upper back
    ];
    const contourGeo = new THREE.BufferGeometry().setFromPoints(
      new THREE.CatmullRomCurve3(profileContourPts).getPoints(72)
    );
    const contourMat = new THREE.LineBasicMaterial({
      color: 0xe2a856,
      transparent: true,
      opacity: 0.42,
    });
    modelGroup.add(new THREE.Line(contourGeo, contourMat));

    // Helper for creating lit, smooth anatomical meshes tracked per resonator zone
    const zoneMats: Record<ResonatorZoneId, THREE.MeshStandardMaterial[]> = {
      chest: [],
      larynx: [],
      'false-folds': [],
      palate: [],
      mask: [],
    };

    const makeZoneMat = (zone: ResonatorZoneId, baseColorHex: number, opacity = 0.88) => {
      const mat = new THREE.MeshStandardMaterial({
        color: baseColorHex,
        emissive: baseColorHex,
        emissiveIntensity: 0.18,
        roughness: 0.28,
        metalness: 0.12,
        transparent: opacity < 1,
        opacity,
      });
      zoneMats[zone].push(mat);
      return mat;
    };

    // 2. CHEST & TRACHEA RESONATOR (Diaphragm dome, Twin Lung lobes, Tracheal Cartilage Rings)
    const chestGroup = new THREE.Group();
    const lungMat = makeZoneMat('chest', 0x10b981, 0.48);
    const lungL = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), lungMat);
    lungL.scale.set(0.85, 1.15, 0.68);
    lungL.position.set(-0.38, -1.24, 0.05);
    const lungR = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), lungMat);
    lungR.scale.set(0.85, 1.15, 0.68);
    lungR.position.set(0.38, -1.24, 0.05);
    chestGroup.add(lungL, lungR);

    // Diaphragm dome arc
    const diagMat = makeZoneMat('chest', 0x34d399, 0.62);
    const diaphragm = new THREE.Mesh(
      new THREE.SphereGeometry(0.76, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.42),
      diagMat
    );
    diaphragm.scale.set(1.02, 0.45, 0.65);
    diaphragm.position.set(0, -1.66, 0.04);
    chestGroup.add(diaphragm);

    // Smooth stacked tracheal cartilage rings
    const ringMat = makeZoneMat('chest', 0xd1fae5, 0.85);
    for (let i = 0; i < 9; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.019, 14, 32), ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, -0.95 + i * 0.062, 0.08);
      chestGroup.add(ring);
    }
    modelGroup.add(chestGroup);

    // 3. LARYNX & TRUE VOCAL FOLDS (Thyroid Cartilage + Animated Pearlescent Folds)
    const larynxGroup = new THREE.Group();
    larynxGroup.position.set(0, -0.34, 0.11);

    const cartilageMat = makeZoneMat('larynx', 0xfef3c7, 0.82);
    const cricoid = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.028, 16, 36), cartilageMat);
    cricoid.rotation.x = Math.PI / 2;
    cricoid.position.set(0, -0.06, 0);
    larynxGroup.add(cricoid);

    const thyroidGeo = new THREE.CylinderGeometry(0.16, 0.145, 0.18, 32, 1, true, -Math.PI * 0.72, Math.PI * 1.44);
    const thyroidMat = makeZoneMat('larynx', 0xf59e0b, 0.55);
    thyroidMat.side = THREE.DoubleSide;
    const thyroid = new THREE.Mesh(thyroidGeo, thyroidMat);
    thyroid.position.set(0, 0.03, 0.02);
    larynxGroup.add(thyroid);

    const foldMat = makeZoneMat('larynx', 0xfef9c3, 0.96);
    const trueFoldL = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.14, 8, 16), foldMat);
    trueFoldL.rotation.x = Math.PI / 2;
    trueFoldL.position.set(-0.035, 0.02, 0.01);
    const trueFoldR = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.14, 8, 16), foldMat);
    trueFoldR.rotation.x = Math.PI / 2;
    trueFoldR.position.set(0.035, 0.02, 0.01);
    larynxGroup.add(trueFoldL, trueFoldR);
    modelGroup.add(larynxGroup);

    // 4. FALSE (VESTIBULAR) FOLDS & EPIGLOTTIS — DISTORTION / GRIT ANATOMY
    const falseFoldsGroup = new THREE.Group();
    falseFoldsGroup.position.set(0, -0.22, 0.12);
    const falseFoldMat = makeZoneMat('false-folds', 0xf43f5e, 0.9);
    const falseFoldL = new THREE.Mesh(new THREE.CapsuleGeometry(0.034, 0.13, 8, 16), falseFoldMat);
    falseFoldL.rotation.x = Math.PI / 2;
    falseFoldL.position.set(-0.07, 0, 0);
    const falseFoldR = new THREE.Mesh(new THREE.CapsuleGeometry(0.034, 0.13, 8, 16), falseFoldMat);
    falseFoldR.rotation.x = Math.PI / 2;
    falseFoldR.position.set(0.07, 0, 0);

    // Epiglottis leaf above vocal folds
    const epiglottis = new THREE.Mesh(new THREE.SphereGeometry(0.095, 24, 16), falseFoldMat);
    epiglottis.scale.set(1.0, 1.35, 0.35);
    epiglottis.position.set(0, 0.12, 0.09);
    epiglottis.rotation.x = -0.35;
    falseFoldsGroup.add(falseFoldL, falseFoldR, epiglottis);
    modelGroup.add(falseFoldsGroup);

    // 5. PALATE & PHARYNGEAL TRACT (Smooth Gum-Pink Soft/Hard Palate + Oral Resonator Tube)
    const palateGroup = new THREE.Group();
    const pharynxCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.25, 0.1),
      new THREE.Vector3(0, 0.06, 0.02),
      new THREE.Vector3(0, 0.24, 0.25),
      new THREE.Vector3(0, 0.16, 0.56),
    ]);
    const pharynxMat = makeZoneMat('palate', 0x38bdf8, 0.34);
    const pharynxTube = new THREE.Mesh(
      new THREE.TubeGeometry(pharynxCurve, 40, 0.125, 24, false),
      pharynxMat
    );
    palateGroup.add(pharynxTube);

    const palateDomeMat = makeZoneMat('palate', 0xf472b6, 0.78);
    const palateVault = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.55),
      palateDomeMat
    );
    palateVault.scale.set(1.0, 0.72, 1.28);
    palateVault.position.set(0, 0.22, 0.33);
    palateGroup.add(palateVault);
    modelGroup.add(palateGroup);

    // 6. NASAL MASK SINUSES & CRANIAL HEAD DOME
    const maskGroup = new THREE.Group();
    const sinusMat = makeZoneMat('mask', 0xa78bfa, 0.68);
    const maxillaryL = new THREE.Mesh(new THREE.SphereGeometry(0.135, 24, 18), sinusMat);
    maxillaryL.scale.set(0.85, 1.05, 0.9);
    maxillaryL.position.set(-0.18, 0.43, 0.44);
    const maxillaryR = new THREE.Mesh(new THREE.SphereGeometry(0.135, 24, 18), sinusMat);
    maxillaryR.scale.set(0.85, 1.05, 0.9);
    maxillaryR.position.set(0.18, 0.43, 0.44);

    const frontalL = new THREE.Mesh(new THREE.SphereGeometry(0.105, 20, 16), sinusMat);
    frontalL.position.set(-0.11, 0.76, 0.48);
    const frontalR = new THREE.Mesh(new THREE.SphereGeometry(0.105, 20, 16), sinusMat);
    frontalR.position.set(0.11, 0.76, 0.48);

    const crownDomeMat = makeZoneMat('mask', 0xc4b5fd, 0.36);
    const crownDome = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 24), crownDomeMat);
    crownDome.scale.set(1.02, 0.75, 1.08);
    crownDome.position.set(0, 0.85, 0.1);
    maskGroup.add(maxillaryL, maxillaryR, frontalL, frontalR, crownDome);
    modelGroup.add(maskGroup);

    // 7. 3D ANCHOR DOT MESH MARKING EXACT SELECTED ORGAN ORIGIN
    const anchorGeo = new THREE.SphereGeometry(0.055, 16, 16);
    const anchorMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const anchorDot = new THREE.Mesh(anchorGeo, anchorMat);
    modelGroup.add(anchorDot);

    // 8. ACOUSTIC PARTICLES FLOWING THROUGH VOCAL TRACT
    const particleCount = 72;
    const pPositions = new Float32Array(particleCount * 3);
    const pProgress = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) pProgress[i] = Math.random();
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.042,
      transparent: true,
      opacity: 0.88,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    modelGroup.add(particles);

    const ro = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    ro.observe(container);

    let rafId = 0;
    let clock = 0;
    let isInViewport = true;
    const anchorVec = new THREE.Vector3();
    let frameTick = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        isInViewport = entry.isIntersecting;
      },
      { threshold: 0.02 }
    );
    io.observe(container);

    const animate = () => {
      rafId = window.requestAnimationFrame(animate);
      if (!isInViewport) return;

      clock += 0.026;
      frameTick++;

      // Smoothly move 3D model vertically when user drags the vertical offset slider
      viewportOffsetGroup.position.y += (verticalPosRef.current - viewportOffsetGroup.position.y) * 0.14;

      const tech = activeTechRef.current;
      const accentColor = new THREE.Color(tech.accentColor);
      const isNotePlaying = Date.now() < pulseUntilRef.current;
      const pulseBoost = isNotePlaying
        ? 0.65 + 0.35 * Math.sin(clock * 16)
        : 0.28 + 0.14 * Math.sin(clock * 2.5);

      // Update anatomical zone materials cleanly
      (['chest', 'larynx', 'false-folds', 'palate', 'mask'] as ResonatorZoneId[]).forEach((zId) => {
        const isActive = tech.activeZones.includes(zId);
        zoneMats[zId].forEach((m) => {
          if (isActive) {
            m.emissive.lerp(accentColor, 0.14);
            m.emissiveIntensity += (pulseBoost - m.emissiveIntensity) * 0.14;
            m.opacity += (0.86 - m.opacity) * 0.1;
          } else {
            m.emissive.lerp(new THREE.Color(0x18181b), 0.1);
            m.emissiveIntensity += (0.04 - m.emissiveIntensity) * 0.12;
            m.opacity += (0.28 - m.opacity) * 0.1;
          }
        });
      });

      // Animate True & False Vocal Folds mechanics
      const targetGap = tech.id === 'subtone' ? 0.072 : tech.id === 'head-register' ? 0.05 : 0.032;
      const vib = isNotePlaying ? Math.sin(clock * 24) * 0.012 : Math.sin(clock * 4) * 0.004;
      trueFoldL.position.x = -(targetGap + vib);
      trueFoldR.position.x = targetGap + vib;
      larynxGroup.rotation.x = tech.id === 'belt' ? 0.15 : tech.id === 'chest-support' ? -0.08 : 0;

      // False folds adduct during Distortion ("Расщепление")
      const falseGap = tech.id === 'distortion' ? 0.036 : 0.075;
      const falseVib = tech.id === 'distortion' && isNotePlaying ? Math.sin(clock * 32) * 0.01 : 0;
      falseFoldL.position.x += (-(falseGap + falseVib) - falseFoldL.position.x) * 0.16;
      falseFoldR.position.x += (falseGap + falseVib - falseFoldR.position.x) * 0.16;

      // Highlight ring podium color
      outerRingMat.color.lerp(accentColor, 0.1);

      // Move 3D Anchor Dot cleanly & update SVG leader line coords
      anchorDot.position.set(tech.anchor3D[0], tech.anchor3D[1], tech.anchor3D[2]);
      anchorMat.color.copy(accentColor);

      // Update flowing sound particles
      particleMat.color.lerp(accentColor, 0.1);
      const posArr = particleGeo.attributes.position.array as Float32Array;
      const speed = isNotePlaying ? 0.013 : 0.0055;
      const maxTopY = tech.activeZones.includes('mask')
        ? 0.85
        : tech.activeZones.includes('palate')
          ? 0.36
          : -0.14;
      const startY = tech.activeZones.includes('chest') ? -1.45 : -0.45;

      for (let i = 0; i < particleCount; i++) {
        pProgress[i] = (pProgress[i] + speed) % 1;
        const p = pProgress[i];
        const y = startY + p * (maxTopY - startY);
        const forwardBend = y > -0.15 ? Math.pow((y + 0.15) * 0.85, 1.4) * 0.55 : 0.08;
        const swirlAngle = p * 8 + i * 0.7 + clock * 0.9;
        const spread = y < -0.7 ? 0.2 : 0.06 + p * 0.1;
        posArr[i * 3] = Math.cos(swirlAngle) * spread;
        posArr[i * 3 + 1] = y;
        posArr[i * 3 + 2] = forwardBend + Math.sin(swirlAngle) * spread * 0.75;
      }
      particleGeo.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);

      // Project 3D organ anchor to 2D percentage coordinates every 2 frames for live SVG callout line
      if (frameTick % 2 === 0) {
        anchorDot.getWorldPosition(anchorVec);
        anchorVec.project(camera);
        const xPct = (anchorVec.x * 0.5 + 0.5) * 100;
        const yPct = (-anchorVec.y * 0.5 + 0.5) * 100;
        const isBehind = anchorVec.z > 1;
        setAnchorScreenPos({
          x: Math.max(8, Math.min(88, xPct)),
          y: Math.max(8, Math.min(90, yPct)),
          visible: !isBehind,
        });
      }
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      bustGeo.dispose();
      contourGeo.dispose();
      particleGeo.dispose();
    };
  }, []);

  // SVG elbow leader-line path from live 3D organ dot toward the right info card
  const lineStartX = anchorScreenPos.x;
  const lineStartY = anchorScreenPos.y;
  const elbowX = Math.min(93, lineStartX + (96 - lineStartX) * 0.55);

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 lg:mt-8 lg:grid-cols-12 lg:items-stretch">
      {/* LEFT (LARGER 8 cols): Full 3D Viewport + Live Callout Line + Right Vertical Slider + Bottom Colored Chips */}
      <div className="relative flex flex-col overflow-hidden rounded-3xl border border-[#B45309]/25 bg-gradient-to-b from-[#111524] via-[#0B0E18] to-[#080A11] shadow-2xl dark:border-[#E2A856]/30 lg:col-span-8">
        {/* Top Overlay Pill */}
        <div className="pointer-events-none absolute left-4 right-14 top-4 z-10 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3.5 py-1 text-[11px] font-semibold text-zinc-200 backdrop-blur-xs">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: selectedTech.accentColor }}
            />
            <span>3D-атлас • Вращайте модель и крутите колесо для зума</span>
          </span>
        </div>

        {/* 3D Canvas Area + Live SVG Leader Line + Right Vertical Slider */}
        <div className="relative flex-1 min-h-[380px] sm:min-h-[450px] lg:min-h-[500px]">
          <div
            ref={mountRef}
            className="h-[380px] w-full cursor-grab active:cursor-grabbing sm:h-[450px] lg:h-[500px]"
          />

          {/* Live Dotted Leader Line SVG connecting exact 3D organ dot toward right description panel */}
          {anchorScreenPos.visible && (
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full lg:block"
            >
              <polyline
                points={`${lineStartX},${lineStartY} ${elbowX},36 99,36`}
                fill="none"
                stroke={selectedTech.accentColor}
                strokeWidth="0.45"
                strokeDasharray="1.4 1.2"
                strokeOpacity="0.9"
              />
            </svg>
          )}

          {/* Crisp 2D circular target marker synced over exact 3D organ coordinate */}
          {anchorScreenPos.visible && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
              style={{
                left: `${lineStartX}%`,
                top: `${lineStartY}%`,
              }}
            >
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full border-2 bg-black/40 shadow-lg"
                style={{ borderColor: selectedTech.accentColor }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: selectedTech.accentColor }}
                />
              </span>
            </span>
          )}

          {/* Right-Edge Inside Controls: Zoom (+ / -), Vertical Up/Down Position Slider & Reset */}
          <div className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-2 rounded-2xl border border-white/12 bg-black/55 px-1.5 py-2.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => zoomStep('in')}
              title="Приблизить 3D"
              aria-label="Приблизить 3D"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-zinc-200 transition hover:border-[#E2A856] hover:text-[#E2A856] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>

            {/* Vertical Height Slider to Pan Model Up & Down */}
            <div className="relative flex h-28 w-7 items-center justify-center">
              <input
                type="range"
                min={-0.85}
                max={0.85}
                step={0.05}
                value={verticalPos}
                onChange={(e) => setVerticalPos(Number(e.target.value))}
                title="Переместить модель вверх / вниз"
                aria-label="Переместить модель вверх или вниз"
                className="h-24 w-2 cursor-pointer accent-[#E2A856]"
                style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
              />
            </div>

            <button
              type="button"
              onClick={() => zoomStep('out')}
              title="Отдалить 3D"
              aria-label="Отдалить 3D"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-zinc-200 transition hover:border-[#E2A856] hover:text-[#E2A856] cursor-pointer"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={resetView}
              title="Сбросить ракурс и позицию"
              aria-label="Сбросить ракурс и позицию"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-zinc-300 transition hover:border-[#E2A856] hover:text-[#E2A856] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* BOTTOM: Distinct Colored Chips (Hover to inspect callout & highlight 3D, Click to hear tone) */}
        <div className="border-t border-white/10 bg-[#0A0D16]/90 px-3.5 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {VOCAL_ATLAS_TECHNIQUES.map((tech) => {
              const active = tech.id === selectedTech.id;
              return (
                <button
                  key={tech.id}
                  type="button"
                  onMouseEnter={() => handleHoverTechnique(tech)}
                  onFocus={() => handleHoverTechnique(tech)}
                  onClick={() => handleActivateWithSound(tech)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    active
                      ? 'scale-[1.04] bg-white/12 text-white shadow-md'
                      : 'border-white/12 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.09] hover:text-white'
                  }`}
                  style={{
                    borderColor: active ? tech.accentColor : `${tech.accentColor}44`,
                    boxShadow: active ? `0 0 14px ${tech.accentColor}40` : undefined,
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: tech.accentColor,
                      boxShadow: `0 0 8px ${tech.accentColor}`,
                    }}
                  />
                  <span>{tech.chipLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT (SMALLER 4 cols): Callout Card Connected by Live Dotted Line */}
      <div className="flex flex-col justify-center lg:col-span-4">
        <div
          className="relative rounded-3xl border bg-[#FAF8F5]/96 p-5 shadow-xl transition-colors duration-300 dark:bg-[#10131F]/95 sm:p-6"
          style={{
            borderColor: `${selectedTech.accentColor}66`,
            boxShadow: `0 12px 36px ${selectedTech.accentColor}18`,
          }}
        >
          {/* Connection terminal dot on left edge matching callout line */}
          <span
            aria-hidden="true"
            className="hidden lg:block absolute -left-2 top-[36%] h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 bg-[#0B0E18]"
            style={{
              borderColor: selectedTech.accentColor,
              backgroundColor: selectedTech.accentColor,
            }}
          />

          <div className="flex items-center justify-between gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${selectedTech.accentColor}22`,
                color: selectedTech.accentColor,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: selectedTech.accentColor }}
              />
              {selectedTech.badge}
            </span>

            <button
              type="button"
              onClick={() => handleActivateWithSound(selectedTech)}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-transform hover:scale-105 cursor-pointer"
              style={{
                borderColor: `${selectedTech.accentColor}60`,
                backgroundColor: `${selectedTech.accentColor}18`,
                color: selectedTech.accentColor,
              }}
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Звук</span>
            </button>
          </div>

          <h3 className="mt-3 font-serif text-2xl sm:text-3xl font-semibold leading-tight text-zinc-900 dark:text-[#F5F3EF]">
            {selectedTech.title}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {selectedTech.subtitle} • {selectedTech.noteLabel.split('(')[0].trim()}
          </p>

          <div className="mt-4 space-y-3 border-t border-zinc-900/10 pt-3.5 text-sm leading-relaxed dark:border-white/10">
            <div>
              <p
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
                style={{ color: selectedTech.accentColor }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Вокальная механика
              </p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                {selectedTech.physiology}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Ощущения в теле
              </p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                {selectedTech.sensation}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-900/8 bg-[#F2EDE6]/85 px-3.5 py-2.5 text-xs text-zinc-600 dark:border-white/8 dark:bg-[#16151C] dark:text-zinc-300">
              <strong className="text-zinc-900 dark:text-[#F5F3EF]">Применение:</strong>{' '}
              {selectedTech.usage}
            </div>
          </div>

          {/* Highlighted Anatomical Zones List */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {selectedTech.zoneNames.map((zName) => (
              <span
                key={zName}
                className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                style={{
                  borderColor: `${selectedTech.accentColor}44`,
                  backgroundColor: `${selectedTech.accentColor}12`,
                  color: selectedTech.accentColor,
                }}
              >
                {zName}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
