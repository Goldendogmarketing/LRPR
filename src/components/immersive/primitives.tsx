"use client";

import type { CSSProperties, ReactNode } from "react";
import { useParallax, useScrollProgress } from "./hooks";

/**
 * Default gold from the BW reference. Per-listing accent color overrides
 * this via the `listedBy.accentColor` field (and ultimately a paid user's
 * profile customization).
 */
export const DEFAULT_ACCENT = "#c8a97e";
/** Lighter tint used for button hovers — derived once per render. */
export function tintAccent(hex: string, alpha: number) {
  // Accept "#RRGGBB" — fall back to gold if anything weird.
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return `rgba(200,169,126,${alpha})`;
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

type ImmersiveSectionProps = {
  /** URL of the parallax background photo. */
  photo: string;
  children: ReactNode;
  /** 0..1 amount to dim the bg. Higher = darker. */
  darken?: number;
  /** Optional gaussian blur radius in px. Used for backdrop CTA sections. */
  blur?: number;
  /** Parallax intensity. 0 disables. */
  parallaxSpeed?: number;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  id?: string;
};

/**
 * Full-viewport section with a parallaxed background photo, gradient
 * overlay, and centered content slot. The overlay fades in/out at top
 * and bottom so adjacent sections blend smoothly during scroll.
 */
export function ImmersiveSection({
  photo,
  children,
  darken = 0.4,
  blur = 0,
  parallaxSpeed = 0.15,
  align = "flex-end",
  justify = "flex-start",
  id,
}: ImmersiveSectionProps) {
  const [pRef, pOffset] = useParallax(parallaxSpeed);
  return (
    <section
      id={id}
      ref={pRef as React.RefObject<HTMLElement>}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: align,
        justifyContent: justify,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-80px",
          backgroundImage: `url(${photo})`,
          backgroundColor: "#08080a",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `translateY(${pOffset}px)`,
          filter: `brightness(${1 - darken})${blur ? ` blur(${blur}px)` : ""} saturate(0.9)`,
          willChange: "transform",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(8,8,10,0.35) 0%, rgba(8,8,10,0.05) 25%, rgba(8,8,10,0.05) 55%, rgba(8,8,10,0.6) 82%, rgba(8,8,10,0.88) 100%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 2, width: "100%" }}>{children}</div>
    </section>
  );
}

type StrokeTextProps = {
  children: ReactNode;
  visible: boolean;
  delay?: number;
  italic?: boolean;
  weight?: number;
  /** Override the accent color (defaults to gold). */
  color?: string;
};

/**
 * Headline that starts as just an outline and fills in as it animates
 * into view. The signature dramatic reveal from the BW reference.
 */
export function StrokeText({
  children,
  visible,
  delay = 0,
  italic,
  weight = 700,
  color = DEFAULT_ACCENT,
}: StrokeTextProps) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "'Playfair Display', serif",
        fontWeight: weight,
        fontStyle: italic ? "italic" : "normal",
        lineHeight: 1.05,
        WebkitTextStroke: visible ? "0px" : `1.5px ${color}`,
        WebkitTextFillColor: visible ? color : "transparent",
        transition: `all 1.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        opacity: visible ? 1 : 0.3,
      }}
    >
      {children}
    </span>
  );
}

type FadeUpProps = {
  visible: boolean;
  delay?: number;
  children: ReactNode;
  style?: CSSProperties;
};

/** Standard "fade up + translate" reveal animation. */
export function FadeUp({ visible, delay = 0, children, style = {} }: FadeUpProps) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(35px)",
        transition: `all 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Fixed gold progress bar pinned to the top of the page. */
export function ScrollBar({ color = DEFAULT_ACCENT }: { color?: string }) {
  const p = useScrollProgress();
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "3px",
        zIndex: 9999,
        width: `${p * 100}%`,
        background: `linear-gradient(90deg, ${color}, ${tintAccent(color, 0.6)})`,
        transition: "width 0.08s linear",
      }}
    />
  );
}

/**
 * Global styles + Google Fonts import scoped to the immersive page.
 * Loading the Playfair Display + Inter pair this way (rather than via
 * next/font) keeps the change additive — the rest of the site still
 * uses its existing Inter setup. Mobile media queries force the dual
 * column grids in the CTA + mortgage calc onto one column.
 */
export function ImmersiveStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap');
      .immersive-listing { background: #08080a; color: #fff; min-height: 100vh; overflow-x: hidden; }
      .immersive-listing input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--immersive-accent, ${DEFAULT_ACCENT}); cursor: pointer; border: 2px solid #08080a; box-shadow: 0 0 0 3px rgba(200,169,126,0.15); }
      .immersive-listing input::placeholder { color: rgba(255,255,255,0.2); }
      .immersive-listing a { color: inherit; text-decoration: none; }
      @keyframes immersiveScrollPulse { 0%, 100% { opacity: 0.45; transform: translateX(-50%) translateY(0); } 50% { opacity: 0.2; transform: translateX(-50%) translateY(10px); } }
      @media (max-width: 768px) {
        .immersive-listing section div[data-immersive-grid="2col"] { grid-template-columns: 1fr !important; }
        .immersive-listing section div[data-immersive-grid="3col"] { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}
