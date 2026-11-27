import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import {
  VOCAL_ATLAS_TECHNIQUES,
  type ResonatorZoneId,
  type VocalTechniqueInfo,
} from '../data/content';
import { getSharedAudioContext } from '../utils/instrumentSampler';

/**
 * Plays a realistic synthesized vocal note demonstration tailored to each technique
 * (subtone airiness, chest depth, belt twang formant, or head flute shine).
 */
function playVocalTechniqueDemo(tech: VocalTechniqueInfo) {
  try {
    const ctx = getSharedAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime + 0.02;
    const dur = 1.45;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.linearRampToValueAtTime(0.28, now + 0.08);
    master.gain.setValueAtTime(0.26, now + dur - 0.35);
    master.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    master.connect(ctx.destination);

    // Vocal formant bandpass/lowpass filter
    const formant = ctx.createBiquadFilter();
    formant.type = 'lowpass';
    formant.frequency.setValueAtTime(tech.formantHz, now);
    formant.Q.setValueAtTime(1.8 + tech.brightness * 2.5, now);
    formant.connect(master);

    // Rich harmonic vocal carrier (sawtooth + soft triangle sub-harmonic)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(tech.freqHz, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(tech.freqHz, now);

    // Subtle human vocal vibrato after onset
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(5.2, now);
    lfoGain.gain.setValueAtTime(0, now);
    lfoGain.gain.linearRampToValueAtTime(tech.freqHz * 0.011, now + 0.35);
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    const mix1 = ctx.createGain();
    mix1.gain.value = 0.25 + tech.brightness * 0.35;
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

    // Breathiness air layer for Subtone / Head
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
      airFilter.frequency.setValueAtTime(2200, now);
      airFilter.Q.setValueAtTime(1.4, now);
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

  const mountRef = useRef<HTMLDivElement | null>(null);
  const activeTechRef = useRef<VocalTechniqueInfo>(VOCAL_ATLAS_TECHNIQUES[1]);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const selectedTech =
    VOCAL_ATLAS_TECHNIQUES.find((t) => t.id === selectedId) ?? VOCAL_ATLAS_TECHNIQUES[1];

  useEffect(() => {
    activeTechRef.current = selectedTech;
  }, [selectedTech]);

  const handleSelectTechnique = useCallback((tech: VocalTechniqueInfo) => {
    setSelectedId(tech.id);
    setPulseUntil(Date.now() + 1450);
    playVocalTechniqueDemo(tech);
  }, []);

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(2.55, 0.25, 3.05);
      controlsRef.current.target.set(0, -0.05, 0.15);
      controlsRef.current.update();
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 440;
    const height = container.clientHeight || 440;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.55, 0.25, 3.05);
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
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.65;
    controls.target.set(0, -0.05, 0.15);
    controls.minPolarAngle = Math.PI * 0.28;
    controls.maxPolarAngle = Math.PI * 0.72;
    controlsRef.current = controls;

    // Studio Holographic Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xffe0a3, 1.4);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xe2a856, 2.0, 12);
    rimLight.position.set(-2.5, 1.2, -2);
    scene.add(rimLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. OUTER HOLOGRAPHIC HEAD + NECK + CHEST SILHOUETTE
    // Refined anatomical profile points rotated via LatheGeometry
    const profilePoints: THREE.Vector2[] = [
      new THREE.Vector2(0.01, -1.78),
      new THREE.Vector2(1.08, -1.72), // lower chest base
      new THREE.Vector2(1.14, -1.35), // ribcage
      new THREE.Vector2(0.95, -0.96), // clavicles / upper torso
      new THREE.Vector2(0.42, -0.78), // neck base
      new THREE.Vector2(0.36, -0.35), // mid neck / larynx level
      new THREE.Vector2(0.41, -0.05), // jaw / chin line
      new THREE.Vector2(0.58, 0.16), // cheekbones
      new THREE.Vector2(0.64, 0.52), // temples
      new THREE.Vector2(0.62, 0.92), // forehead
      new THREE.Vector2(0.46, 1.24), // crown
      new THREE.Vector2(0.01, 1.36), // top vertex
    ];

    const bodyGeo = new THREE.LatheGeometry(profilePoints, 32);
    // Subtle anatomical Z-stretch on head & chin for side-profile realism
    const posAttr = bodyGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);
      const x = posAttr.getX(i);
      // Narrow torso side-to-side depth & project face forward
      if (y < -0.75) {
        posAttr.setZ(i, z * 0.68);
        posAttr.setX(i, x * 1.12);
      } else if (y > -0.15 && y < 1.05 && z > 0) {
        posAttr.setZ(i, z * 1.18);
      }
      if (y > 0.3 && y < 0.58 && z > 0.45 && Math.abs(x) < 0.14) {
        // Delicate nose bridge contour
        posAttr.setZ(i, z + 0.14);
      }
    }
    bodyGeo.computeVertexNormals();

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2a856,
      transparent: true,
      opacity: 0.09,
      roughness: 0.25,
      metalness: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, glassMat);
    rootGroup.add(bodyMesh);

    const wireGeo = new THREE.WireframeGeometry(bodyGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0xe2a856,
      transparent: true,
      opacity: 0.22,
    });
    const bodyWire = new THREE.LineSegments(wireGeo, wireMat);
    rootGroup.add(bodyWire);

    // Ribcage golden contour arcs inside chest
    const chestResonatorGroup = new THREE.Group();
    for (let r = 0; r < 4; r++) {
      const yPos = -1.48 + r * 0.17;
      const radiusX = 0.72 - r * 0.04;
      const ribGeo = new THREE.TorusGeometry(radiusX, 0.014, 8, 36, Math.PI * 1.45);
      const ribMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.32,
      });
      const rib = new THREE.Mesh(ribGeo, ribMat);
      rib.position.set(0, yPos, 0.04);
      rib.rotation.x = Math.PI / 2;
      rib.rotation.z = Math.PI * 0.78;
      rib.scale.set(1, 0.65, 1);
      chestResonatorGroup.add(rib);
    }
    // Trachea rings
    const tracheaMat = new THREE.MeshBasicMaterial({
      color: 0xe2a856,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const trachea = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.14, 0.72, 16, 6, true),
      tracheaMat
    );
    trachea.position.set(0, -0.78, 0.08);
    chestResonatorGroup.add(trachea);
    rootGroup.add(chestResonatorGroup);

    // 2. RESONATOR ZONE GLOW MESHES (4 interactive anatomical zones)
    const zoneMeshes: Record<ResonatorZoneId, { group: THREE.Group; mats: THREE.MeshBasicMaterial[] }> = {
      chest: { group: chestResonatorGroup, mats: [] },
      larynx: { group: new THREE.Group(), mats: [] },
      palate: { group: new THREE.Group(), mats: [] },
      mask: { group: new THREE.Group(), mats: [] },
    };

    // Chest inner glow core
    const chestCoreMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.2,
    });
    const chestCore = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 18), chestCoreMat);
    chestCore.scale.set(1.25, 0.85, 0.72);
    chestCore.position.set(0, -1.25, 0.05);
    chestResonatorGroup.add(chestCore);
    zoneMeshes.chest.mats.push(chestCoreMat);
    chestResonatorGroup.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
        zoneMeshes.chest.mats.push(child.material);
      }
    });

    // Larynx & Vocal Folds assembly (with left & right animated vocal folds!)
    const larynxGroup = zoneMeshes.larynx.group;
    larynxGroup.position.set(0, -0.34, 0.11);
    const thyroidMat = new THREE.MeshBasicMaterial({
      color: 0xe2a856,
      transparent: true,
      opacity: 0.45,
    });
    const thyroidShield = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.022, 10, 28),
      thyroidMat
    );
    thyroidShield.rotation.x = Math.PI / 2;
    larynxGroup.add(thyroidShield);

    const foldMatL = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.8 });
    const foldMatR = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.8 });
    const foldLeft = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.11, 6, 12), foldMatL);
    foldLeft.rotation.x = Math.PI / 2;
    foldLeft.position.set(-0.04, 0, 0);
    const foldRight = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.11, 6, 12), foldMatR);
    foldRight.rotation.x = Math.PI / 2;
    foldRight.position.set(0.04, 0, 0);
    larynxGroup.add(foldLeft, foldRight);

    const larynxHaloMat = new THREE.MeshBasicMaterial({
      color: 0xe2a856,
      transparent: true,
      opacity: 0.25,
    });
    const larynxHalo = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), larynxHaloMat);
    larynxGroup.add(larynxHalo);
    zoneMeshes.larynx.mats.push(thyroidMat, foldMatL, foldMatR, larynxHaloMat);
    rootGroup.add(larynxGroup);

    // Palate & Pharyngeal Vocal Tract Horn (Tube from larynx up to soft/hard palate & mouth)
    const palateGroup = zoneMeshes.palate.group;
    const tractCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.28, 0.08),
      new THREE.Vector3(0, 0.05, 0.02),
      new THREE.Vector3(0, 0.24, 0.28),
      new THREE.Vector3(0, 0.16, 0.62),
    ]);
    const tractMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.28,
      wireframe: true,
    });
    const tractMesh = new THREE.Mesh(new THREE.TubeGeometry(tractCurve, 24, 0.13, 12, false), tractMat);
    palateGroup.add(tractMesh);

    const palateDomeMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.32,
    });
    const palateDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
      palateDomeMat
    );
    palateDome.position.set(0, 0.21, 0.34);
    palateGroup.add(palateDome);
    zoneMeshes.palate.mats.push(tractMat, palateDomeMat);
    rootGroup.add(palateGroup);

    // Mask, Nasal Sinuses & Head Crown Resonator
    const maskGroup = zoneMeshes.mask.group;
    const sinusMatL = new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.3,
    });
    const sinusMatR = new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.3,
    });
    const sinusLeft = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), sinusMatL);
    sinusLeft.position.set(-0.18, 0.44, 0.48);
    sinusLeft.scale.set(0.9, 1.15, 0.8);
    const sinusRight = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), sinusMatR);
    sinusRight.position.set(0.18, 0.44, 0.48);
    sinusRight.scale.set(0.9, 1.15, 0.8);

    const crownDomeMat = new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.18,
    });
    const crownDome = new THREE.Mesh(new THREE.SphereGeometry(0.36, 22, 16), crownDomeMat);
    crownDome.position.set(0, 0.78, 0.14);
    crownDome.scale.set(1.05, 0.8, 1.1);
    maskGroup.add(sinusLeft, sinusRight, crownDome);
    zoneMeshes.mask.mats.push(sinusMatL, sinusMatR, crownDomeMat);
    rootGroup.add(maskGroup);

    // 3. FLOATING ACOUSTIC PARTICLES FLOWING UP THE VOCAL TRACT
    const particleCount = 90;
    const pPositions = new Float32Array(particleCount * 3);
    const pProgress = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pProgress[i] = Math.random();
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);

    // Resize observer so 3D canvas never stretches or distorts
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

      clock += 0.025;
      const tech = activeTechRef.current;
      const accentHex = new THREE.Color(tech.accentColor);
      const isNotePlaying = Date.now() < pulseUntil;
      const pulseBoost = isNotePlaying ? 0.25 + 0.15 * Math.sin(clock * 14) : 0.08 * Math.sin(clock * 2.5);

      // Update each anatomical resonator zone intensity & color
      (['chest', 'larynx', 'palate', 'mask'] as ResonatorZoneId[]).forEach((zId, zIdx) => {
        const isActive = tech.activeZones.includes(zId);
        const targetOpacity = isActive ? Math.min(0.85, 0.34 + pulseBoost + 0.08 * Math.sin(clock * 3 + zIdx)) : 0.06;
        const zone = zoneMeshes[zId];
        zone.mats.forEach((m) => {
          m.opacity += (targetOpacity - m.opacity) * 0.1;
          if (isActive) {
            m.color.lerp(accentHex, 0.12);
          } else {
            m.color.lerp(new THREE.Color(0x52525b), 0.08);
          }
        });
      });

      // Animate vocal fold mechanics based on selected technique (Subtone gap vs Belt tight closure)
      const targetGap = tech.id === 'subtone' ? 0.072 : tech.id === 'head-register' ? 0.048 : 0.032;
      const vib = isNotePlaying ? Math.sin(clock * 24) * 0.012 : Math.sin(clock * 4) * 0.004;
      foldLeft.position.x = -(targetGap + vib);
      foldRight.position.x = targetGap + vib;
      larynxGroup.rotation.x = tech.id === 'belt' ? 0.14 : tech.id === 'chest-support' ? -0.08 : 0;

      // Update flowing acoustic sound particles along tract
      particleMat.color.lerp(accentHex, 0.1);
      const posArr = particleGeo.attributes.position.array as Float32Array;
      const speed = isNotePlaying ? 0.012 : 0.0055;
      const maxTopY = tech.activeZones.includes('mask')
        ? 0.85
        : tech.activeZones.includes('palate')
          ? 0.35
          : -0.15;
      const startY = tech.activeZones.includes('chest') ? -1.45 : -0.45;

      for (let i = 0; i < particleCount; i++) {
        pProgress[i] = (pProgress[i] + speed) % 1;
        const p = pProgress[i];
        const y = startY + p * (maxTopY - startY);
        const forwardBend = y > -0.15 ? Math.pow((y + 0.15) * 0.85, 1.4) * 0.55 : 0.08;
        const swirlAngle = p * 9 + i * 0.7 + clock * 0.9;
        const spread = y < -0.7 ? 0.22 : 0.08 + p * 0.12;
        posArr[i * 3] = Math.cos(swirlAngle) * spread;
        posArr[i * 3 + 1] = y;
        posArr[i * 3 + 2] = forwardBend + Math.sin(swirlAngle) * spread * 0.8;
      }
      particleGeo.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      bodyGeo.dispose();
      wireGeo.dispose();
      particleGeo.dispose();
    };
  }, [pulseUntil]);

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-12 lg:items-center">
      {/* Left: Interactive 3D Viewport */}
      <div className="relative overflow-hidden rounded-3xl border border-[#B45309]/25 bg-gradient-to-b from-[#17161E] via-[#100F15] to-[#0B0A0E] shadow-2xl dark:border-[#E2A856]/30 lg:col-span-6">
        {/* Top Overlay Status Badge */}
        <div className="pointer-events-none absolute left-4 right-4 top-4 z-10 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2A856]/35 bg-black/55 px-3 py-1 text-[11px] font-semibold text-[#FACC15] backdrop-blur-xs">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span>3D-голограмма • Вращайте мышью или пальцем</span>
          </span>

          <button
            type="button"
            onClick={resetCamera}
            title="Сбросить ракурс 3D-модели"
            aria-label="Сбросить ракурс"
            className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/55 text-zinc-200 backdrop-blur-xs transition hover:border-[#E2A856] hover:text-[#E2A856] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div
          ref={mountRef}
          className="h-[340px] w-full touch-pan-y cursor-grab active:cursor-grabbing sm:h-[420px] lg:h-[460px]"
        />

        {/* Active Highlighted Zones Strip */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-white/10 bg-black/45 px-4 py-2.5 text-[11px] font-medium text-zinc-300">
          <span className="text-zinc-500">Активные резонаторы:</span>
          {selectedTech.zoneNames.map((zName) => (
            <span
              key={zName}
              className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
              style={{
                borderColor: `${selectedTech.accentColor}66`,
                backgroundColor: `${selectedTech.accentColor}22`,
                color: selectedTech.accentColor,
              }}
            >
              {zName}
            </span>
          ))}
        </div>
      </div>

      {/* Right: 5 Vocal Technique Switchers + Scientific Explanation */}
      <div className="flex flex-col justify-between gap-5 lg:col-span-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Выберите вокальный приём — загорятся нужные резонаторы и прозвучит нота:
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {VOCAL_ATLAS_TECHNIQUES.map((tech) => {
              const active = tech.id === selectedTech.id;
              return (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => handleSelectTechnique(tech)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    active
                      ? 'scale-[1.03] border-transparent text-[#0D0C10] shadow-md'
                      : 'border-zinc-900/12 bg-[#FAF8F5] text-zinc-800 hover:border-[#B45309]/45 dark:border-white/12 dark:bg-[#0D0C10] dark:text-zinc-200 dark:hover:border-[#E2A856]/45'
                  }`}
                  style={
                    active
                      ? { backgroundColor: tech.accentColor }
                      : undefined
                  }
                >
                  <Volume2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{tech.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Technique Physiology Card */}
        <div className="rounded-2xl border border-zinc-900/10 bg-[#FAF8F5]/95 p-5 shadow-sm dark:border-white/10 dark:bg-[#0D0C10]/90 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900/10 pb-3.5 dark:border-white/10">
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-[#F5F3EF]">
                {selectedTech.title}
              </h3>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {selectedTech.subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSelectTechnique(selectedTech)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#B45309]/35 bg-[#B45309]/10 px-3.5 py-1.5 text-xs font-semibold text-[#B45309] transition-colors hover:bg-[#B45309]/20 dark:border-[#E2A856]/35 dark:bg-[#E2A856]/15 dark:text-[#E2A856] cursor-pointer"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Звук: {selectedTech.noteLabel.split('(')[0].trim()}</span>
            </button>
          </div>

          <div className="mt-4 space-y-3.5 text-sm leading-relaxed">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#B45309] dark:text-[#E2A856]">
                <Sparkles className="h-3.5 w-3.5" />
                Физиология (что происходит внутри)
              </p>
              <p className="mt-1 text-zinc-700 dark:text-zinc-300">{selectedTech.physiology}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Ощущения в теле
              </p>
              <p className="mt-1 text-zinc-700 dark:text-zinc-300">{selectedTech.sensation}</p>
            </div>

            <div className="rounded-xl border border-zinc-900/8 bg-[#F2EDE6]/80 px-3.5 py-2.5 text-xs text-zinc-600 dark:border-white/8 dark:bg-[#16151C] dark:text-zinc-300">
              <strong className="text-zinc-900 dark:text-[#F5F3EF]">Где применяется:</strong>{' '}
              {selectedTech.usage}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
