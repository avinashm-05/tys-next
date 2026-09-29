"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

// Dotted globe in TYS blue with shipping routes arcing out of the US hubs.
// It stands in for the 3D vehicle illustrations: the business in one image
// (the US to the world) without looking like a software product.
//
// cobe is ~5KB and draws with WebGL. It auto-rotates slowly, and you can drag
// it to spin. It only renders while it's on screen, and it stays still for
// reduced-motion users.

const HUBS: [number, number][] = [
  [33.749, -84.388], // Atlanta
  [40.7128, -74.006], // New York
  [29.7604, -95.3698], // Houston
  [34.0522, -118.2437], // Los Angeles
];

const DESTINATIONS: [number, number][] = [
  [51.5072, -0.1276], // London
  [19.076, 72.8777], // Mumbai
  [25.2048, 55.2708], // Dubai
  [6.5244, 3.3792], // Lagos
  [-23.5505, -46.6333], // Sao Paulo
  [43.6532, -79.3832], // Toronto
  [14.5995, 120.9842], // Manila
  [-33.8688, 151.2093], // Sydney
  [52.52, 13.405], // Berlin
  [19.4326, -99.1332], // Mexico City
];

const ROUTES = [
  [0, 0], [1, 1], [0, 2], [2, 3], [0, 4], [1, 5], [3, 6], [3, 7], [1, 8], [2, 9],
].map(([h, d]) => ({ from: HUBS[h], to: DESTINATIONS[d] }));

type GlobeProps = {
  className?: string;
  // Tilt: negative looks up at the northern hemisphere, which puts the US
  // near the top edge when only the top of a big globe is showing.
  theta?: number;
  mapSamples?: number;
  interactive?: boolean;
  // Route arcs and big hub markers read well on a small globe but turn
  // into huge loops on the planet horizon, so the planet turns them off.
  routes?: boolean;
  // "dark": light dots on a dark sphere, for the night band mid-page.
  tone?: "light" | "dark";
};

export function HeroGlobe({ className = "", theta = 0.28, mapSamples = 18000, interactive = true, routes = true, tone = "light" }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef<{ x: number; phi: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = canvas.offsetWidth;
    // The planet horizons are thousands of pixels wide and mostly faded or
    // masked, so they render well below device resolution; drawing them at
    // full resolution every frame is what made the page feel laggy.
    const big = width > 1600;
    const dpr = big ? 0.75 : Math.min(window.devicePixelRatio || 1, width > 900 ? 1.5 : 2);
    // Start with the Atlantic facing us, so the US hubs and Europe are both in view.
    const phi = 5.05;
    let dragOffset = 0;
    let visible = true;

    const onResize = () => {
      width = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);

    const globe = createGlobe(canvas, {
      // cobe multiplies width and height by devicePixelRatio itself, so
      // these are CSS pixels. Big canvases (the planet) render at 1.5x.
      devicePixelRatio: dpr,
      width,
      height: width,
      phi,
      theta,
      dark: tone === "dark" ? 1 : 0,
      diffuse: tone === "dark" ? 1.2 : 1.4,
      scale: 1,
      mapSamples,
      mapBrightness: tone === "dark" ? 7 : 5.5,
      baseColor: tone === "dark" ? [0.32, 0.45, 0.75] : [0.93, 0.95, 1],
      markerColor: [0.012, 0.39, 1],
      glowColor: tone === "dark" ? [0.05, 0.22, 0.7] : [0.86, 0.91, 1],
      markers: routes
        ? [
            ...HUBS.map((location) => ({ location, size: 0.06 })),
            ...DESTINATIONS.map((location) => ({ location, size: 0.035 })),
          ]
        : [...HUBS, ...DESTINATIONS].map((location) => ({ location, size: 0.012 })),
      arcs: routes ? ROUTES : [],
      arcColor: [0.012, 0.39, 1],
      arcWidth: 0.6,
      arcHeight: 0.28,
      markerElevation: 0.01,
    });

    // cobe v2 has no render callback: we drive it with our own frame loop,
    // which also lets us skip work entirely while the globe is off screen.
    // A slow sway around the Atlantic rather than a full spin: a full spin
    // spends most of its time showing Asia, and every route here starts in
    // the US, so the US should always be in view.
    let raf = 0;
    let t = 0;
    let frame = 0;
    let drawnWidth = width;
    const tick = () => {
      // Big globes turn so slowly that 30fps looks identical to 60.
      if (visible && (!big || frame++ % 2 === 0)) {
        if (!pointer.current && !reduce) t += big ? 0.0032 : 0.0016;
        const sway = Math.sin(t) * 0.45;
        // Setting the size clears and reallocates the canvas, so only pass
        // it when it has actually changed.
        if (width !== drawnWidth) {
          drawnWidth = width;
          globe.update({ phi: phi + sway + dragOffset, width, height: width });
        } else {
          globe.update({ phi: phi + sway + dragOffset });
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    // Fade in once the first frame is drawn, instead of popping in.
    const fade = window.setTimeout(() => {
      canvas.style.opacity = "1";
    }, 60);

    const down = (e: PointerEvent) => {
      if (!interactive) return;
      pointer.current = { x: e.clientX, phi: dragOffset };
      canvas.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!pointer.current) return;
      dragOffset = pointer.current.phi + (e.clientX - pointer.current.x) / 200;
    };
    const up = () => {
      pointer.current = null;
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    return () => {
      cancelAnimationFrame(raf);
      globe.destroy();
      io.disconnect();
      window.clearTimeout(fade);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [theta, mapSamples, interactive, routes, tone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`aspect-square w-full ${interactive ? "cursor-grab" : ""} opacity-0 transition-opacity duration-1000 [contain:layout_paint_size] ${className}`}
    />
  );
}
