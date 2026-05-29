"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { toggleFavoriteAction } from "@/app/favorites/actions";
import type { ImmersiveFeature, ListedBy, Listing } from "@/data/site";
import { useReveal } from "./hooks";
import {
  FadeUp,
  ImmersiveSection,
  StrokeText,
  tintAccent,
} from "./primitives";

// ─── Nav ────────────────────────────────────────────────────────────────

type NavProps = {
  initials: string;
  brand: string;
  accent: string;
  isSignedIn: boolean;
  isSaved: boolean;
  listingSlug: string;
};

export function ImmersiveNav({
  initials,
  brand,
  accent,
  isSignedIn,
  isSaved,
  listingSlug,
}: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: scrolled ? "12px 28px" : "22px 28px",
        background: scrolled ? "rgba(8,8,10,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? `1px solid ${tintAccent(accent, 0.12)}` : "none",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Link
        href="/"
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
        aria-label="Lake Region Property Resource home"
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "24px",
            fontWeight: 700,
            color: accent,
          }}
        >
          {initials}
        </span>
        <span
          style={{
            fontSize: "9px",
            letterSpacing: "0.35em",
            color: tintAccent(accent, 0.45),
            textTransform: "uppercase",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {brand}
        </span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {isSignedIn ? (
          <form action={toggleFavoriteAction}>
            <input type="hidden" name="slug" value={listingSlug} />
            <button
              type="submit"
              aria-label={isSaved ? "Remove from favorites" : "Save listing"}
              title={isSaved ? "Remove from favorites" : "Save listing"}
              style={{
                padding: "10px 18px",
                fontSize: "10px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: isSaved ? "#08080a" : accent,
                background: isSaved ? accent : "transparent",
                border: `1px solid ${accent}`,
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
                transition: "all 0.3s",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span aria-hidden>{isSaved ? "♥" : "♡"}</span>
              {isSaved ? "Saved" : "Save"}
            </button>
          </form>
        ) : (
          <Link
            href="/sign-in"
            style={{
              padding: "10px 18px",
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: accent,
              border: `1px solid ${tintAccent(accent, 0.5)}`,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Sign in to save
          </Link>
        )}
        <a
          href="#contact"
          style={{
            padding: "10px 24px",
            fontSize: "10px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#08080a",
            background: accent,
            fontWeight: 700,
            fontFamily: "'Inter', sans-serif",
            transition: "all 0.3s",
            cursor: "pointer",
          }}
        >
          Schedule Showing
        </a>
      </div>
    </nav>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────

type HeroProps = {
  photo: string;
  price: string;
  mls?: string;
  address: string;
  street: string;
  stats: { val: ReactNode; label: string }[];
  accent: string;
};

export function ImmersiveHero({
  photo,
  price,
  mls,
  address,
  street,
  stats,
  accent,
}: HeroProps) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 400);
    return () => clearTimeout(t);
  }, []);
  return (
    <ImmersiveSection photo={photo} darken={0.4} align="flex-end">
      <div
        style={{
          padding: "0 clamp(24px, 5vw, 80px) clamp(80px, 12vh, 140px)",
          maxWidth: "1300px",
        }}
      >
        <FadeUp visible={loaded} delay={0.6} style={{ marginBottom: "20px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "8px 22px",
              border: `1px solid ${tintAccent(accent, 0.35)}`,
              fontSize: "13px",
              letterSpacing: "0.18em",
              fontFamily: "'Inter', sans-serif",
              color: accent,
            }}
          >
            {price}
            {mls ? ` · ${mls}` : ""}
          </span>
        </FadeUp>
        <h1 style={{ margin: "0 0 12px 0", fontSize: "clamp(42px, 8vw, 100px)" }}>
          <StrokeText visible={loaded} delay={0.3} color={accent}>
            {address}
          </StrokeText>
        </h1>
        <FadeUp visible={loaded} delay={1.0} style={{ marginBottom: "44px" }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(11px, 1.3vw, 15px)",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              margin: 0,
            }}
          >
            {street}
          </p>
        </FadeUp>
        <FadeUp visible={loaded} delay={1.3}>
          <div
            style={{
              display: "flex",
              gap: "clamp(24px, 5vw, 56px)",
              flexWrap: "wrap",
            }}
          >
            {stats.map((s, i) => (
              <div key={i}>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(30px, 4vw, 50px)",
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "9px",
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    color: tintAccent(accent, 0.6),
                    marginTop: "4px",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "28px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          opacity: loaded ? 0.45 : 0,
          transition: "opacity 1.5s 2s",
          animation: "immersiveScrollPulse 2.5s ease-in-out infinite",
        }}
      >
        <span
          style={{
            fontSize: "8px",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: accent,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: "1px",
            height: "36px",
            background: `linear-gradient(to bottom, ${accent}, transparent)`,
          }}
        />
      </div>
    </ImmersiveSection>
  );
}

// ─── Aerial tagline ─────────────────────────────────────────────────────

type AerialProps = {
  photo: string;
  /** Two-line headline (use \n for split). Optional. */
  tagline?: string;
  description: string;
  category: string;
  highlights?: string[];
  accent: string;
};

export function ImmersiveAerial({
  photo,
  tagline,
  description,
  category,
  highlights = [],
  accent,
}: AerialProps) {
  const [ref, visible] = useReveal(0.2);
  const lines = (tagline ?? "Lake Region\nProperty Resource").split(/\r?\n/);
  return (
    <ImmersiveSection photo={photo} darken={0.45} align="center" justify="center">
      <div
        ref={ref}
        style={{
          textAlign: "center",
          padding: "clamp(40px, 8vh, 120px) clamp(24px, 5vw, 80px)",
          maxWidth: "950px",
          margin: "0 auto",
        }}
      >
        <FadeUp visible={visible} delay={0} style={{ marginBottom: "20px" }}>
          <span
            style={{
              fontSize: "9px",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: accent,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {category}
          </span>
        </FadeUp>
        <h2 style={{ margin: "0 0 28px 0", fontSize: "clamp(30px, 5.5vw, 68px)" }}>
          {lines.map((line, i) => (
            <span key={i}>
              <StrokeText visible={visible} delay={0.15 + i * 0.2} italic color={accent}>
                {line}
              </StrokeText>
              {i < lines.length - 1 ? <br /> : null}
            </span>
          ))}
        </h2>
        <FadeUp visible={visible} delay={0.6}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(14px, 1.2vw, 17px)",
              lineHeight: 1.9,
              color: "rgba(255,255,255,0.5)",
              maxWidth: "640px",
              margin: "0 auto",
            }}
          >
            {description}
          </p>
        </FadeUp>
        {highlights.length > 0 ? (
          <FadeUp visible={visible} delay={0.9} style={{ marginTop: "40px" }}>
            <div
              style={{
                display: "inline-flex",
                gap: "clamp(16px, 3vw, 32px)",
                padding: "20px 0",
                borderTop: `1px solid ${tintAccent(accent, 0.15)}`,
                borderBottom: `1px solid ${tintAccent(accent, 0.15)}`,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {highlights.map((t, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: tintAccent(accent, 0.55),
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </FadeUp>
        ) : null}
      </div>
    </ImmersiveSection>
  );
}

// ─── Feature section ────────────────────────────────────────────────────

type FeatureProps = {
  feature: ImmersiveFeature;
  index: number;
  fallbackPhoto: string;
  accent: string;
};

export function ImmersiveFeatureSection({
  feature,
  index,
  fallbackPhoto,
  accent,
}: FeatureProps) {
  const [ref, visible] = useReveal(0.15);
  const isEven = index % 2 === 0;
  const number = String(index + 1).padStart(2, "0");
  return (
    <ImmersiveSection
      photo={feature.photo ?? fallbackPhoto}
      darken={0.42}
      align="center"
      parallaxSpeed={0.12}
    >
      <div
        ref={ref}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isEven ? "flex-start" : "flex-end",
          padding: "clamp(100px, 14vh, 180px) clamp(28px, 6vw, 100px)",
          maxWidth: "1300px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(100px, 16vw, 220px)",
            fontWeight: 700,
            color: tintAccent(accent, 0.07),
            lineHeight: 0.85,
            marginBottom: "-40px",
            opacity: visible ? 1 : 0,
            transition: "opacity 1.2s 0.1s",
            textAlign: isEven ? "left" : "right",
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          {number}
        </div>
        <FadeUp
          visible={visible}
          delay={0.1}
          style={{ marginBottom: "16px", position: "relative", zIndex: 2 }}
        >
          <span
            style={{
              fontSize: "9px",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: accent,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {feature.label}
          </span>
        </FadeUp>
        <h2
          style={{
            fontSize: "clamp(32px, 5vw, 64px)",
            margin: "0 0 28px 0",
            textAlign: isEven ? "left" : "right",
            maxWidth: "700px",
            whiteSpace: "pre-line",
            position: "relative",
            zIndex: 2,
          }}
        >
          <StrokeText visible={visible} delay={0.2} color={accent}>
            {feature.title}
          </StrokeText>
        </h2>
        <FadeUp
          visible={visible}
          delay={0.5}
          style={{
            maxWidth: "520px",
            textAlign: isEven ? "left" : "right",
            position: "relative",
            zIndex: 2,
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(13px, 1.1vw, 16px)",
              lineHeight: 1.85,
              color: "rgba(255,255,255,0.55)",
              margin: 0,
              textShadow: "0 1px 8px rgba(0,0,0,0.5)",
            }}
          >
            {feature.body}
          </p>
        </FadeUp>
        <FadeUp
          visible={visible}
          delay={0.7}
          style={{ marginTop: "36px", position: "relative", zIndex: 2 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: "14px",
              paddingTop: "18px",
              borderTop: `1px solid ${tintAccent(accent, 0.25)}`,
            }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(36px, 4.5vw, 60px)",
                fontWeight: 700,
                color: accent,
                textShadow: "0 2px 12px rgba(0,0,0,0.4)",
              }}
            >
              {feature.stat}
            </span>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "9px",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: tintAccent(accent, 0.5),
              }}
            >
              {feature.statLabel}
            </span>
          </div>
        </FadeUp>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: visible ? "clamp(80px, 16vw, 260px)" : "0px",
          height: "1px",
          background: tintAccent(accent, 0.2),
          transition: "width 1.8s 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }} />
    </ImmersiveSection>
  );
}

// ─── CTA / Request showing form ─────────────────────────────────────────

type CTAProps = {
  photo: string;
  price: string;
  address: string;
  street: string;
  agent: ListedBy;
  accent: string;
};

export function ImmersiveCTA({ photo, price, address, street, agent, accent }: CTAProps) {
  const [ref, visible] = useReveal(0.15);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const inputStyle = {
    width: "100%",
    padding: "16px 0",
    background: "transparent",
    border: "none",
    borderBottom: `1px solid ${tintAccent(accent, 0.25)}`,
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.3s",
    letterSpacing: "0.02em",
    boxSizing: "border-box" as const,
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderBottomColor = accent;
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderBottomColor = tintAccent(accent, 0.25);
  };

  return (
    <ImmersiveSection
      id="contact"
      photo={photo}
      darken={0.55}
      blur={2}
      align="center"
      justify="center"
    >
      <div
        ref={ref}
        data-immersive-grid="2col"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(40px, 6vw, 100px)",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "clamp(80px, 12vh, 160px) clamp(28px, 5vw, 80px)",
          alignItems: "center",
        }}
      >
        <div>
          <FadeUp visible={visible} delay={0}>
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                color: accent,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Private Showing
            </span>
          </FadeUp>
          <h2 style={{ fontSize: "clamp(34px, 5vw, 60px)", margin: "20px 0 24px 0" }}>
            <StrokeText visible={visible} delay={0.15} color={accent}>
              See It Before
            </StrokeText>
            <br />
            <StrokeText visible={visible} delay={0.3} color={accent}>
              It&apos;s Gone
            </StrokeText>
          </h2>
          <FadeUp visible={visible} delay={0.5}>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "15px",
                lineHeight: 1.85,
                color: "rgba(255,255,255,0.45)",
                maxWidth: "420px",
                textShadow: "0 1px 6px rgba(0,0,0,0.4)",
              }}
            >
              Lake Region properties at this price point don&apos;t last long. Schedule a private
              walkthrough and experience every detail in person.
            </p>
          </FadeUp>
          {/* Agent block: headshot + name + brokerage + phone */}
          <FadeUp visible={visible} delay={0.65} style={{ marginTop: "36px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {agent.headshotUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={agent.headshotUrl}
                  alt={agent.displayName ?? "Listing agent"}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `1px solid ${tintAccent(accent, 0.4)}`,
                  }}
                />
              ) : null}
              <div>
                {agent.displayName ? (
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#fff",
                    }}
                  >
                    {agent.displayName}
                  </div>
                ) : null}
                {agent.brokerage ? (
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: tintAccent(accent, 0.7),
                      marginTop: 2,
                    }}
                  >
                    {agent.brokerage}
                  </div>
                ) : null}
                {agent.phone ? (
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      marginTop: 4,
                    }}
                  >
                    <a href={`tel:${agent.phone.replace(/[^0-9+]/g, "")}`}>{agent.phone}</a>
                  </div>
                ) : null}
              </div>
            </div>
            {agent.tagline ? (
              <p
                style={{
                  marginTop: 16,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.4)",
                  maxWidth: 420,
                }}
              >
                {agent.tagline}
              </p>
            ) : null}
          </FadeUp>
          <FadeUp visible={visible} delay={0.8}>
            <div
              style={{
                marginTop: "36px",
                paddingTop: "20px",
                borderTop: `1px solid ${tintAccent(accent, 0.12)}`,
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(30px, 3.5vw, 44px)",
                  fontWeight: 700,
                  color: accent,
                }}
              >
                {price}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.25)",
                  marginTop: "4px",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {address} · {street}
              </div>
            </div>
          </FadeUp>
        </div>
        <FadeUp visible={visible} delay={0.3}>
          <div
            style={{
              background: "rgba(8,8,10,0.6)",
              border: `1px solid ${tintAccent(accent, 0.1)}`,
              padding: "clamp(32px, 4vw, 52px)",
              backdropFilter: "blur(30px)",
            }}
          >
            {!sent ? (
              <>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "22px",
                    fontWeight: 400,
                    color: "#fff",
                    margin: "0 0 36px 0",
                  }}
                >
                  Request a Showing
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  <button
                    onClick={() => setSent(true)}
                    style={{
                      marginTop: "8px",
                      padding: "18px",
                      width: "100%",
                      background: accent,
                      color: "#08080a",
                      border: "none",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "background 0.3s",
                    }}
                  >
                    Schedule Private Tour
                  </button>
                </div>
                <p
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.2)",
                    marginTop: "16px",
                    fontFamily: "'Inter', sans-serif",
                    lineHeight: 1.7,
                  }}
                >
                  By submitting you agree to receive communication about this property.
                </p>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    border: `2px solid ${accent}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: "24px",
                    color: accent,
                  }}
                >
                  &#10003;
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "22px",
                    fontWeight: 400,
                    color: accent,
                    margin: "0 0 10px 0",
                  }}
                >
                  You&apos;re In
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.45)",
                    lineHeight: 1.7,
                  }}
                >
                  {agent.displayName ?? "The listing agent"} will reach out within 24 hours to
                  schedule your private showing.
                </p>
              </div>
            )}
          </div>
        </FadeUp>
      </div>
    </ImmersiveSection>
  );
}

// ─── Mortgage calculator ────────────────────────────────────────────────

type MortgageProps = {
  /** Parsed numeric price. If 0, the section is hidden. */
  priceNumeric: number;
  /** Per-month string like "$1,450/mo" — when present, calculator is hidden. */
  monthlyRent?: string | null;
  accent: string;
};

export function ImmersiveMortgageCalc({ priceNumeric, monthlyRent, accent }: MortgageProps) {
  const [ref, visible] = useReveal(0.15);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [term, setTerm] = useState(30);
  if (!priceNumeric || monthlyRent) return null;
  const loan = priceNumeric * (1 - downPct / 100);
  const mr = rate / 100 / 12;
  const n = term * 12;
  const monthly = mr > 0 ? (loan * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1) : loan / n;

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        background: "#08080a",
        padding: "clamp(100px, 14vh, 180px) clamp(28px, 5vw, 80px)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tintAccent(accent, 0.04)} 0%, transparent 70%)`,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative" }}>
        <FadeUp visible={visible} delay={0} style={{ textAlign: "center", marginBottom: "52px" }}>
          <span
            style={{
              fontSize: "9px",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: accent,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Payment Estimator
          </span>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(52px, 7vw, 88px)",
              fontWeight: 700,
              color: accent,
              marginTop: "12px",
            }}
          >
            ${Math.round(monthly).toLocaleString()}
          </div>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.3em",
              color: "rgba(255,255,255,0.25)",
              fontFamily: "'Inter', sans-serif",
              marginTop: "6px",
            }}
          >
            PER MONTH
          </div>
        </FadeUp>
        <FadeUp visible={visible} delay={0.2}>
          <div
            data-immersive-grid="3col"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "clamp(24px, 4vw, 56px)",
            }}
          >
            {[
              { label: "Down Payment", val: `${downPct}%`, state: downPct, set: setDownPct, min: 3, max: 50, step: 1 },
              { label: "Interest Rate", val: `${rate}%`, state: rate, set: setRate, min: 2, max: 12, step: 0.125 },
              { label: "Loan Term", val: `${term} yrs`, state: term, set: setTerm, min: 10, max: 30, step: 5 },
            ].map((s, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "14px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.35)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {s.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "18px",
                      color: accent,
                      fontWeight: 600,
                    }}
                  >
                    {s.val}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={s.state}
                  onChange={(e) => s.set(parseFloat(e.target.value))}
                  style={{
                    width: "100%",
                    height: "2px",
                    appearance: "none",
                    background: tintAccent(accent, 0.15),
                    outline: "none",
                    cursor: "pointer",
                  }}
                />
              </div>
            ))}
          </div>
        </FadeUp>
        <FadeUp visible={visible} delay={0.4}>
          <div
            style={{
              marginTop: "52px",
              paddingTop: "28px",
              borderTop: `1px solid ${tintAccent(accent, 0.08)}`,
              display: "flex",
              justifyContent: "center",
              gap: "clamp(28px, 4vw, 56px)",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Loan Amount", val: `$${loan.toLocaleString()}` },
              { label: "Down Payment", val: `$${(priceNumeric - loan).toLocaleString()}` },
              { label: "Total Interest", val: `$${Math.round(monthly * n - loan).toLocaleString()}` },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  {item.val}
                </div>
                <div
                  style={{
                    fontSize: "8px",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: tintAccent(accent, 0.4),
                    marginTop: "5px",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Resources grid ─────────────────────────────────────────────────────

type Resource = { iconKey: string; title: string; desc: string; href?: string };

const RESOURCE_ICONS: Record<string, ReactNode> = {
  mortgage: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 14h4" />
    </svg>
  ),
  lender: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7h20L12 2z" />
      <rect x="4" y="7" width="16" height="13" />
      <path d="M4 20h16" />
      <path d="M8 7v13M12 7v13M16 7v13" />
    </svg>
  ),
  inspection: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
      <path d="M8 11h6M11 8v6" />
    </svg>
  ),
  insurance: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 4v6c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V6l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  title: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  ),
  appraisal: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-6h6v6" />
      <path d="M10 9h4" />
    </svg>
  ),
};

