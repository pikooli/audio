"use client";

import { useRef, useState, useCallback } from "react";

export default function Home() {
  const ref = useRef<HTMLAudioElement>(null);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [track, setTrack] = useState<MediaElementAudioSourceNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [panner, setPanner] = useState<StereoPannerNode | null>(null);
  const [pan, setPan] = useState(0);
  const [volume, setVolume] = useState(1);

  console.log("pan", pan);
  console.log("volume", volume);

  const initAudioCtx = useCallback(() => {
    console.log("initAudioCtx");

    if (!ref.current) return;
    console.log("ref.current", ref.current);

    if (!audioCtx && !track) {
      console.log("creating audio context");
      const ctx = new AudioContext();
      const trackAudio = ctx.createMediaElementSource(ref.current);
      const gainNode = new GainNode(ctx);
      const panner = new StereoPannerNode(ctx, { pan: 0 });

      setAudioCtx(ctx);
      setTrack(trackAudio);
      setGainNode(gainNode);
      setPanner(panner);

      trackAudio.connect(gainNode).connect(panner).connect(ctx.destination);
      ctx.resume();
      
      console.log("audio context created");
    } else if (audioCtx) {
      console.log("playing audio");
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
    }
  }, [ref, audioCtx, track]);

  const handlePlay = useCallback(() => {
    if (ref.current) {
      if (ref.current.paused) {
        initAudioCtx();
        ref.current.play();
      } else {
        ref.current.pause();
      }
    }
  }, [initAudioCtx]);
;

  return (
    <div className="flex flex-col items-center mt-16">
      <h1 className="text-2xl font-bold">project to test audio context in browser</h1>
      <p>control pannel and gain for audio</p>
      <audio ref={ref} src="/outfoxing.mp3" />
      <button onClick={handlePlay}>Play/Pause</button>
      <div className="flex flex-col items-center">
        <label>Pannel {pan}</label>
        <input
          type="range"
        min="-1"
        max="1"
        step="0.01"
        value={pan}
        onChange={(e) => {
          if (panner) {
            panner.pan.value = Number(e.target.value);
            setPan(Number(e.target.value));
          }
          }}
        />
      </div>
      <div className="flex flex-col items-center">
        <label>Gain {volume}</label>
        <input
          type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
          onChange={(e) => {
            if (gainNode) {
              gainNode.gain.value = Number(e.target.value);
              setVolume(Number(e.target.value));
            }
        }}
      />
    </div>
    </div>
  );
}
