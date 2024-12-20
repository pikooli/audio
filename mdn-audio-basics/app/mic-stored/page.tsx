"use client";

import { useRef, useState, useCallback } from "react";

const CHUNK_SIZE = 1024;
const BACKEND_URL = "/api/stored";

export default function MicStored() {
  const [, setChunks] = useState<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendAudio = useCallback(async (chunks: Blob[]) => {
    console.log("sendAudio", chunks);
    const blob = new Blob(chunks, { type: "audio/webm; codecs=opus" });
    const formData = new FormData();
    formData.append('audio', blob);
    await fetch(BACKEND_URL, {
      method: 'POST',
      body: formData
    })
  }, []);

  const setupSoundRecorder = useCallback(() => {
    if (!mediaRecorderRef.current) {  
      return;
    }
    mediaRecorderRef.current.ondataavailable = (event  ) => {
      console.log("ondataavailable", event.data.size);
      if (event.data.size > 0) {
        setChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      console.log("onStop")
      setChunks(prev => {
        sendAudio(prev);
        return [];
      });
    };

    mediaRecorderRef.current.onerror = (event) => {
      console.error("Media recorder error:", event);
      setError("Recording failed. Please check microphone permissions.");
    };
  }, [sendAudio, mediaRecorderRef]);

  const initAudioCtx = useCallback(async () => {
    setError(null);

    try {
      if (!mediaRecorderRef.current) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const soundRecorder = new MediaRecorder(mediaStream);
        
        mediaRecorderRef.current = soundRecorder;
        setupSoundRecorder();
        soundRecorder.start(CHUNK_SIZE);
        setRecording(true);
      } else {
        if (!recording) {
          mediaRecorderRef.current.start(CHUNK_SIZE);
          setRecording(true);
        } else {
          mediaRecorderRef.current.stop();
          setRecording(false);
        }
      }
    } catch (err) {
      console.error("Error initializing audio recording:", err);
      setError("Could not start recording. Please check microphone access.");
    }
  }, [mediaRecorderRef, recording, setupSoundRecorder]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Mic Stored
      </h1>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Audio Chunking send to server in one goTest
      </h1>
      <p className="p-4">
        This demo records audio from your microphone and sends it to the server. Click the button below to start recording, 
        then speak into your microphone. Click again to stop recording and the audio will be sent to the server.
        It send everything in one go.
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
          controls 
          src="/audio.webm"
          className="mt-4 w-full max-w-md"
          aria-label="Recorded Audio Playback"
        />
      </div>
    </>
  );
}