const DEFAULT_RESOURCES: Resource[] = [
  { iconKey: "mortgage", title: "Mortgage Calculator", desc: "Estimate your monthly payment", href: "#contact" },
  { iconKey: "lender", title: "Preferred Lenders", desc: "Pre-approval and rate quotes", href: "/resources" },
  { iconKey: "inspection", title: "Home Inspection", desc: "Certified inspector referrals", href: "/service-pros" },
  { iconKey: "insurance", title: "Homeowner’s Insurance", desc: "Competitive rate quotes", href: "/resources" },
  { iconKey: "title", title: "Title & Closing", desc: "Trusted title company partners", href: "/service-pros" },
  { iconKey: "appraisal", title: "Home Appraisal", desc: "Licensed appraiser network", href: "/service-pros" },
];

export function ImmersiveResources({ accent }: { accent: string }) {
  const [ref, visible] = useReveal(0.08);
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        background: "#08080a",
        padding: "clamp(80px, 12vh, 140px) clamp(28px, 5vw, 80px)",
        borderTop: `1px solid ${tintAccent(accent, 0.06)}`,
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <FadeUp visible={visible} delay={0} style={{ textAlign: "center", marginBottom: "56px" }}>
          <span
            style={{
              fontSize: "9px",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: accent,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Buyer Resources
          </span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", margin: "14px 0 0 0" }}>
            <StrokeText visible={visible} delay={0.1} color={accent}>
              Everything You Need
            </StrokeText>
          </h2>
        </FadeUp>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1px",
            background: tintAccent(accent, 0.06),
          }}
        >
          {DEFAULT_RESOURCES.map((r, i) => (
            <Link
              key={i}
              href={r.href ?? "#"}
              style={{
                background: "#08080a",
                padding: "clamp(28px, 3vw, 44px)",
                cursor: "pointer",
                transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(25px)",
                transitionDelay: `${0.05 * i}s`,
                display: "block",
              }}
            >
              <div style={{ marginBottom: "14px", opacity: 0.85, color: accent }}>
                {RESOURCE_ICONS[r.iconKey]}
              </div>
              <h4
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "19px",
                  fontWeight: 600,
                  color: "#fff",
                  margin: "0 0 6px 0",
                }}
              >
                {r.title}
              </h4>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.35)",
                  margin: "0 0 18px 0",
                  lineHeight: 1.6,
                }}
              >
                {r.desc}
              </p>
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: accent,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Learn More &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────

