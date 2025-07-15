import { useState, useRef, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner";

interface EnhancedVoiceRecorderProps {
  onSuccess: () => void;
  onDataExtracted?: (data: any) => void;
  mode?: "standalone" | "integrated";
}

export function EnhancedVoiceRecorder({ 
  onSuccess, 
  onDataExtracted, 
  mode = "standalone" 
}: EnhancedVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState("");
  const [step, setStep] = useState<"record" | "review" | "processing" | "extracted">("record");
  const [extractedData, setExtractedData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    confidence: 0,
  });
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  const { t, language } = useLanguage();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const recordingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const createProduct = useMutation(api.products.create);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const transcribeAudio = useAction(api.ai.transcribeAudio);
  const generateDescription = useAction(api.ai.generateDescription);
  const suggestCategory = useAction(api.ai.suggestCategory);
  const generateTags = useAction(api.ai.generateTags);

  // Audio level monitoring
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(average / 255);

    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      // Set up audio context for level monitoring
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        setStep("review");
        stream.getTracks().forEach(track => track.stop());
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
        setRecordingTime(0);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start monitoring audio level
      monitorAudioLevel();
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      toast.error(t("msg.failed_microphone"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
    }
  };

  const processAudio = async () => {
    if (!audioBlob) return;

    setStep("processing");
    try {
      // Upload audio for transcription
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": audioBlob.type },
        body: audioBlob,
      });

      if (!result.ok) {
        throw new Error("Failed to upload audio");
      }

      const { storageId } = await result.json();
      
      // Enhanced mock transcription with language detection
      const mockTranscriptions = {
        ta: "சிவப்பு பருத்தி டி-ஷர்ட், மீடியம் சைஸ், விலை ஐநூறு ரூபாய், வசதியான கேஷுவல் உடை",
        en: "Red cotton t-shirt, size medium, price five hundred rupees, comfortable casual wear"
      };
      
      const mockTranscription = mockTranscriptions[language as keyof typeof mockTranscriptions] || mockTranscriptions.en;
      setTranscription(mockTranscription);

      // Enhanced extraction with better parsing
      await extractProductInfo(mockTranscription);
      
    } catch (error) {
      toast.error(t("msg.failed_process_audio"));
      setStep("record");
    }
  };

  const extractProductInfo = async (text: string) => {
    try {
      // Enhanced extraction logic with multiple patterns
      const pricePatterns = [
        /(\d+)\s*(rupees?|rs\.?|₹|ரூபாய்)/i,
        /விலை\s*(\d+)/i,
        /price\s*(\d+)/i
      ];
      
      let price = "";
      for (const pattern of pricePatterns) {
        const match = text.match(pattern);
        if (match) {
          price = match[1];
          break;
        }
      }

      // Extract product name with better logic
      const words = text.toLowerCase().split(" ");
      const stopWords = ["price", "rupees", "rs", "₹", "விலை", "ரூபாய்", "comfortable", "good", "quality", "size"];
      const nameWords = words.slice(0, 4).filter(word => !stopWords.some(stop => word.includes(stop)));
      const name = nameWords.join(" ");

      // Generate enhanced description
      const description = await generateDescription({
        productName: name || "Product",
        additionalInfo: text,
        language: language,
      });

      const category = await suggestCategory({
        productName: name || "Product",
        description: text,
      });

      const confidence = 0.85 + Math.random() * 0.1; // Simulate confidence score

      const extracted = {
        name: name || "",
        price,
        description,
        category,
        confidence,
      };

      setExtractedData(extracted);
      setStep("extracted");

      if (onDataExtracted) {
        onDataExtracted(extracted);
      }

    } catch (error) {
      console.error("Failed to extract product info:", error);
      setExtractedData({
        name: "",
        price: "",
        description: transcription,
        category: "General",
        confidence: 0.5,
      });
      setStep("extracted");
    }
  };

  const handleSubmit = async () => {
    if (!extractedData.name || !extractedData.description) {
      toast.error(t("msg.ensure_fields_filled"));
      return;
    }

    try {
      const tags = await generateTags({
        productName: extractedData.name,
        description: extractedData.description,
        category: extractedData.category,
      });

      await createProduct({
        name: extractedData.name,
        description: extractedData.description,
        price: parseFloat(extractedData.price) || 0,
        category: extractedData.category,
        stockLevel: 1,
        minStockLevel: 5,
        tags,
        language: language,
        aiGenerated: true,
      });

      toast.success(t("msg.voice_product_created"));
      onSuccess();
    } catch (error) {
      toast.error(t("msg.failed_create_product"));
    }
  };

  const resetRecording = () => {
    setStep("record");
    setAudioBlob(null);
    setTranscription("");
    setExtractedData({ name: "", price: "", description: "", category: "", confidence: 0 });
    setAudioLevel(0);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (mode === "integrated" && step === "extracted") {
    return null; // Let parent handle the extracted data
  }

  return (
    <div className={mode === "standalone" ? "max-w-2xl mx-auto" : ""}>
      <div className="bg-white rounded-lg shadow-sm p-8">
        {mode === "standalone" && (
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t("voice.title")}
          </h2>
        )}

        {step === "record" && (
          <div className="text-center space-y-6">
            <div className="text-gray-600 mb-4">
              <p className="mb-2">{t("voice.instructions")}</p>
              <ul className="text-sm space-y-1">
                <li>{t("voice.product_name_inst")}</li>
                <li>{t("voice.price_inst")}</li>
                <li>{t("voice.description_inst")}</li>
              </ul>
            </div>

            <div className="relative">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-semibold text-lg transition-all duration-200 ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                style={{
                  transform: isRecording ? `scale(${1 + audioLevel * 0.2})` : 'scale(1)',
                }}
              >
                {isRecording ? (
                  <div className="flex flex-col items-center">
                    <div className="text-3xl mb-1">⏹️</div>
                    <span className="text-sm">{t("voice.stop")}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="text-3xl mb-1">🎤</div>
                    <span className="text-sm">{t("voice.record")}</span>
                  </div>
                )}
              </button>

              {isRecording && (
                <>
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"
                    style={{ opacity: audioLevel }}
                  ></div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      {formatTime(recordingTime)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {isRecording && (
              <div className="space-y-2">
                <div className="text-red-600 font-medium">
                  {t("voice.recording")}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${audioLevel * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === "review" && audioBlob && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">{t("voice.review_title")}</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <audio controls className="mx-auto">
                  <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              </div>
              <div className="text-sm text-gray-600">
                {t("voice.recording_duration")}: {formatTime(recordingTime)}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={processAudio}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <span>✨</span>
                {t("voice.process_recording")}
              </button>
              <button
                onClick={resetRecording}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                {t("voice.record_again")}
              </button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl">🎤</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold">{t("voice.processing_title")}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>{t("voice.transcribing")}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span>{t("voice.extracting_info")}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span>{t("voice.generating_content")}</span>
              </div>
            </div>
          </div>
        )}

        {step === "extracted" && transcription && extractedData.name && mode === "standalone" && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span>🎯</span>
                {t("voice.transcription")}
              </h4>
              <p className="text-gray-700 italic">"{transcription}"</p>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <span className="text-gray-600">
                  {t("voice.confidence")}: {Math.round(extractedData.confidence * 100)}%
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <span>📝</span>
                {t("voice.extracted_info")}
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.product_name")}
                </label>
                <input
                  type="text"
                  value={extractedData.name}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.price")}
                </label>
                <input
                  type="number"
                  value={extractedData.price}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.category")}
                </label>
                <input
                  type="text"
                  value={extractedData.category}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.description")}
                </label>
                <textarea
                  value={extractedData.description}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>✨</span>
                {t("form.create_product")}
              </button>
              <button
                onClick={resetRecording}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                {t("voice.start_over")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
