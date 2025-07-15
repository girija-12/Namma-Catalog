import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation, Language } from "../lib/translations";

interface EnhancedVoiceRecorderProps {
  onTranscription: (text: string) => void;
  isProcessing: boolean;
  language: Language;
}

export function EnhancedVoiceRecorder({ onTranscription, isProcessing, language }: EnhancedVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const t = useTranslation(language);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
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

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      const chunks: BlobPart[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setAudioLevel(0);
        setRecordingTime(0);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success(t("recordingStarted"));
    } catch (error) {
      toast.error(t("couldNotAccessMic"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info(t("processingVoice"));
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    // Enhanced mock transcription with better language detection
    const tamilTranscriptions = [
      "சாம்சங் போன் பதினைந்தாயிரம் ரூபாய் நீல நிறம் நல்ல நிலை",
      "அரிசி பை இருபத்தைந்து கிலோ ஆயிரத்து இருநூறு ரூபாய் பிரீமியம் தரம்",
      "காட்டன் சட்டை மீடியம் சைஸ் ஐநூறு ரூபாய் வெள்ளை நிறம்",
      "டெல் லேப்டாப் நாற்பத்தைந்தாயிரம் ரூபாய் எட்டு ஜிபி ராம் நல்ல வேலை",
      "பாஸ்மதி அரிசி பத்து கிலோ எண்ணூறு ரூபாய் உயர்ந்த தரம்"
    ];
    
    const englishTranscriptions = [
      "Samsung phone fifteen thousand rupees blue color good condition",
      "Rice bag twenty five kg twelve hundred rupees premium quality",
      "Cotton shirt medium size five hundred rupees white color",
      "Dell laptop forty five thousand rupees 8GB RAM good working",
      "Basmati rice ten kg eight hundred rupees premium quality"
    ];
    
    const mixedTranscriptions = [
      "Samsung phone பதினைந்தாயிரம் rupees நீல color good condition",
      "Rice பை இருபத்தைந்து kg ஆயிரத்து இருநூறு rupees premium quality",
      "Cotton சட்டை medium size ஐநூறு rupees வெள்ளை color",
      "Dell laptop நாற்பத்தைந்தாயிரம் rupees 8GB RAM நல்ல working"
    ];

    setTimeout(() => {
      let transcriptions;
      if (language === "ta") {
        transcriptions = [...tamilTranscriptions, ...mixedTranscriptions];
      } else {
        transcriptions = [...englishTranscriptions, ...mixedTranscriptions];
      }
      
      const randomTranscription = transcriptions[Math.floor(Math.random() * transcriptions.length)];
      onTranscription(randomTranscription);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const examplePhrases = language === "ta" ? [
    "சாம்சங் போன், பதினைந்தாயிரம் ரூபாய், நீல நிறம்",
    "அரிசி பை, இருபத்தைந்து கிலோ, ஆயிரத்து இருநூறு ரூபாய்",
    "காட்டன் சட்டை, மீடியம் சைஸ், ஐநூறு ரூபாய்"
  ] : [
    "Samsung phone, fifteen thousand rupees, blue color",
    "Rice bag, twenty five kilo, twelve hundred rupees",
    "Cotton shirt, medium size, five hundred rupees"
  ];

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
      <h3 className="text-xl font-semibold mb-6">{t("voiceInputTitle")}</h3>
      
      {/* Recording Timer */}
      {isRecording && (
        <div className="mb-4">
          <div className="text-2xl font-mono text-red-600">
            {formatTime(recordingTime)}
          </div>
        </div>
      )}
      
      {/* Enhanced Voice Wave Animation */}
      <div className="mb-8">
        <div className="flex justify-center items-center gap-1 h-20">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-200 ${
                isRecording ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{
                width: '3px',
                height: isRecording 
                  ? `${Math.max(8, audioLevel * 80 + Math.random() * 30)}px`
                  : '8px',
                opacity: isRecording ? 0.6 + audioLevel * 0.4 : 0.3,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Recording Button */}
      <div className="mb-6">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`w-24 h-24 rounded-full font-semibold text-white transition-all transform shadow-lg ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 scale-110 animate-pulse shadow-red-200"
              : "bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-blue-200"
          } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto"></div>
          ) : isRecording ? (
            <div className="text-2xl">⏹️</div>
          ) : (
            <div className="text-2xl">🎤</div>
          )}
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-lg font-medium">
          {isProcessing
            ? t("processingVoice")
            : isRecording
            ? t("clickToStop")
            : t("clickToStart")}
        </p>
        <p className="text-sm text-gray-500">
          {t("voiceInstructions")}
        </p>
      </div>

      {/* Enhanced Example prompts */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-3">{t("examplePhrases")}</p>
        <div className="text-xs text-gray-600 space-y-2">
          {examplePhrases.map((phrase, index) => (
            <p key={index} className="bg-white px-3 py-2 rounded border">"{phrase}"</p>
          ))}
        </div>
      </div>
    </div>
  );
}
