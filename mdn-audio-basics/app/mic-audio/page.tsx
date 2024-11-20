"use client";

import { useRef, useState, useCallback } from "react";

const CHUNK_SIZE = 1024;
export default function MicAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [, setChunks] = useState<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setupSoundRecorder = useCallback((soundRecorder: MediaRecorder) => {
    soundRecorder.ondataavailable = (event) => {
      console.log("ondataavailable", event.data.size);
      if (event.data.size > 0) {
        setChunks((prev) => [...prev, event.data]);
      }
    };

    soundRecorder.onstop = () => {
      console.log("onStop")
      setChunks((prev) => {
        if (prev.length > 0) {
          const blob = new Blob(prev, { type: "audio/webm; codecs=opus" });
          const url = URL.createObjectURL(blob);
          if (audioRef.current) {
            audioRef.current.src = url;
          }
        }
        return [];          
      });
    };

    soundRecorder.onerror = (event) => {
      console.error("Media recorder error:", event);
      setError("Recording failed. Please check microphone permissions.");
    };
  }, []);

  const initAudioCtx = useCallback(async () => {
    setError(null);

    try {
      if (!recorder) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const soundRecorder = new MediaRecorder(mediaStream);
        
        setRecorder(soundRecorder);
        setupSoundRecorder(soundRecorder);
        soundRecorder.start(CHUNK_SIZE);
        setRecording(true);
      } else {
        if (!recording) {
          recorder.start(CHUNK_SIZE);
          setRecording(true);
        } else {
          recorder.stop();
          setRecording(false);
        }
      }
    } catch (err) {
      console.error("Error initializing audio recording:", err);
      setError("Could not start recording. Please check microphone access.");
    }
  }, [recorder, recording, setupSoundRecorder]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Mic Audio
      </h1>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Audio Mic Chunking Browser Test
      </h1>
      <p className="p-4">
        This demo records audio from your microphone and plays it back in the browser. Click the button below to start recording, 
        then speak into your microphone. Click again to stop recording and the audio will be available for playback.
      </p>
      
      {error && (
        <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
      
      <div className="flex flex-col items-center space-y-4">
        <button 
          className={`
            px-4 py-2 rounded-md transition-colors duration-300
            ${recording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
            } 
            text-white font-semibold
          `}
          onClick={initAudioCtx}
        >
          {recording ? "Stop Recording" : "Start Recording"}
        </button>
        
        <audio 
          ref={audioRef} 
          controls 
          className="mt-4 w-full max-w-md"
          aria-label="Recorded Audio Playback"
        />
      </div>
    </>
  );
}