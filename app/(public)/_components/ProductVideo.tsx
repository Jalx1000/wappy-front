"use client";

import { useRef, useState } from "react";
import { useMarketing } from "./MarketingProvider";
import { Play } from "./Icons";

export function ProductVideo() {
  const { t } = useMarketing();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || !playing) {
      v.muted = false;
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="vid-shell">
      <span className="vid-tag eyebrow">
        <span className="dot" />
        {t.video.tag}
      </span>
      <video
        ref={videoRef}
        src="/marketing/wappy-motion.mp4"
        muted
        loop
        autoPlay
        playsInline
        preload="auto"
        onClick={toggle}
      />
      <button
        className={`vid-play${playing ? " hide" : ""}`}
        onClick={toggle}
        aria-label="Play product tour"
      >
        <span className="pbtn">
          <Play />
        </span>
      </button>
    </div>
  );
}
