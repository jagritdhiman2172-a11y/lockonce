"use client";

import React, { useEffect, useRef } from "react";

/**
 * Full-screen 3D Holographic Cyber Background
 * Renders an infinite 3D perspective cyber grid, floating 3D holographic wireframe polyhedra,
 * volumetric light beams, and upward streaming photon particles.
 */
export default function HologramBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse parallax tracking
    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Floating 3D Holographic Wireframe Cubes / Polyhedra
    const cubes = Array.from({ length: 9 }, (_, i) => ({
      x: (Math.random() - 0.5) * width * 1.2,
      y: (Math.random() - 0.5) * height * 1.4,
      z: 200 + Math.random() * 600,
      size: 40 + Math.random() * 60,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      rotZ: Math.random() * Math.PI,
      speedX: (Math.random() - 0.5) * 0.015,
      speedY: 0.008 + Math.random() * 0.012,
      speedZ: (Math.random() - 0.5) * 0.01,
      color: i % 3 === 0 ? "#00f0ff" : i % 3 === 1 ? "#bd00ff" : "#00ff88"
    }));

    // Floating Upward Photon Particles
    const particles = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2.2,
      speedY: -0.4 - Math.random() * 0.8,
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: 0.2 + Math.random() * 0.7,
      color: Math.random() > 0.4 ? "#00f0ff" : "#bd00ff"
    }));

    let time = 0;

    const render = () => {
      time += 0.018;
      ctx.clearRect(0, 0, width, height);

      // 1. Deep Space Cyber Gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2 + (mouseX - width / 2) * 0.05,
        height * 0.35 + (mouseY - height / 2) * 0.05,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.85
      );
      bgGrad.addColorStop(0, "rgba(9, 20, 52, 0.4)");
      bgGrad.addColorStop(0.5, "rgba(4, 9, 24, 0.7)");
      bgGrad.addColorStop(1, "rgba(2, 5, 14, 0.95)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. 3D Perspective Hologram Floor Grid
      const horizonY = height * 0.58;
      const fov = 340;
      const gridOffset = (time * 45) % 40;

      ctx.save();
      ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
      ctx.lineWidth = 1;

      // Vertical perspective lines radiating from horizon
      const vpX = width / 2 + (mouseX - width / 2) * 0.08;
      for (let x = -width * 0.8; x <= width * 1.8; x += 70) {
        ctx.beginPath();
        ctx.moveTo(vpX, horizonY);
        ctx.lineTo(x, height + 80);
        ctx.stroke();
      }

      // Horizontal grid lines foreshortened by depth
      for (let d = 30; d < 550; d += 35) {
        const currentD = d + gridOffset;
        const scale = fov / (currentD + fov);
        const y = horizonY + (height - horizonY) * (1 - scale * 0.95);
        if (y >= horizonY && y <= height) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          const alpha = Math.min(0.28, Math.max(0.02, (y - horizonY) / (height - horizonY)));
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          ctx.stroke();
        }
      }
      ctx.restore();

      // 3. Upward Streaming Photons
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      // 4. Floating 3D Holographic Wireframe Cubes
      cubes.forEach((cube) => {
        cube.rotX += cube.speedX;
        cube.rotY += cube.speedY;
        cube.rotZ += cube.speedZ;

        // Vertices of a 3D unit cube
        const s = cube.size;
        const verts = [
          [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
          [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]
        ];

        // 3D Rotation & Perspective Projection
        const projected = verts.map(([vx, vy, vz]) => {
          // Rotate X
          let y1 = vy * Math.cos(cube.rotX) - vz * Math.sin(cube.rotX);
          let z1 = vy * Math.sin(cube.rotX) + vz * Math.cos(cube.rotX);

          // Rotate Y
          let x2 = vx * Math.cos(cube.rotY) + z1 * Math.sin(cube.rotY);
          let z2 = -vx * Math.sin(cube.rotY) + z1 * Math.cos(cube.rotY);

          // Rotate Z
          let x3 = x2 * Math.cos(cube.rotZ) - y1 * Math.sin(cube.rotZ);
          let y3 = x2 * Math.sin(cube.rotZ) + y1 * Math.cos(cube.rotZ);

          const worldX = cube.x + x3;
          const worldY = cube.y + y3;
          const worldZ = cube.z + z2;

          const focal = 500;
          const scale = focal / (focal + worldZ);

          return {
            x: width / 2 + worldX * scale,
            y: height / 2 + worldY * scale,
            scale
          };
        });

        // 12 edges connecting 8 vertices
        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        ctx.save();
        ctx.strokeStyle = cube.color;
        ctx.globalAlpha = 0.22;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = cube.color;
        ctx.shadowBlur = 10;

        edges.forEach(([i1, i2]) => {
          const p1 = projected[i1];
          const p2 = projected[i2];
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        });

        ctx.restore();
      });

      // 5. Ambient Hologram Scan Sweep
      const sweepY = ((time * 80) % (height + 200)) - 100;
      const sweepGrad = ctx.createLinearGradient(0, sweepY, 0, sweepY + 40);
      sweepGrad.addColorStop(0, "rgba(0, 240, 255, 0)");
      sweepGrad.addColorStop(0.5, "rgba(0, 240, 255, 0.04)");
      sweepGrad.addColorStop(1, "rgba(0, 240, 255, 0)");
      ctx.fillStyle = sweepGrad;
      ctx.fillRect(0, sweepY, width, 40);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hologram-background-canvas"
      aria-hidden="true"
    />
  );
}
