"use client";

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface VoiceUpdateProps {
  projectId: number;
  onUpdateComplete: (text: string) => void;
}

export default function VoiceUpdate({ projectId, onUpdateComplete }: VoiceUpdateProps) {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US'; // Default, can be dynamic based on language

    recognitionRef.current.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleCommit = async () => {
    if (transcript.trim()) {
      // Feature 7: Voice-to-Task Intent Detection
      const lowerTranscript = transcript.toLowerCase();
      const completionKeywords = ['finished', 'completed', 'done', 'finalized'];
      
      const isTaskCompletion = completionKeywords.some(keyword => lowerTranscript.includes(keyword));
      
      if (isTaskCompletion) {
        console.log("Task completion intent detected!");
        // Call API to update task status automatically
        await fetch(`/api/v1/kalide-one/projects/${projectId}/tasks/update-by-voice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript })
        });
      }

      onUpdateComplete(transcript);
      setTranscript('');
    }
  };

  if (!isSupported) {
    return <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-2">Speech Recognition not supported in this browser.</p>;
  }

  return (
    <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hands-Free Update</h4>
        <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`} />
      </div>
      
      <div className="bg-black/40 p-4 rounded-xl min-h-[100px] border border-white/5 relative">
        <p className={`text-sm font-medium ${transcript ? 'text-white' : 'text-slate-600 italic'}`}>
          {transcript || "Speak now to record your update..."}
        </p>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={toggleRecording}
          className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center space-x-2 ${
            isRecording ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-primary text-white'
          }`}
        >
          <span>{isRecording ? "Stop Recording" : "Start Voice Input"}</span>
        </button>
        
        {transcript && !isRecording && (
          <button 
            onClick={handleCommit}
            className="px-6 py-4 bg-secondary text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
          >
            Send Update
          </button>
        )}
      </div>
    </div>
  );
}
