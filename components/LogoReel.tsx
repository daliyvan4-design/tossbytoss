"use client";

import { useState, useEffect } from "react";

export default function LogoReel() {
  const [mode, setMode] = useState<"day" | "night">("night");
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const getMode = () =>
      (document.documentElement.dataset.mode as "day" | "night") ?? "night";

    setMode(getMode());
    const obs = new MutationObserver(() => setMode(getMode()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    setVideoReady(false);
  }, [mode]);

  const logoSrc = mode === "day" ? "/assets/logo-day.png" : "/assets/logo-night.png";
  // Set NEXT_PUBLIC_LOGO_DAY_VIDEO / NEXT_PUBLIC_LOGO_NIGHT_VIDEO in Vercel env vars
  // to a Cloudinary video URL (or any hosted mp4). Leave unset to use the CSS fallback.
  const videoSrc =
    mode === "day"
      ? (process.env.NEXT_PUBLIC_LOGO_DAY_VIDEO ?? "")
      : (process.env.NEXT_PUBLIC_LOGO_NIGHT_VIDEO ?? "");

  return (
    <section className="logo-reel" aria-label="Toss by Toss">
      <div className="logo-reel-inner">

        <div className="logo-reel-scene">
          {/* CSS spinning fallback — hidden once video is ready */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="logo-reel-img"
            src={logoSrc}
            alt=""
            aria-hidden="true"
            style={{ visibility: videoReady ? "hidden" : "visible" }}
          />
          {/*
            Drop logo-day.mp4 (logo on white bg) and logo-night.mp4 (logo on black bg)
            into /public/assets/ — mix-blend-mode removes the solid background automatically.
            Day  → multiply : white bg disappears, dark logo shows on leather
            Night → screen  : black bg disappears, light logo shows on leather
          */}
          {videoSrc && (
            <video
              key={videoSrc}
              className="logo-reel-video"
              autoPlay
              loop
              muted
              playsInline
              onCanPlay={() => setVideoReady(true)}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          )}
        </div>

        <p className="logo-reel-caption">
          5°20&prime;N · 4°02&prime;O &nbsp;—&nbsp; Atelier №&nbsp;04, Plateau, Abidjan
        </p>

      </div>
    </section>
  );
}
