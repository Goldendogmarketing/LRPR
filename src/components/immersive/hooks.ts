"use client";

import { useEffect, useRef, useState } from "react";

/**
 * IntersectionObserver-based "reveal once" hook.
 * Returns a ref to attach to a target element and a boolean that flips
 * to true the first time the element crosses the threshold. Used by
 * StrokeText and FadeUp to drive entry animations as the user scrolls.
 *
 * Ported from the BW immersive JSX reference.
 */
export function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

/**
 * Subtle scroll-driven Y offset for parallax backgrounds.
 * Returns a ref + the pixel offset to translate the bg by. The math
 * recomputes the offset from the element's distance to viewport center
 * inside a requestAnimationFrame to keep scroll smooth.
 */
export function useParallax(speed = 0.2) {
  const ref = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (!ref.current) {
          ticking = false;
          return;
        }
        const rect = ref.current.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        setOffset((center - viewCenter) * speed);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);
  return [ref, offset] as const;
}

/**
 * 0..1 scroll progress through the whole document. Drives the gold
 * progress bar fixed across the top of the page.
 */
export function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return p;
}
