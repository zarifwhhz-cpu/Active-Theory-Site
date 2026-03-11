import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  opacityTarget: number;
  opacitySpeed: number;
}

export function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    let mouse = { x: width / 2, y: height / 2 };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const createParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.4,
      opacityTarget: Math.random() * 0.5 + 0.05,
      opacitySpeed: Math.random() * 0.004 + 0.001,
    });

    const PARTICLE_COUNT = 120;
    const GRID_COLS = 12;
    const GRID_ROWS = 8;

    let time = 0;

    const initParticles = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
    };

    const drawGrid = () => {
      const colW = width / GRID_COLS;
      const rowH = height / GRID_ROWS;

      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.025)";
      ctx.lineWidth = 1;

      for (let i = 1; i < GRID_COLS; i++) {
        const x = i * colW;
        const waveOffset = Math.sin(time * 0.3 + i * 0.5) * 4;
        ctx.beginPath();
        ctx.moveTo(x + waveOffset, 0);
        ctx.lineTo(x - waveOffset, height);
        ctx.stroke();
      }

      for (let j = 1; j < GRID_ROWS; j++) {
        const y = j * rowH;
        const waveOffset = Math.cos(time * 0.2 + j * 0.7) * 4;
        ctx.beginPath();
        ctx.moveTo(0, y + waveOffset);
        ctx.lineTo(width, y - waveOffset);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawParticles = () => {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        if (p.opacity < p.opacityTarget) {
          p.opacity = Math.min(p.opacityTarget, p.opacity + p.opacitySpeed);
        } else if (p.opacity > p.opacityTarget) {
          p.opacity = Math.max(0, p.opacity - p.opacitySpeed);
          if (p.opacity <= 0) {
            p.opacityTarget = Math.random() * 0.5 + 0.05;
          }
        } else {
          p.opacityTarget = Math.random() * 0.5 + 0.05;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
        ctx.restore();
      }
    };

    const drawConnections = () => {
      const maxDist = 140;
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.06;
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    };

    const drawScanline = () => {
      const y = ((time * 40) % (height + 200)) - 100;
      const grad = ctx.createLinearGradient(0, y - 60, 0, y + 60);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.5, "rgba(255,255,255,0.012)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, y - 60, width, 120);
    };

    const drawMouseGlow = () => {
      const grad = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, 300
      );
      grad.addColorStop(0, "rgba(255,255,255,0.025)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    };

    const drawCornerAccents = () => {
      const size = 40;
      const offset = 32;
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;

      const corners = [
        [offset, offset],
        [width - offset, offset],
        [offset, height - offset],
        [width - offset, height - offset],
      ];
      const dirs = [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ];

      corners.forEach(([cx, cy], i) => {
        const [dx, dy] = dirs[i];
        ctx.beginPath();
        ctx.moveTo(cx, cy + dy * size);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + dx * size, cy);
        ctx.stroke();
      });

      ctx.restore();
    };

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      drawScanline();
      drawConnections();
      drawParticles();
      drawMouseGlow();
      drawCornerAccents();
      animId = requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);

    resize();
    initParticles();
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
