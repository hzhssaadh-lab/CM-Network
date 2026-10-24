import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import cmOfficialLogo from '../assets/images/cm_official_logo.jpg';

export function Cinematic3DCoin() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn("WebGL not supported or context lost:", e);
      return;
    }

    // Main Coin Group
    const coinGroup = new THREE.Group();
    // Default tilt like reference
    coinGroup.rotation.x = 0.22;
    coinGroup.rotation.y = -0.35;
    coinGroup.rotation.z = 0.05;
    scene.add(coinGroup);

    let coinTexture: THREE.CanvasTexture | null = null;

    // 1. Procedural Texture Canvas for Coin Faces (Ultra Sharp 1024x1024)
    const createCoinTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const cx = 512;
      const cy = 512;

      // Base background: dark metallic carbon/gold gradient
      const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, 500);
      bgGrad.addColorStop(0, '#1c1503');
      bgGrad.addColorStop(0.55, '#120f04');
      bgGrad.addColorStop(0.85, '#0a0904');
      bgGrad.addColorStop(1, '#1a1403');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 500, 0, Math.PI * 2);
      ctx.fill();

      // Outer gold rim concentric rings
      const goldRings = [
        { r: 490, w: 12, c: '#e5b332' },
        { r: 476, w: 4, c: '#fff2a8' },
        { r: 468, w: 6, c: '#9a7516' },
        { r: 350, w: 8, c: '#e0ac2b' },
        { r: 340, w: 3, c: '#fff6c2' },
        { r: 332, w: 6, c: '#7a5a0c' },
      ];
      goldRings.forEach(ring => {
        ctx.strokeStyle = ring.c;
        ctx.lineWidth = ring.w;
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Beaded border dots between 470 and 460
      const dotCount = 72;
      for (let i = 0; i < dotCount; i++) {
        const angle = (i / dotCount) * Math.PI * 2;
        const dx = cx + Math.cos(angle) * 458;
        const dy = cy + Math.sin(angle) * 458;
        ctx.fillStyle = '#ffdf6d';
        ctx.beginPath();
        ctx.arc(dx, dy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Curved Text: "CM NETWORK" along upper arc
      ctx.save();
      ctx.font = 'bold 44px sans-serif';
      ctx.fillStyle = '#ffdf6d';
      ctx.shadowColor = '#ffeaa7';
      ctx.shadowBlur = 12;
      const topText = "CM NETWORK";
      const startAngleTop = -Math.PI / 2 - 0.48;
      const endAngleTop = -Math.PI / 2 + 0.48;
      const angleStepTop = (endAngleTop - startAngleTop) / (topText.length - 1);
      for (let i = 0; i < topText.length; i++) {
        const char = topText[i];
        const a = startAngleTop + i * angleStepTop;
        ctx.save();
        ctx.translate(cx + Math.cos(a) * 408, cy + Math.sin(a) * 408);
        ctx.rotate(a + Math.PI / 2);
        ctx.fillText(char, -ctx.measureText(char).width / 2, 0);
        ctx.restore();
      }
      ctx.restore();

      // Curved Text: "CRYPTO MINING" along bottom arc
      ctx.save();
      ctx.font = 'bold 40px sans-serif';
      ctx.fillStyle = '#ffdf6d';
      ctx.shadowColor = '#ffeaa7';
      ctx.shadowBlur = 10;
      const bottomText = "CRYPTO MINING";
      const startAngleBot = Math.PI / 2 + 0.52;
      const endAngleBot = Math.PI / 2 - 0.52;
      const angleStepBot = (endAngleBot - startAngleBot) / (bottomText.length - 1);
      for (let i = 0; i < bottomText.length; i++) {
        const char = bottomText[i];
        const a = startAngleBot + i * angleStepBot;
        ctx.save();
        ctx.translate(cx + Math.cos(a) * 408, cy + Math.sin(a) * 408);
        ctx.rotate(a - Math.PI / 2);
        ctx.fillText(char, -ctx.measureText(char).width / 2, 0);
        ctx.restore();
      }
      ctx.restore();

      // 3 Stars on each side
      const drawStar = (x: number, y: number, r: number) => {
        ctx.save();
        ctx.fillStyle = '#ffe58f';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a1 = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const a2 = a1 + Math.PI / 5;
          ctx.lineTo(x + Math.cos(a1) * r, y + Math.sin(a1) * r);
          ctx.lineTo(x + Math.cos(a2) * (r * 0.45), y + Math.sin(a2) * (r * 0.45));
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };

      // Left 3 stars
      drawStar(cx - 400, cy - 25, 12);
      drawStar(cx - 415, cy, 15);
      drawStar(cx - 400, cy + 25, 12);

      // Right 3 stars
      drawStar(cx + 400, cy - 25, 12);
      drawStar(cx + 415, cy, 15);
      drawStar(cx + 400, cy + 25, 12);

      // Inner Emblem: Official CM Network Logo (< > and CM)
      const renderCenterEmblem = (img?: HTMLImageElement) => {
        const emblemR = 252;
        ctx.save();

        // Circular clipping
        ctx.beginPath();
        ctx.arc(cx, cy, emblemR, 0, Math.PI * 2);
        ctx.clip();

        // Dark obsidian bed
        ctx.fillStyle = '#050505';
        ctx.fillRect(cx - emblemR, cy - emblemR, emblemR * 2, emblemR * 2);

        if (img && img.complete && img.naturalWidth > 0) {
          // Draw official CM logo image
          const drawSize = 475;
          ctx.drawImage(img, cx - drawSize / 2, cy - drawSize / 2, drawSize, drawSize);
        } else {
          // High fidelity brushed gold chevron ribbon vector fallback
          ctx.save();
          ctx.translate(cx, cy);

          // Left Chevron Ribbon
          const gradLeftTop = ctx.createLinearGradient(-130, -100, 20, 20);
          gradLeftTop.addColorStop(0, '#fce588');
          gradLeftTop.addColorStop(0.5, '#d49b18');
          gradLeftTop.addColorStop(1, '#ffd700');

          ctx.fillStyle = gradLeftTop;
          ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
          ctx.shadowBlur = 14;

          // Left chevron top wing
          ctx.beginPath();
          ctx.moveTo(10, -120);
          ctx.lineTo(10, -50);
          ctx.lineTo(-75, 5);
          ctx.lineTo(-145, -45);
          ctx.closePath();
          ctx.fill();

          // Left chevron bottom wing
          const gradLeftBot = ctx.createLinearGradient(-145, -45, 10, 70);
          gradLeftBot.addColorStop(0, '#b88114');
          gradLeftBot.addColorStop(1, '#e5b332');
          ctx.fillStyle = gradLeftBot;
          ctx.beginPath();
          ctx.moveTo(-145, -45);
          ctx.lineTo(-75, 5);
          ctx.lineTo(10, 70);
          ctx.lineTo(10, 5);
          ctx.closePath();
          ctx.fill();

          // Right Chevron Ribbon (shifted down)
          const gradRight = ctx.createLinearGradient(30, -50, 160, 120);
          gradRight.addColorStop(0, '#fce588');
          gradRight.addColorStop(0.5, '#d49b18');
          gradRight.addColorStop(1, '#ffd700');
          ctx.fillStyle = gradRight;

          ctx.beginPath();
          ctx.moveTo(30, -50);
          ctx.lineTo(100, 5);
          ctx.lineTo(165, 55);
          ctx.lineTo(165, 120);
          ctx.lineTo(100, 70);
          ctx.lineTo(30, 20);
          ctx.closePath();
          ctx.fill();

          // CM Text
          ctx.font = '900 78px sans-serif';
          ctx.fillStyle = gradLeftTop;
          ctx.fillText('CM', -115, 115);

          ctx.restore();
        }

        ctx.restore();

        // Gold Bezel Rings around Emblem
        ctx.save();
        ctx.strokeStyle = '#e5b332';
        ctx.lineWidth = 10;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(cx, cy, emblemR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#fff2a8';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(cx, cy, emblemR - 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      };

      // Draw initial emblem
      renderCenterEmblem();

      // Load official logo image asset
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = cmOfficialLogo;

      if (logoImg.complete && logoImg.naturalWidth > 0) {
        renderCenterEmblem(logoImg);
      } else {
        logoImg.onload = () => {
          renderCenterEmblem(logoImg);
          if (coinTexture) {
            coinTexture.needsUpdate = true;
          }
        };
      }

      return canvas;
    };

    const coinCanvas = createCoinTexture();
    coinTexture = coinCanvas ? new THREE.CanvasTexture(coinCanvas) : null;
    if (coinTexture) {
      coinTexture.colorSpace = THREE.SRGBColorSpace;
    }

    // Coin Materials
    // Rim material (ribbed/metallic gold edge)
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xffcc33,
      metalness: 0.95,
      roughness: 0.22,
    });

    // Face materials
    const faceMaterial = new THREE.MeshStandardMaterial({
      map: coinTexture,
      metalness: 0.88,
      roughness: 0.25,
      bumpMap: coinTexture,
      bumpScale: 0.05,
    });

    // Coin Mesh (radius: 2.1, height: 0.24, segments: 64)
    const coinGeometry = new THREE.CylinderGeometry(2.15, 2.15, 0.24, 64);
    // Orient cylinder so circular face faces Z
    coinGeometry.rotateX(Math.PI / 2);

    const materials = [
      rimMaterial,  // sides
      faceMaterial, // top / front
      faceMaterial, // bottom / back
    ];

    const coinMesh = new THREE.Mesh(coinGeometry, materials);
    coinGroup.add(coinMesh);

    // 2. Glowing Orbital Rings (Torus)
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.75,
      wireframe: false,
    });

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.45,
    });

    // Large inclined orbital ring 1
    const ringGeo1 = new THREE.TorusGeometry(3.1, 0.022, 16, 120);
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.7;
    ring1.rotation.y = 0.3;
    ringGroup.add(ring1);

    // Orbital ring 2 (angled)
    const ringGeo2 = new THREE.TorusGeometry(3.35, 0.015, 16, 120);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 2.3;
    ring2.rotation.z = -0.4;
    ringGroup.add(ring2);

    // Orbital ring 3 (distant faint)
    const ringGeo3 = new THREE.TorusGeometry(3.6, 0.012, 16, 120);
    const ring3 = new THREE.Mesh(ringGeo3, ringMat2);
    ring3.rotation.x = Math.PI / 3.2;
    ring3.rotation.y = -0.5;
    ringGroup.add(ring3);

    // Glowing satellites/nodes on orbital rings
    const satGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const satMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sat1 = new THREE.Mesh(satGeo, satMat);
    const sat2 = new THREE.Mesh(satGeo, satMat);
    scene.add(sat1);
    scene.add(sat2);

    // 3. Network Constellation Particles & Golden Dust
    const particleCount = 110;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      particleSizes[i] = Math.random() * 3 + 1;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.07,
      transparent: true,
      opacity: 0.65,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Network connection lines between close particles
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.15,
    });
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = particlePositions[i * 3] - particlePositions[j * 3];
        const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
        const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 2.2) {
          linePositions.push(
            particlePositions[i * 3], particlePositions[i * 3 + 1], particlePositions[i * 3 + 2],
            particlePositions[j * 3], particlePositions[j * 3 + 1], particlePositions[j * 3 + 2]
          );
        }
      }
    }
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

    // 4. Lighting Setup (Cinematic Metallic Gold Warmth)
    const ambientLight = new THREE.AmbientLight(0xfff3d4, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 3.2);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xffa500, 4.5, 20);
    rimLight.position.set(-5, -3, 3);
    scene.add(rimLight);

    const goldGlowLight = new THREE.PointLight(0xffd700, 3.0, 15);
    goldGlowLight.position.set(2, -4, 4);
    scene.add(goldGlowLight);

    // Mouse Interaction
    let targetRotX = 0.22;
    let targetRotY = -0.35;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotY = -0.35 + x * 0.45;
      targetRotX = 0.22 - y * 0.35;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth idle rotation + gentle mouse follow
      coinGroup.rotation.y += (targetRotY - coinGroup.rotation.y) * 0.05 + 0.0035;
      coinGroup.rotation.x += (targetRotX - coinGroup.rotation.x) * 0.05;
      coinGroup.position.y = Math.sin(elapsed * 1.5) * 0.12;

      // Orbiting rings rotation
      ring1.rotation.z = elapsed * 0.25;
      ring2.rotation.z = -elapsed * 0.18;
      ring3.rotation.z = elapsed * 0.12;

      // Satellites orbiting along ring 1 & 2
      const satAngle1 = elapsed * 0.9;
      sat1.position.set(
        Math.cos(satAngle1) * 3.1,
        Math.sin(satAngle1) * 3.1 * Math.cos(Math.PI / 2.7),
        Math.sin(satAngle1) * 3.1 * Math.sin(Math.PI / 2.7)
      );

      const satAngle2 = -elapsed * 0.7 + Math.PI;
      sat2.position.set(
        Math.cos(satAngle2) * 3.35,
        Math.sin(satAngle2) * 3.35 * Math.cos(Math.PI / 2.3),
        Math.sin(satAngle2) * 3.35 * Math.sin(Math.PI / 2.3)
      );

      // Slow drift of particle system
      particleSystem.rotation.y = elapsed * 0.02;
      linesMesh.rotation.y = elapsed * 0.02;

      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px] flex items-center justify-center select-none pointer-events-auto">
      {/* Ambient background volumetric gold glow behind the 3D coin */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#FFD700]/25 via-amber-500/15 to-transparent blur-[90px] pointer-events-none" />

      {/* The 3D Three.js Canvas container */}
      <div ref={containerRef} className="w-full h-full relative z-10 cursor-grab active:cursor-grabbing" />

      {/* Vertical typographic tags matching reference design far right */}
      <div className="absolute -right-2 sm:right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col space-y-4 font-mono font-black text-[10px] sm:text-xs tracking-[0.25em] text-[#FFD700]/80">
        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
          <span>MINE</span>
          <span className="text-[#FFD700]">—</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
          <span>EARN</span>
          <span className="text-[#FFD700]">—</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
          <span>TRADE</span>
          <span className="text-[#FFD700]">—</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
          <span>GROW</span>
          <span className="text-[#FFD700]">—</span>
        </div>
      </div>
    </div>
  );
}
