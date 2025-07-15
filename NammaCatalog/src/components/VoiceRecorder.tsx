import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  isProcessing: boolean;
}

export function VoiceRecorder({ onTranscription, isProcessing }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis for visual feedback
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average / 255);
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();

      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        setAudioLevel(0);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success("Recording started! Speak clearly...");
    } catch (error) {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Processing your voice...");
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    // Simulate speech-to-text processing
    // In a real implementation, you would send this to a speech recognition service
    setTimeout(() => {
      // Mock transcription for demo
      const mockTranscriptions = [
        "Samsung phone 15000 rupees blue color good condition",
        "Rice bag 25 kg 1200 rupees premium quality",
        "Cotton shirt medium size 500 rupees white color",
        "Laptop Dell 45000 rupees 8GB RAM good working",
      ];
      const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      onTranscription(randomTranscription);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
      <h3 className="text-xl font-semibold mb-6">Voice Input</h3>
      
      {/* Voice Wave Animation */}
      <div className="mb-8">
        <div className="flex justify-center items-center gap-1 h-16">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="bg-blue-500 rounded-full transition-all duration-150"
              style={{
                width: '4px',
                height: isRecording 
                  ? `${Math.max(8, audioLevel * 60 + Math.random() * 20)}px`
                  : '8px',
                opacity: isRecording ? 0.7 + audioLevel * 0.3 : 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Recording Button */}
      <div className="mb-6">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`w-20 h-20 rounded-full font-semibold text-white transition-all transform ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 scale-110 animate-pulse"
              : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
          } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          ) : isRecording ? (
            "⏹️"
          ) : (
            "🎤"
          )}
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-medium">
          {isProcessing
            ? "Processing your voice..."
            : isRecording
            ? "Recording... Click to stop"
            : "Click to start recording"}
        </p>
        <p className="text-sm text-gray-500">
          Speak in Tamil, English, or both • Say product name, price, and details
        </p>
      </div>

      {/* Example prompts */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">Example phrases:</p>
        <div className="text-xs text-gray-600 space-y-1">
          <p>"Samsung phone, fifteen thousand rupees, blue color"</p>
          <p>"Rice bag, twenty five kilo, twelve hundred rupees"</p>
          <p>"Cotton shirt, medium size, five hundred rupees"</p>
        </div>
      </div>
    </div>
  );
}
