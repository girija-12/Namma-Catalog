import { useState, useRef, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onSuccess: () => void;
}

export function VoiceRecorder({ onSuccess }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState("");
  const [step, setStep] = useState<"record" | "review" | "processing">("record");
  const [extractedData, setExtractedData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
  });

  const { t } = useLanguage();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const createProduct = useMutation(api.products.create);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const transcribeAudio = useAction(api.ai.transcribeAudio);
  const generateDescription = useAction(api.ai.generateDescription);
  const suggestCategory = useAction(api.ai.suggestCategory);
  const generateTags = useAction(api.ai.generateTags);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        setStep("review");
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error(t("msg.failed_microphone"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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
      
      // For demo purposes, we'll simulate transcription
      // In production, you would integrate with Whisper API
      const mockTranscription = "Red cotton t-shirt, size medium, price 500 rupees, comfortable casual wear";
      setTranscription(mockTranscription);

      // Extract product information from transcription using AI
      await extractProductInfo(mockTranscription);
      
    } catch (error) {
      toast.error(t("msg.failed_process_audio"));
      setStep("record");
    }
  };

  const extractProductInfo = async (text: string) => {
    try {
      // Simple extraction logic - in production, use more sophisticated NLP
      const words = text.toLowerCase().split(" ");
      
      // Extract price
      const priceMatch = text.match(/(\d+)\s*(rupees?|rs\.?|₹)/i);
      const price = priceMatch ? priceMatch[1] : "";

      // Extract product name (first few words before price/description keywords)
      const stopWords = ["price", "rupees", "rs", "₹", "comfortable", "good", "quality"];
      const nameWords = words.slice(0, 3).filter(word => !stopWords.includes(word));
      const name = nameWords.join(" ");

      // Generate description and category
      const description = await generateDescription({
        productName: name || "Product",
        additionalInfo: text,
      });

      const category = await suggestCategory({
        productName: name || "Product",
        description: text,
      });

      setExtractedData({
        name: name || "",
        price,
        description,
        category,
      });

    } catch (error) {
      console.error("Failed to extract product info:", error);
      setExtractedData({
        name: "",
        price: "",
        description: transcription,
        category: "General",
      });
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
        language: "en",
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
    setExtractedData({ name: "", price: "", description: "", category: "" });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {t("voice.title")}
        </h2>

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
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
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
                <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
              )}
            </div>

            {isRecording && (
              <div className="text-red-600 font-medium">
                {t("voice.recording")}
              </div>
            )}
          </div>
        )}

        {step === "review" && audioBlob && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">{t("voice.review_title")}</h3>
              <audio controls className="mx-auto mb-4">
                <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={processAudio}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h3 className="text-lg font-semibold">{t("voice.processing_title")}</h3>
            <p className="text-gray-600">
              {t("voice.processing_desc")}
            </p>
          </div>
        )}

        {transcription && extractedData.name && (
          <div className="mt-8 space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">{t("voice.transcription")}</h4>
              <p className="text-gray-700 italic">"{transcription}"</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">{t("voice.extracted_info")}</h4>
              
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
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
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