type FooterProps = {
  initials: string;
  brand: string;
  agent: ListedBy;
  accent: string;
};

export function ImmersiveFooter({ initials, brand, agent, accent }: FooterProps) {
  const contactBits = [agent.phone, "lakeregionpropertyresource.com", agent.email].filter(Boolean);
  return (
    <footer
      style={{
        background: "#08080a",
        padding: "56px clamp(28px, 5vw, 80px) 36px",
        borderTop: `1px solid ${tintAccent(accent, 0.06)}`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "28px",
          fontWeight: 700,
          color: accent,
          marginBottom: "6px",
        }}
      >
        {initials}
      </div>
      <div
        style={{
          fontSize: "9px",
          letterSpacing: "0.45em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.25)",
          fontFamily: "'Inter', sans-serif",
          marginBottom: "20px",
        }}
      >
        {brand}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.4)",
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.9,
        }}
      >
        {contactBits.join(" · ")}
      </div>
      <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
        <Link href="/for-sale" style={{ fontSize: 11, letterSpacing: "0.2em", color: tintAccent(accent, 0.7), textTransform: "uppercase" }}>
          For Sale
        </Link>
        <Link href="/for-rent" style={{ fontSize: 11, letterSpacing: "0.2em", color: tintAccent(accent, 0.7), textTransform: "uppercase" }}>
          For Rent
        </Link>
        <Link href="/resources" style={{ fontSize: 11, letterSpacing: "0.2em", color: tintAccent(accent, 0.7), textTransform: "uppercase" }}>
          Resources
        </Link>
        <Link href="/service-pros" style={{ fontSize: 11, letterSpacing: "0.2em", color: tintAccent(accent, 0.7), textTransform: "uppercase" }}>
          Service Pros
        </Link>
        <Link href="/data-sources" style={{ fontSize: 11, letterSpacing: "0.2em", color: tintAccent(accent, 0.7), textTransform: "uppercase" }}>
          Data Sources
        </Link>
      </div>
      <div
        style={{
          fontSize: "9px",
          color: "rgba(255,255,255,0.18)",
          fontFamily: "'Inter', sans-serif",
          marginTop: "28px",
        }}
      >
        &copy; {new Date().getFullYear()} Lake Region Property Resource. Equal Housing Opportunity.
      </div>
    </footer>
  );
}

/**
 * Helper: parse a price string like "$489,000" or "$1,450/mo" into a
 * numeric value (just the dollar amount, no /mo). Returns 0 if it can't
 * find a number.
 */
export function parsePriceNumeric(price: string) {
  const cleaned = price.replace(/\/.*/, "").replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export type { Listing };
