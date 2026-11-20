"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";

/**
 * MEGA 3D HOLOGRAPHIC ARENA
 * Complete 360° multi-tier cyber-arena with VIP Floor, Lower Stalls, Upper Balcony,
 * 3D stage with animated audio equalizers, swinging overhead lasers, preset camera directors,
 * sightline & acoustics telemetry, smart AI seat-picker, and quantum seat locking.
 */
export default function HologramAuditorium({
  seats = [],
  selectedSeats = [],
  onToggleSeat,
  hold = null,
  disabled = false,
  colorScheme = "cyan"
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Camera & Orbit State
  const [pitch, setPitch] = useState(0.48);
  const [yaw, setYaw] = useState(-0.1);
  const [zoom, setZoom] = useState(1.0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [laserShow, setLaserShow] = useState(true);
  const [activePreset, setActivePreset] = useState("center");
  const [activeSector, setActiveSector] = useState("ALL");
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [holoTheme, setHoloTheme] = useState(colorScheme);
  const [performerMode, setPerformerMode] = useState("singing"); // "singing" | "dj" | "hype"
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioCtxRef = useRef(null);

  // Web Audio Synthwave Arena Rhythm
  const toggleArenaAudio = () => {
    if (isPlayingAudio) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => { });
        audioCtxRef.current = null;
      }
      setIsPlayingAudio(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Synth Bass Oscillator
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(82, ctx.currentTime); // low E bass

        // LFO pulse for electronic rhythm
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(2.2, ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.06, ctx.currentTime);

        lfo.connect(gain.gain);
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        lfo.start();
        setIsPlayingAudio(true);
      } catch (e) {
        console.error("Audio initialization", e);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => { });
      }
    };
  }, []);

  // Interaction tracking refs
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const hoveredSeatRef = useRef(null);
  const selectedSeatsRef = useRef(selectedSeats);
  selectedSeatsRef.current = selectedSeats;
  const seatsCacheRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const timeRef = useRef(0);

  // Color Palettes
  const palettes = {
    cyan: {
      primary: "#00f6ff",
      secondary: "#0077ff",
      accent: "#00ffaa",
      glow: "rgba(0, 246, 255, 0.65)",
      beam: "rgba(0, 246, 255, 0.15)",
      ring: "rgba(0, 246, 255, 0.4)",
      wire: "rgba(0, 246, 255, 0.25)",
      laser1: "rgba(0, 246, 255, 0.7)",
      laser2: "rgba(189, 0, 255, 0.6)",
      text: "#00f6ff"
    },
    purple: {
      primary: "#c026d3",
      secondary: "#9333ea",
      accent: "#f43f5e",
      glow: "rgba(192, 38, 211, 0.65)",
      beam: "rgba(192, 38, 211, 0.15)",
      ring: "rgba(192, 38, 211, 0.4)",
      wire: "rgba(192, 38, 211, 0.25)",
      laser1: "rgba(236, 72, 153, 0.7)",
      laser2: "rgba(147, 51, 234, 0.6)",
      text: "#e879f9"
    },
    emerald: {
      primary: "#10b981",
      secondary: "#06b6d4",
      accent: "#84cc16",
      glow: "rgba(16, 185, 129, 0.65)",
      beam: "rgba(16, 185, 129, 0.15)",
      ring: "rgba(16, 185, 129, 0.4)",
      wire: "rgba(16, 185, 129, 0.25)",
      laser1: "rgba(16, 185, 129, 0.7)",
      laser2: "rgba(6, 182, 212, 0.6)",
      text: "#34d399"
    }
  };

  const theme = palettes[holoTheme] || palettes.cyan;

  // Build Multi-Tier Arena Seating Geometry
  // If parent passed seats, map them; otherwise generate a full 70-seat multi-tier arena
  useEffect(() => {
    const rawSeats = seats.length > 0 ? seats : Array.from({ length: 70 }, (_, i) => ({
      id: i + 1,
      seat_number: `${String.fromCharCode(65 + Math.floor(i / 10))}${String((i % 10) + 1).padStart(2, "0")}`,
      status: [5, 11, 23, 34, 48, 59].includes(i) ? "booked" : [8, 19, 41].includes(i) ? "held" : "available"
    }));

    const cached = [];
    rawSeats.forEach((seat, index) => {
      const rowIndex = Math.floor(index / 10);
      const colIndex = index % 10;
      const rowLetter = String.fromCharCode(65 + rowIndex);

      let sector = "STALLS";
      let price = 1499;
      let radius = 230;
      let yElev = 0;
      let angleSpread = Math.PI / 3.2;

      // Tier 1: Rows A-B (VIP Floor Pit)
      if (rowIndex < 2) {
        sector = "VIP";
        price = 2499;
        radius = 140 + rowIndex * 35;
        yElev = 25 - rowIndex * 5;
        angleSpread = Math.PI / 3.8;
      }
      // Tier 2: Rows C-E (Club Stalls)
      else if (rowIndex < 5) {
        sector = "STALLS";
        price = 1499;
        radius = 240 + (rowIndex - 2) * 44;
        yElev = -15 - (rowIndex - 2) * 25;
        angleSpread = Math.PI / 3.2;
      }
      // Tier 3: Rows F-G (Upper Balcony)
      else {
        sector = "BALCONY";
        price = 899;
        radius = 380 + (rowIndex - 5) * 48;
        yElev = -95 - (rowIndex - 5) * 32;
        angleSpread = Math.PI / 2.8;
      }

      const normalizedCol = (colIndex - 4.5) / 4.5;
      const angle = normalizedCol * angleSpread;

      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius - 110;
      const y = yElev;

      // Sightline metrics
      const distFromStage = Math.round(Math.sqrt(x * x + (z + 110) * (z + 110)) * 0.1);
      const sightlineScore = Math.max(82, Math.min(99, 100 - distFromStage * 1.8));

      cached.push({
        ...seat,
        x3d: x,
        y3d: y,
        z3d: z,
        sector,
        price,
        rowLetter,
        seatNum: colIndex + 1,
        distFromStage,
        sightlineScore
      });
    });

    seatsCacheRef.current = cached;
  }, [seats]);

  // Camera Presets
  const applyPreset = (presetName) => {
    setActivePreset(presetName);
    setAutoRotate(false);

    if (presetName === "center") {
      setPitch(0.48);
      setYaw(-0.1);
      setZoom(1.0);
    } else if (presetName === "vip") {
      setPitch(0.25);
      setYaw(0.05);
      setZoom(1.42);
    } else if (presetName === "skybox") {
      setPitch(1.05);
      setYaw(0.0);
      setZoom(0.82);
    } else if (presetName === "stage") {
      // Perspective looking outward from the stage
      setPitch(0.28);
      setYaw(Math.PI - 0.15);
      setZoom(1.1);
    } else if (presetName === "side") {
      setPitch(0.42);
      setYaw(0.75);
      setZoom(1.1);
    }
  };

  // Smart AI Seat Match (Picks best 2 consecutive available seats)
  const handleSmartMatch = () => {
    const available = seatsCacheRef.current.filter(
      (s) => s.status === "available" && !selectedSeatsRef.current.includes(s.id)
    );

    if (available.length === 0) {
      alert("No available seats left in the arena.");
      return;
    }

    // Sort by sightline score
    available.sort((a, b) => b.sightlineScore - a.sightlineScore);

    // Look for adjacent pairs in same row
    let pair = [];
    for (let i = 0; i < available.length; i++) {
      const match = available.find(
        (s) => s.rowLetter === available[i].rowLetter && Math.abs(s.seatNum - available[i].seatNum) === 1
      );
      if (match) {
        pair = [available[i], match];
        break;
      }
    }

    const picks = pair.length === 2 ? pair : available.slice(0, 2);
    picks.forEach((seat) => onToggleSeat(seat));
  };

  // 3D Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 900);
    let height = (canvas.height = 580);

    const handleResize = () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 580;
      }
    };
    window.addEventListener("resize", handleResize);

    // Ambient Hologram Photons
    const photons = Array.from({ length: 60 }, () => ({
      x: (Math.random() - 0.5) * 700,
      y: (Math.random() - 0.5) * 350,
      z: (Math.random() - 0.5) * 700,
      vy: -0.4 - Math.random() * 0.6,
      size: 1 + Math.random() * 2.2
    }));

    // Equalizer frequencies simulation
    const eqBars = Array.from({ length: 24 }, () => Math.random());

    const render = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Auto rotation
      let currentYaw = yaw;
      if (autoRotate && !isDraggingRef.current) {
        currentYaw += 0.004;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 35;
      const focal = 660 * zoom;

      // 3D Projection Matrix
      const project = (x, y, z) => {
        // Yaw
        const cosY = Math.cos(currentYaw);
        const sinY = Math.sin(currentYaw);
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;

        // Pitch
        const cosP = Math.cos(pitch);
        const sinP = Math.sin(pitch);
        const y2 = y * cosP - z1 * sinP;
        const z2 = y * sinP + z1 * cosP + 520;

        if (z2 <= 20) return null;
        const scale = focal / z2;
        return {
          sx: cx + x1 * scale,
          sy: cy + y2 * scale,
          scale,
          depth: z2
        };
      };

      // 1. Draw Hologram Base Pedestal & Arena Grid Floor
      const baseCenter = project(0, 140, 0);
      if (baseCenter) {
        // Upward Conical Hologram Projection Light Beam
        const coneGrad = ctx.createRadialGradient(
          baseCenter.sx,
          baseCenter.sy,
          20 * baseCenter.scale,
          baseCenter.sx,
          baseCenter.sy - 320 * baseCenter.scale,
          360 * baseCenter.scale
        );
        coneGrad.addColorStop(0, theme.beam);
        coneGrad.addColorStop(0.6, "rgba(0, 246, 255, 0.03)");
        coneGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(baseCenter.sx - 120 * baseCenter.scale, baseCenter.sy);
        ctx.lineTo(baseCenter.sx + 120 * baseCenter.scale, baseCenter.sy);
        ctx.lineTo(baseCenter.sx + 440 * baseCenter.scale, baseCenter.sy - 380 * baseCenter.scale);
        ctx.lineTo(baseCenter.sx - 440 * baseCenter.scale, baseCenter.sy - 380 * baseCenter.scale);
        ctx.closePath();
        ctx.fillStyle = coneGrad;
        ctx.fill();
        ctx.restore();

        // Multi-tier Emitter Rings on Floor
        for (let r = 90; r <= 460; r += 90) {
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2; a += 0.08) {
            const rx = Math.sin(a + t * (r % 180 === 0 ? 0.25 : -0.2)) * r;
            const rz = Math.cos(a + t * (r % 180 === 0 ? 0.25 : -0.2)) * (r * 0.45);
            const p = project(rx, 140, rz);
            if (p) {
              if (a === 0) ctx.moveTo(p.sx, p.sy);
              else ctx.lineTo(p.sx, p.sy);
            }
          }
          ctx.closePath();
          ctx.strokeStyle = r === 270 ? theme.primary : theme.ring;
          ctx.lineWidth = r === 270 ? 1.6 : 0.8;
          ctx.stroke();
        }
      }

      // 2. Ambient Photons
      photons.forEach((pt) => {
        pt.y += pt.vy;
        if (pt.y < -220) pt.y = 140;

        const p = project(pt.x, pt.y, pt.z);
        if (p) {
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, pt.size * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = theme.primary;
          ctx.globalAlpha = Math.min(1, Math.max(0.1, (160 - pt.y) / 260)) * 0.75;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      });

      // 3. Dynamic Overhead Laser Spotlights
      if (laserShow) {
        ctx.save();
        const laserSourceL = project(-180, -220, -120);
        const laserSourceR = project(180, -220, -120);

        const targetSweepX1 = Math.sin(t * 1.5) * 320;
        const targetSweepZ1 = Math.cos(t * 1.2) * 200 + 80;
        const laserTargetL = project(targetSweepX1, 80, targetSweepZ1);

        const targetSweepX2 = Math.cos(t * 1.8) * 320;
        const targetSweepZ2 = Math.sin(t * 1.4) * 200 + 80;
        const laserTargetR = project(targetSweepX2, 80, targetSweepZ2);

        if (laserSourceL && laserTargetL) {
          ctx.beginPath();
          ctx.moveTo(laserSourceL.sx, laserSourceL.sy);
          ctx.lineTo(laserTargetL.sx, laserTargetL.sy);
          ctx.strokeStyle = theme.laser1;
          ctx.lineWidth = 2.4 * laserSourceL.scale;
          ctx.shadowColor = theme.primary;
          ctx.shadowBlur = 18;
          ctx.stroke();
        }

        if (laserSourceR && laserTargetR) {
          ctx.beginPath();
          ctx.moveTo(laserSourceR.sx, laserSourceR.sy);
          ctx.lineTo(laserTargetR.sx, laserTargetR.sy);
          ctx.strokeStyle = theme.laser2;
          ctx.lineWidth = 2.4 * laserSourceR.scale;
          ctx.shadowColor = "#bd00ff";
          ctx.shadowBlur = 18;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. Center Stage & Holographic Soundwave Equalizer
      const stageP1 = project(-160, 20, -140);
      const stageP2 = project(160, 20, -140);
      const stageP3 = project(190, 40, -50);
      const stageP4 = project(-190, 40, -50);

      if (stageP1 && stageP2 && stageP3 && stageP4) {
        // Stage floor
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(stageP1.sx, stageP1.sy);
        ctx.lineTo(stageP2.sx, stageP2.sy);
        ctx.lineTo(stageP3.sx, stageP3.sy);
        ctx.lineTo(stageP4.sx, stageP4.sy);
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 246, 255, 0.12)";
        ctx.strokeStyle = theme.primary;
        ctx.lineWidth = 2;
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        // 3D Stage Backdrop Screen
        const screenTopL = project(-140, -100, -145);
        const screenTopR = project(140, -100, -145);
        if (screenTopL && screenTopR) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(screenTopL.sx, screenTopL.sy);
          ctx.lineTo(screenTopR.sx, screenTopR.sy);
          ctx.lineTo(stageP2.sx, stageP2.sy);
          ctx.lineTo(stageP1.sx, stageP1.sy);
          ctx.closePath();
          ctx.fillStyle = "rgba(4, 12, 32, 0.85)";
          ctx.strokeStyle = "rgba(0, 246, 255, 0.4)";
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          // Stage Live Equalizer Bars
          const barCount = 20;
          for (let b = 0; b < barCount; b++) {
            const frac = b / (barCount - 1);
            const bx = -120 + frac * 240;
            const freq = Math.sin(t * 4 + b * 0.8) * 0.5 + 0.5;
            const barHeight = 15 + freq * 45;

            const bBot = project(bx, 15, -144);
            const bTop = project(bx, 15 - barHeight, -144);

            if (bBot && bTop) {
              ctx.beginPath();
              ctx.moveTo(bBot.sx, bBot.sy);
              ctx.lineTo(bTop.sx, bTop.sy);
              ctx.strokeStyle = b % 2 === 0 ? theme.primary : "#bd00ff";
              ctx.lineWidth = 4 * bBot.scale;
              ctx.stroke();
            }
          }

          // Stage Center Hologram Text
          const stageCenterP = project(0, -35, -140);
          if (stageCenterP) {
            ctx.font = `bold ${Math.round(15 * stageCenterP.scale)}px sans-serif`;
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.shadowColor = theme.primary;
            ctx.shadowBlur = 15;
            ctx.fillText("◈ LOCKONCE QUANTUM STAGE ◈", stageCenterP.sx, stageCenterP.sy);
            ctx.shadowBlur = 0;
          }
          ctx.restore();
        }

        // 4b. 3D Holographic Performing Artist on Center Stage
        const artistBaseX = 0;
        const artistBaseZ = -95;
        const artistBaseY = 25; // on stage surface

        // Dynamic motion curves based on time & performer mode
        const beatBounce = Math.sin(t * 7) * 3;
        const micWave = Math.sin(t * 3.5) * 12;
        const crowdPump = Math.cos(t * 4.2) * 15;

        // Direct Overhead Holographic Spotlight on Performer
        const spotLightTop = project(0, -170, -95);
        const spotLightFloor = project(0, artistBaseY, -95);

        if (spotLightTop && spotLightFloor) {
          ctx.save();
          const spotGrad = ctx.createRadialGradient(
            spotLightFloor.sx, spotLightFloor.sy, 6 * spotLightFloor.scale,
            spotLightFloor.sx, spotLightFloor.sy, 65 * spotLightFloor.scale
          );
          spotGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
          spotGrad.addColorStop(0.3, "rgba(0, 246, 255, 0.35)");
          spotGrad.addColorStop(0.8, "rgba(189, 0, 255, 0.15)");
          spotGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.beginPath();
          ctx.moveTo(spotLightTop.sx, spotLightTop.sy);
          ctx.lineTo(spotLightFloor.sx - 60 * spotLightFloor.scale, spotLightFloor.sy);
          ctx.lineTo(spotLightFloor.sx + 60 * spotLightFloor.scale, spotLightFloor.sy);
          ctx.closePath();
          ctx.fillStyle = spotGrad;
          ctx.fill();

          // Spotlight floor ring
          ctx.beginPath();
          ctx.ellipse(
            spotLightFloor.sx, spotLightFloor.sy,
            42 * spotLightFloor.scale, 16 * spotLightFloor.scale,
            0, 0, Math.PI * 2
          );
          ctx.strokeStyle = "#00f6ff";
          ctx.lineWidth = 1.5;
          ctx.shadowColor = "#00f6ff";
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.restore();
        }

        // Performer 3D Skeleton & Holographic Avatar
        const headY = artistBaseY - 58 + beatBounce;
        const chestY = artistBaseY - 38 + beatBounce * 0.7;
        const waistY = artistBaseY - 20;

        const pHead = project(artistBaseX, headY, artistBaseZ);
        const pChest = project(artistBaseX, chestY, artistBaseZ);
        const pWaist = project(artistBaseX, waistY, artistBaseZ);
        const pFootL = project(artistBaseX - 10, artistBaseY, artistBaseZ);
        const pFootR = project(artistBaseX + 10, artistBaseY, artistBaseZ);

        // Animated Arms
        const pElbowL = project(artistBaseX - 18, chestY + 5, artistBaseZ - 5);
        const pHandL = project(artistBaseX - 22 + micWave, chestY - 14, artistBaseZ + 10);

        const pElbowR = project(artistBaseX + 18, chestY + 2, artistBaseZ - 5);
        const pHandR = project(artistBaseX + 24, chestY - 26 + crowdPump, artistBaseZ + 15);

        if (pHead && pChest && pWaist && pFootL && pFootR) {
          ctx.save();
          ctx.shadowColor = "#00f6ff";
          ctx.shadowBlur = 18;
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2.4 * pChest.scale;
          ctx.lineCap = "round";

          // Legs
          ctx.beginPath();
          ctx.moveTo(pFootL.sx, pFootL.sy);
          ctx.lineTo(pWaist.sx - 4 * pWaist.scale, pWaist.sy);
          ctx.lineTo(pChest.sx, pChest.sy);
          ctx.lineTo(pWaist.sx + 4 * pWaist.scale, pWaist.sy);
          ctx.lineTo(pFootR.sx, pFootR.sy);
          ctx.strokeStyle = "#00f6ff";
          ctx.stroke();

          // Left Arm (holding mic)
          if (pElbowL && pHandL) {
            ctx.beginPath();
            ctx.moveTo(pChest.sx - 6 * pChest.scale, pChest.sy - 5 * pChest.scale);
            ctx.lineTo(pElbowL.sx, pElbowL.sy);
            ctx.lineTo(pHandL.sx, pHandL.sy);
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            // Microphone
            ctx.beginPath();
            ctx.arc(pHandL.sx, pHandL.sy, 3.5 * pHandL.scale, 0, Math.PI * 2);
            ctx.fillStyle = "#ffd700";
            ctx.fill();

            // Sound pulse waves radiating from microphone
            const pulseRadius = ((t * 30) % 35) * pHandL.scale;
            ctx.beginPath();
            ctx.arc(pHandL.sx, pHandL.sy, pulseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 246, 255, ${Math.max(0, 1 - pulseRadius / (35 * pHandL.scale))})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }

          // Right Arm (hyping the crowd)
          if (pElbowR && pHandR) {
            ctx.beginPath();
            ctx.moveTo(pChest.sx + 6 * pChest.scale, pChest.sy - 5 * pChest.scale);
            ctx.lineTo(pElbowR.sx, pElbowR.sy);
            ctx.lineTo(pHandR.sx, pHandR.sy);
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            // Hand glow
            ctx.beginPath();
            ctx.arc(pHandR.sx, pHandR.sy, 3 * pHandR.scale, 0, Math.PI * 2);
            ctx.fillStyle = "#bd00ff";
            ctx.fill();
          }

          // Torso / Jacket Hologram Mesh
          ctx.beginPath();
          ctx.moveTo(pChest.sx - 9 * pChest.scale, pChest.sy - 6 * pChest.scale);
          ctx.lineTo(pChest.sx + 9 * pChest.scale, pChest.sy - 6 * pChest.scale);
          ctx.lineTo(pWaist.sx + 6 * pWaist.scale, pWaist.sy);
          ctx.lineTo(pWaist.sx - 6 * pWaist.scale, pWaist.sy);
          ctx.closePath();
          ctx.fillStyle = "rgba(0, 246, 255, 0.35)";
          ctx.strokeStyle = "#00f6ff";
          ctx.fill();
          ctx.stroke();

          // Artist Head (Glowing Sphere & Aura Halo)
          const headRadius = 7.5 * pHead.scale;
          ctx.beginPath();
          ctx.arc(pHead.sx, pHead.sy, headRadius, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 20;
          ctx.fill();

          // Golden Aura Ring above Head
          ctx.beginPath();
          ctx.ellipse(
            pHead.sx, pHead.sy - headRadius - 5 * pHead.scale,
            12 * pHead.scale, 4 * pHead.scale,
            0, 0, Math.PI * 2
          );
          ctx.strokeStyle = "#ffd700";
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Floating Artist Live HUD Telemetry Tag
          const tagY = pHead.sy - headRadius - 28 * pHead.scale;
          ctx.font = `bold ${Math.max(9, Math.round(11 * pHead.scale))}px monospace`;
          ctx.fillStyle = "#00f6ff";
          ctx.textAlign = "center";
          ctx.fillText("✦ QUANTUM STAGE HEADLINER ✦", pHead.sx, tagY);

          const modeText =
            performerMode === "dj"
              ? "● CYBER DJ • LIVE BASS MATRIX"
              : performerMode === "hype"
                ? "● STAGE MC • HYPER ENERGY"
                : "● LIVE VOCALIST • 3D SPATIAL AUDIO";

          ctx.font = `${Math.max(8, Math.round(9 * pHead.scale))}px sans-serif`;
          ctx.fillStyle = "#ffd700";
          ctx.fillText(modeText, pHead.sx, tagY + 12 * pHead.scale);

          ctx.restore();
        }
      }

      // 5. Render 3D Seats (Sorted depth back-to-front)
      const seatDrawList = [];
      const currentHovered = hoveredSeatRef.current;
      const selectedIds = selectedSeatsRef.current || [];

      seatsCacheRef.current.forEach((seat) => {
        // Sector Filter check
        if (activeSector !== "ALL" && seat.sector !== activeSector) return;

        const p = project(seat.x3d, seat.y3d, seat.z3d);
        if (!p) return;

        const isSelected = selectedIds.includes(seat.id);
        const isHovered = currentHovered === seat.id;
        const isHeld = seat.status === "held";
        const isBooked = seat.status === "booked";

        seatDrawList.push({
          seat,
          p,
          isSelected,
          isHovered,
          isHeld,
          isBooked,
          depth: p.depth
        });
      });

      // Sort furthest to nearest
      seatDrawList.sort((a, b) => b.depth - a.depth);

      seatDrawList.forEach(({ seat, p, isSelected, isHovered, isHeld, isBooked }) => {
        const chairW = Math.max(14, 28 * p.scale);
        const chairH = Math.max(16, 32 * p.scale);

        // Store Hitbox for raycast clicks
        seat._hitbox = {
          x: p.sx - chairW / 2,
          y: p.sy - chairH / 2,
          w: chairW,
          h: chairH
        };

        // Determine Theme Color
        let strokeColor = theme.primary;
        let fillColor = "rgba(0, 246, 255, 0.16)";
        let glowColor = theme.glow;

        if (isBooked) {
          strokeColor = "#ef4444";
          fillColor = "rgba(239, 68, 68, 0.28)";
          glowColor = "rgba(239, 68, 68, 0.5)";
        } else if (isHeld) {
          strokeColor = "#f59e0b";
          fillColor = "rgba(245, 158, 11, 0.32)";
          glowColor = "rgba(245, 158, 11, 0.6)";
        } else if (isSelected) {
          strokeColor = "#10b981";
          fillColor = "rgba(16, 185, 129, 0.55)";
          glowColor = "rgba(16, 185, 129, 0.9)";
        } else if (isHovered) {
          strokeColor = "#ffffff";
          fillColor = theme.glow;
          glowColor = "#ffffff";
        } else if (seat.sector === "VIP") {
          // Special Gold/Cyan styling for VIP Floor
          strokeColor = "#facc15";
          fillColor = "rgba(250, 204, 21, 0.2)";
        }

        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isSelected || isHovered ? 20 : 7;

        const rx = p.sx - chairW / 2;
        const ry = p.sy - chairH / 2;

        // Chair Backrest
        ctx.beginPath();
        ctx.roundRect(rx, ry, chairW, chairH * 0.6, 4 * p.scale);
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isSelected || isHovered ? 2.5 : 1.3;
        ctx.fill();
        ctx.stroke();

        // Chair Base
        ctx.beginPath();
        ctx.roundRect(rx + 2, ry + chairH * 0.42, chairW - 4, chairH * 0.5, 3 * p.scale);
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();

        // Pulsing quantum rings around selected seats
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, (chairW * 0.85) + Math.sin(t * 8) * 3, 0, Math.PI * 2);
          ctx.strokeStyle = "#10b981";
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }

        // Seat Label
        if (p.scale > 0.65) {
          ctx.font = `bold ${Math.max(8, Math.round(10 * p.scale))}px monospace`;
          ctx.fillStyle = isBooked ? "#fca5a5" : "#ffffff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(seat.seat_number, p.sx, p.sy - 2);
        }

        ctx.restore();
      });

      // 6. Hologram Scanning Plane Line
      const scanY = ((t * 130) % (height + 120)) - 60;
      const scanGrad = ctx.createLinearGradient(0, scanY - 35, 0, scanY + 35);
      scanGrad.addColorStop(0, "rgba(0, 246, 255, 0)");
      scanGrad.addColorStop(0.5, "rgba(0, 246, 255, 0.2)");
      scanGrad.addColorStop(1, "rgba(0, 246, 255, 0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 35, width, 70);

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [pitch, yaw, zoom, autoRotate, laserShow, holoTheme, activeSector, theme]);

  // Mouse Orbit Handlers
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      setYaw((y) => y + dx * 0.008);
      setPitch((p) => Math.max(0.1, Math.min(1.4, p + dy * 0.006)));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      setActivePreset("custom");
      return;
    }

    // Raycast hit-test
    let found = null;
    for (let i = seatsCacheRef.current.length - 1; i >= 0; i--) {
      const s = seatsCacheRef.current[i];
      if (s._hitbox) {
        const { x, y, w, h } = s._hitbox;
        if (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h) {
          found = s;
          break;
        }
      }
    }

    hoveredSeatRef.current = found ? found.id : null;
    setHoveredSeat(found);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = () => {
    if (disabled || hold) return;
    if (hoveredSeat && hoveredSeat.status === "available") {
      onToggleSeat(hoveredSeat);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.65, Math.min(1.8, z - e.deltaY * 0.0012)));
  };

  return (
    <div className="mega-arena-wrapper" ref={containerRef}>
      {/* HUD Telemetry Top Bar */}
      <div className="arena-telemetry-bar">
        <div className="telemetry-col-left">
          <span className="arena-live-pulse"></span>
          <div>
            <strong>3D QUANTUM MEGA ARENA</strong>
            <small>MULTI-TIER VENUE MATRIX • 70 SEATS</small>
          </div>
        </div>

        {/* Sector Tier Filter Tabs */}
        <div className="sector-filter-tabs">
          <button
            type="button"
            className={`sector-tab ${activeSector === "ALL" ? "active" : ""}`}
            onClick={() => setActiveSector("ALL")}
          >
            All Sectors (70)
          </button>
          <button
            type="button"
            className={`sector-tab vip ${activeSector === "VIP" ? "active" : ""}`}
            onClick={() => setActiveSector("VIP")}
          >
            ★ VIP Pit (₹2,499)
          </button>
          <button
            type="button"
            className={`sector-tab stalls ${activeSector === "STALLS" ? "active" : ""}`}
            onClick={() => setActiveSector("STALLS")}
          >
            Club Stalls (₹1,499)
          </button>
          <button
            type="button"
            className={`sector-tab balcony ${activeSector === "BALCONY" ? "active" : ""}`}
            onClick={() => setActiveSector("BALCONY")}
          >
            Balcony (₹899)
          </button>
        </div>

        {/* Action Controls */}
        <div className="arena-top-actions">
          <button
            type="button"
            className={`audio-toggle-btn ${isPlayingAudio ? "active" : ""}`}
            onClick={toggleArenaAudio}
            title="Toggle Live Cyber Arena Synthwave Rhythm"
          >
            {isPlayingAudio ? "🔊 Synth Beat: ON" : "🔇 Synth Beat: OFF"}
          </button>

          <button
            type="button"
            className="smart-match-button"
            onClick={handleSmartMatch}
            title="Automatically lock the best 2 adjacent seats with optimal sightlines"
          >
            ✦ Smart AI Best Match
          </button>

          <button
            type="button"
            className={`laser-toggle-btn ${laserShow ? "active" : ""}`}
            onClick={() => setLaserShow(!laserShow)}
            title="Toggle Stage Lasers"
          >
            ⚡ Lasers {laserShow ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Camera Director Preset Angle Bar */}
      <div className="camera-director-bar">
        <span className="director-label">🎥 CAMERA VIEW:</span>
        <div className="camera-pill-group">
          <button
            type="button"
            className={`cam-pill ${activePreset === "center" ? "active" : ""}`}
            onClick={() => applyPreset("center")}
          >
            🎬 Center Stage
          </button>
          <button
            type="button"
            className={`cam-pill ${activePreset === "vip" ? "active" : ""}`}
            onClick={() => applyPreset("vip")}
          >
            👑 VIP Front Row
          </button>
          <button
            type="button"
            className={`cam-pill ${activePreset === "skybox" ? "active" : ""}`}
            onClick={() => applyPreset("skybox")}
          >
            🦅 Skybox Drone
          </button>
          <button
            type="button"
            className={`cam-pill ${activePreset === "stage" ? "active" : ""}`}
            onClick={() => applyPreset("stage")}
          >
            🎤 Artist Stage View
          </button>
          <button
            type="button"
            className={`cam-pill ${activePreset === "side" ? "active" : ""}`}
            onClick={() => applyPreset("side")}
          >
            ⌖ Angled Side
          </button>
          <button
            type="button"
            className={`cam-pill auto ${autoRotate ? "active" : ""}`}
            onClick={() => setAutoRotate(!autoRotate)}
          >
            {autoRotate ? "⏸ Pause Orbit" : "⟲ 360° Orbit"}
          </button>
        </div>

        {/* Performer Mode Switcher */}
        <div className="performer-pill-group">
          <span className="performer-group-label">STAGE:</span>
          <button
            type="button"
            className={`cam-pill performer-pill ${performerMode === "singing" ? "active" : ""}`}
            onClick={() => setPerformerMode("singing")}
            title="Vocalist Mode"
          >
            🎤 Vocalist
          </button>
          <button
            type="button"
            className={`cam-pill performer-pill ${performerMode === "dj" ? "active" : ""}`}
            onClick={() => setPerformerMode("dj")}
            title="Cyber DJ Mode"
          >
            🎧 Cyber DJ
          </button>
          <button
            type="button"
            className={`cam-pill performer-pill ${performerMode === "hype" ? "active" : ""}`}
            onClick={() => setPerformerMode("hype")}
            title="Crowd Hype Mode"
          >
            ⚡ Hype MC
          </button>
        </div>

        {/* Hologram Theme Chooser */}
        <div className="theme-pill-group">
          <button
            type="button"
            className={`theme-dot-btn cyan ${holoTheme === "cyan" ? "active" : ""}`}
            onClick={() => setHoloTheme("cyan")}
            title="Cyan Matrix"
          ></button>
          <button
            type="button"
            className={`theme-dot-btn purple ${holoTheme === "purple" ? "active" : ""}`}
            onClick={() => setHoloTheme("purple")}
            title="Neon Violet"
          ></button>
          <button
            type="button"
            className={`theme-dot-btn emerald ${holoTheme === "emerald" ? "active" : ""}`}
            onClick={() => setHoloTheme("emerald")}
            title="Quantum Emerald"
          ></button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div
        className="arena-canvas-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} className="arena-3d-canvas" />

        {/* Ambient Sci-Fi Viewport HUD Frame */}
        <div className="arena-hud-corner corner-top-left"></div>
        <div className="arena-hud-corner corner-top-right"></div>
        <div className="arena-hud-corner corner-bottom-left"></div>
        <div className="arena-hud-corner corner-bottom-right"></div>
        <div className="arena-crosshair-center"></div>

        {/* Hovered Seat Telemetry HUD Tooltip */}
        {hoveredSeat && (
          <div
            className="arena-seat-hud-panel"
            style={{
              left: `${hoveredSeat._hitbox?.x + hoveredSeat._hitbox?.w / 2}px`,
              top: `${Math.max(20, (hoveredSeat._hitbox?.y || 100) - 105)}px`
            }}
          >
            <div className="hud-panel-header">
              <span className="hud-badge-sector">{hoveredSeat.sector} TIER</span>
              <span className="hud-seat-code">{hoveredSeat.seat_number}</span>
              <span className="hud-price-badge">₹{hoveredSeat.price}</span>
            </div>

            <div className="hud-metric-row">
              <div className="metric-item">
                <small>SIGHTLINE</small>
                <strong>{hoveredSeat.sightlineScore}% CLEAR</strong>
              </div>
              <div className="metric-item">
                <small>STAGE DISTANCE</small>
                <strong>{hoveredSeat.distFromStage} METERS</strong>
              </div>
            </div>

            <div className="hud-panel-footer">
              <span className={`status-pill ${hoveredSeat.status}`}>
                ● {hoveredSeat.status.toUpperCase()}
              </span>
              <small>Click to {selectedSeats.includes(hoveredSeat.id) ? "DESELECT" : "LOCK SEAT"}</small>
            </div>
          </div>
        )}

        {/* Bottom Interactive Guidance Pill */}
        <div className="arena-bottom-guidance">
          <span>◈ DRAG to Orbit 360°</span>
          <span>• SCROLL to Zoom in/out</span>
          <span>• CLICK any chair to Lock</span>
        </div>
      </div>
    </div>
  );
}
