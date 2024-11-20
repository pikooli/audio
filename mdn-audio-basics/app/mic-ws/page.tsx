"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const CHUNK_SIZE = 5000;

export default function MicWs() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);


  useEffect(() => {
    if (wsRef.current) {
      return;
    }
    wsRef.current = new WebSocket("ws://localhost:3002");
    wsRef.current.onopen = () => {
      console.log("ws open");
    };
    wsRef.current.onmessage = (event) => {
      console.log("onmessage", event);
    };
    wsRef.current.onerror = (event) => {
      console.error("ws error", event);
    };
    wsRef.current.onclose = () => {
      console.log("ws close");
    };
  }, []);

  const setupSoundRecorder = useCallback(() => {
    if (!mediaRecorderRef.current) {
      return;
    }
    mediaRecorderRef.current.ondataavailable = (event) => {
      console.log("ondataavailable", event.data.size);
      if (wsRef.current && event.data.size > 0) {
        wsRef.current.send(event.data);
        setChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      console.log("onStop")
    };

    mediaRecorderRef.current.onerror = (event) => {
      console.error("Media recorder error:", event);
      setError("Recording failed. Please check microphone permissions.");
    };
  }, [mediaRecorderRef, wsRef]);

  const initAudioCtx = useCallback(async () => {
    setError(null);

    try {
      if (!mediaRecorderRef.current) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const soundRecorder = new MediaRecorder(mediaStream);
        
        mediaRecorderRef.current = soundRecorder;
        setupSoundRecorder();
        soundRecorder.start(CHUNK_SIZE);
        setIsRecording(true);
      } else {
        if (!isRecording) {
          mediaRecorderRef.current.start(CHUNK_SIZE);
          setIsRecording(true);
        } else {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }
    } catch (err) {
      console.error("Error initializing audio recording:", err);
      setError("Could not start recording. Please check microphone access.");
    }
  }, [mediaRecorderRef, isRecording, setupSoundRecorder]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Mic Ws
      </h1>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Audio Chunking send to server by ws by chunk Test
      </h1>
      <p className="p-4">
        This demo records audio from your microphone and sends it to the server. Click the button below to start recording, 
        then speak into your microphone. Click again to stop recording and the audio will be sent to the server.
        It send everything by chunk.
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
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
            } 
            text-white font-semibold
          `}
          onClick={initAudioCtx}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        <div className="grid grid-cols-4 gap-2">
        {chunks.map((chunk, index) => (
          <p key={index}>Chunk {index} : {chunk.size}</p>
        ))}
        </div>
      </div>
    </>
  );
}