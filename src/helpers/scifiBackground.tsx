"use client";
import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED CANVAS BACKGROUND  (pure CSS + Canvas, zero external libs)
// ─────────────────────────────────────────────────────────────────────────────

export function ScifiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Nodes for the neural-net grid
    const NODE_COUNT = 80;
    type Node = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      pulse: number;
      phase: number;
    };
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      pulse: 0,
      phase: Math.random() * Math.PI * 2,
    }));

    // Horizontal scanlines ticker
    let scanY = 0;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep space gradient
      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bg.addColorStop(0, "#010b18");
      bg.addColorStop(0.5, "#020d1f");
      bg.addColorStop(1, "#010812");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Moving scanline
      scanY = (scanY + 0.6) % canvas.height;
      const scanGrad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
      scanGrad.addColorStop(0, "rgba(37,99,235,0)");
      scanGrad.addColorStop(0.5, "rgba(37,99,235,0.04)");
      scanGrad.addColorStop(1, "rgba(37,99,235,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 40, canvas.width, 80);

      // Horizontal grid lines
      ctx.strokeStyle = "rgba(37,99,235,0.05)";
      ctx.lineWidth = 0.5;
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      // Vertical grid lines
      for (let x = 0; x < canvas.width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Update + draw nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        n.pulse = 0.5 + 0.5 * Math.sin(t * 0.001 + n.phase);
      });

      // Edges between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.25 * nodes[i].pulse;
            ctx.strokeStyle = `rgba(37,99,235,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Node dots
      nodes.forEach((n) => {
        const r = 2 + n.pulse * 2;
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
        glow.addColorStop(0, `rgba(96,165,250,${0.6 * n.pulse})`);
        glow.addColorStop(1, "rgba(37,99,235,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(147,197,253,${0.8 * n.pulse})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });

      // Corner HUD brackets
      const drawBracket = (x: number, y: number, flip: boolean) => {
        const s = flip ? -1 : 1;
        const len = 40;
        ctx.strokeStyle = "rgba(37,99,235,0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + s * len, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + s * len);
        ctx.stroke();
      };
      drawBracket(20, 20, false);
      drawBracket(canvas.width - 20, 20, true);
      drawBracket(20, canvas.height - 20, false);
      drawBracket(canvas.width - 20, canvas.height - 20, true);

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
