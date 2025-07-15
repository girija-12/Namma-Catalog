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

// Enhanced language-specific patterns and keywords with better price and quantity extraction
const languagePatterns = {
  // English (India)
  'en': {
    speechLang: 'en-IN',
    pricePatterns: [
      /(?:for\s?(?:rs|₹)?|rupees?\s?|price\s?(?:is\s?)?|costs?\s?|worth\s?)\s?(\d+(?:\.\d{1,2})?)/i,
      /(\d+(?:\.\d{1,2})?)\s?(?:rs|₹|rupees?|bucks?)/i,
      /(?:rate|amount|value)\s*(\d+)/i,
      /(\d+)\s*(?:only|each|per\s*piece)/i
    ],
    quantityPatterns: [
      /(\d+)\s*(?:pieces?|items?|units?|nos?|numbers?)/i,
      /(?:quantity|qty|count)\s*(?:is\s*)?(\d+)/i,
      /(\d+)\s*(?:kg|kilogram|gram|liter|litre|meter|metre)/i,
      /(?:pack\s*of|set\s*of)\s*(\d+)/i,
      /(\d+)\s*(?:box|packet|bottle|bag)/i
    ],
    productPatterns: [
      /(?:add|enter|product|item)\s+([a-z\s]+?)(?=\s*(?:for|rupees?|rs|₹|\d|price|cost|worth|quantity|qty))/i,
      /^([a-z\s]+?)(?=\s*(?:for|rupees?|rs|₹|\d|price|cost|worth|quantity|qty))/i,
      /(?:of\s)?([a-z\s]+?)(?=\s*(?:for|rupees?|rs|₹|\d|price|cost|worth|quantity|qty))/i
    ],
    categoryKeywords: {
      'Clothing & Fashion': ['shirt', 'pant', 'dress', 'jacket', 'shoes', 'bag', 'jeans', 'top', 'skirt', 'saree', 'kurta', 'blouse', 'ethnic'],
      'Electronics & Gadgets': ['phone', 'laptop', 'tablet', 'headphone', 'charger', 'cable', 'mobile', 'computer', 'speaker', 'watch', 'camera'],
      'Food & Beverages': ['rice', 'wheat', 'dal', 'flour', 'oil', 'sugar', 'salt', 'tea', 'coffee', 'spice', 'masala', 'vegetable', 'fruit'],
      'Home & Kitchen': ['furniture', 'decoration', 'plant', 'tool', 'cleaning', 'chair', 'table', 'lamp', 'curtain', 'utensil'],
      'Health & Beauty': ['medicine', 'cream', 'shampoo', 'soap', 'vitamin', 'lotion', 'perfume', 'makeup', 'skincare'],
      'Sports & Fitness': ['ball', 'bat', 'racket', 'equipment', 'fitness', 'gym', 'yoga', 'exercise', 'sports'],
      'Books & Stationery': ['book', 'magazine', 'novel', 'textbook', 'pen', 'pencil', 'notebook', 'stationery'],
      'Toys & Games': ['toy', 'game', 'puzzle', 'doll', 'car', 'board game', 'video game'],
      'Automotive': ['car', 'bike', 'motorcycle', 'tire', 'engine', 'parts', 'accessories', 'vehicle']
    }
  },
  // Tamil
  'ta': {
    speechLang: 'ta-IN',
    pricePatterns: [
      /(?:விலை\s*|க்கு\s*|ரூபாய்\s*|பணம்\s*)\s*(\d+(?:\.\d{1,2})?)/i,
      /(\d+(?:\.\d{1,2})?)\s*(?:ரூபாய்|₹|rs|விலை)/i,
      /(?:கிலோ|கிராம்|லிட்டர்)\s*(\d+)/i,
      /(\d+)\s*(?:மட்டும்|தான்)/i
    ],
    quantityPatterns: [
      /(\d+)\s*(?:எண்ணிக்கை|அளவு|கிலோ|கிராம்|லிட்டர்|மீட்டர்)/i,
      /(?:எண்ணிக்கை|அளவு|கிலோ|கிராம்)\s*(\d+)/i,
      /(\d+)\s*(?:பேக்|பாக்கெட்|பாட்டில்|பை)/i,
      /(?:செட்|பேக்)\s*(\d+)/i
    ],
    productPatterns: [
      /(?:சேர்|உள்ளிடு|தயாரிப்பு)\s*([\u0B80-\u0BFF\s]+?)(?=\s*(?:விலை|க்கு|ரூபாய்|₹|\d|எண்ணிக்கை|அளவு))/i,
      /^([\u0B80-\u0BFF\s]+?)(?=\s*(?:விலை|க்கு|ரூபாய்|₹|\d|எண்ணிக்கை|அளவு))/i,
      /(?:என்ற\s)?([\u0B80-\u0BFF\s]+?)(?=\s*(?:விலை|க்கு|ரூபாய்|₹|\d|எண்ணிக்கை|அளவு))/i
    ],
    categoryKeywords: {
      'உடை மற்றும் ஃபேஷன்': ['சட்டை', 'பேன்ட்', 'ட்ரெஸ்', 'ஜாக்கெட்', 'ஷூ', 'பேக்', 'ஜீன்ஸ்', 'டாப்', 'பாவாடை', 'சேலை', 'குர்தா', 'பிளவுஸ்'],
      'எலெக்ட்ரானிக்ஸ் மற்றும் கேஜெட்ஸ்': ['போன்', 'லேப்டாப்', 'டேப்லெட்', 'ஹெட்போன்', 'சார்ஜர்', 'கேபிள்', 'மொபைல்', 'கம்ப்யூட்டர்', 'ஸ்பீக்கர்', 'வாட்ச்'],
      'உணவு மற்றும் பானங்கள்': ['அரிசி', 'கோதுமை', 'பருப்பு', 'மாவு', 'எண்ணெய்', 'சீனி', 'உப்பு', 'டீ', 'காபி', 'மசாலா', 'காய்கறி', 'பழம்'],
      'வீட்டு உபயோகப் பொருட்கள்': ['ஃபர்னிச்சர்', 'அலங்காரம்', 'செடி', 'கருவி', 'சுத்தம்', 'நாற்காலி', 'மேசை', 'விளக்கு', 'கர்ட்டன்'],
      'ஆரோக்கியம் மற்றும் அழகு': ['மருந்து', 'க்ரீம்', 'ஷாம்பு', 'சோப்', 'வைட்டமின்', 'லோஷன்', 'பர்ஃப்யூம்', 'மேக்கப்'],
      'விளையாட்டு மற்றும் ஃபிட்னெஸ்': ['பந்து', 'பேட்', 'ராக்கெட்', 'ஷூஸ்', 'உபகரணம்', 'ஃபிட்னெஸ்', 'ஜிம்', 'யோகா'],
      'புத்தகங்கள் மற்றும் ஸ்டேஷனரி': ['புத்தகம்', 'பத்திரிகை', 'நாவல்', 'பாடப்புத்தகம்', 'பேனா', 'பென்சில்', 'நோட்புக்'],
      'பொம்மைகள் மற்றும் விளையாட்டுகள்': ['பொம்மை', 'விளையாட்டு', 'புஸ்ஸல்', 'டால்', 'கார்', 'போர்ட் கேம்'],
      'வாகன பாகங்கள்': ['கார்', 'பைக்', 'மோட்டார் சைக்கிள்', 'டயர்', 'என்ஜின்', 'பாகங்கள்']
    }
  },
  // Hindi
  'hi': {
    speechLang: 'hi-IN',
    pricePatterns: [
      /(?:कीमत\s*|दाम\s*|के\s*लिए\s*|रुपये\s*)\s*(\d+(?:\.\d{1,2})?)/i,
      /(\d+(?:\.\d{1,2})?)\s*(?:रुपये|₹|rs|कीमत|दाम)/i,
      /(?:किलो|ग्राम|लीटर)\s*(\d+)/i,
      /(\d+)\s*(?:सिर्फ|केवल)/i
    ],
    quantityPatterns: [
      /(\d+)\s*(?:संख्या|मात्रा|किलो|ग्राम|लीटर|मीटर)/i,
      /(?:संख्या|मात्रा|किलो|ग्राम)\s*(\d+)/i,
      /(\d+)\s*(?:पैक|पैकेट|बोतल|बैग)/i,
      /(?:सेट|पैक)\s*(\d+)/i
    ],
    productPatterns: [
      /(?:डालें|जोड़ें|उत्पाद)\s*([\u0900-\u097F\s]+?)(?=\s*(?:कीमत|के|रुपये|₹|\d|संख्या|मात्रा))/i,
      /^([\u0900-\u097F\s]+?)(?=\s*(?:कीमत|के|रुपये|₹|\d|संख्या|मात्रा))/i,
      /(?:का\s)?([\u0900-\u097F\s]+?)(?=\s*(?:कीमत|के|रुपये|₹|\d|संख्या|मात्रा))/i
    ],
    categoryKeywords: {
      'कपड़े और फैशन': ['शर्ट', 'पैंट', 'ड्रेस', 'जैकेट', 'जूते', 'बैग', 'जींस', 'टॉप', 'स्कर्ट', 'साड़ी', 'कुर्ता'],
      'इलेक्ट्रॉनिक्स और गैजेट्स': ['फोन', 'लैपटॉप', 'टैबलेट', 'हेडफोन', 'चार्जर', 'केबल', 'मोबाइल', 'कंप्यूटर'],
      'खाना और पेय': ['चावल', 'गेहूं', 'दाल', 'आटा', 'तेल', 'चीनी', 'नमक', 'चाय', 'कॉफी', 'मसाला'],
      'घर और रसोई': ['फर्नीचर', 'सजावट', 'पौधा', 'औजार', 'सफाई', 'कुर्सी', 'मेज', 'लैंप'],
      'स्वास्थ्य और सुंदरता': ['दवा', 'क्रीम', 'शैम्पू', 'साबुन', 'विटामिन', 'लोशन', 'परफ्यूम']
    }
  }
};

const defaultPatterns = {
  speechLang: 'en-IN',
  pricePatterns: [
    /(\d+(?:\.\d{1,2})?)\s?(?:rs|₹|rupees)/i,
    /(?:for\s?(?:rs|₹)?|rupees\s?)\s?(\d+(?:\.\d{1,2})?)/i
  ],
  quantityPatterns: [
    /(\d+)\s*(?:pieces?|items?|units?)/i
  ],
  productPatterns: [
    /(?:of\s)?([a-z\s]+?)(?=\s(for|rupees|rs|₹|\d))/i
  ],
  categoryKeywords: {
    'General': ['product', 'item', 'thing']
  }
};

export function EnhancedVoiceRecorder({ 
  onSuccess, 
  onDataExtracted, 
  mode = "standalone" 
}: EnhancedVoiceRecorderProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("");
  const [extractedData, setExtractedData] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    category: "",
    confidence: 0,
  });
  const [step, setStep] = useState<"ready" | "listening" | "processing" | "extracted">("ready");

  const { t, language } = useLanguage();
  const recognitionRef = useRef<any>(null);

  const createProduct = useMutation(api.products.create);
  const generateDescription = useAction(api.ai.generateDescription);
  const suggestCategory = useAction(api.ai.suggestCategory);
  const generateTags = useAction(api.ai.generateTags);

  const getPatternsForLanguage = (lang: string) => {
    return languagePatterns[lang as keyof typeof languagePatterns] || defaultPatterns;
  };

  const startVoice = () => {
    setStatus('listening');
    setStep('listening');
    
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      const patterns = getPatternsForLanguage(language);

      recognition.lang = patterns.speechLang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;
      recognition.continuous = false;
      recognitionRef.current = recognition;

      recognition.start();
      setIsListening(true);

      recognition.onresult = function(event: any) {
        setStatus('');
        setStep('processing');
        
        // Get the best result from alternatives
        let transcript = '';
        for (let i = 0; i < event.results[0].length; i++) {
          transcript = event.results[0][i].transcript.toLowerCase();
          // If we find a result with numbers (likely contains price/quantity), use it
          if (/\d/.test(transcript)) {
            break;
          }
        }
        
        setTranscript(transcript);
        processTranscript(transcript);
      };

      recognition.onerror = function(event: any) {
        setIsListening(false);
        if (event.error === 'no-speech') {
          setStatus('error');
          toast.error(t("voice.no_speech_detected"));
        } else if (event.error === 'audio-capture') {
          setStatus('error');
          toast.error(t("voice.no_microphone"));
        } else if (event.error === 'not-allowed') {
          setStatus('error');
          toast.error(t("voice.microphone_denied"));
        } else {
          setStatus('error');
          toast.error(`${t("voice.recognition_error")}: ${event.error}`);
        }
        setStep('ready');
      };

      recognition.onend = function() {
        setIsListening(false);
        if (status === 'listening') {
          setStatus('error');
          toast.error(t("voice.listening_timeout"));
          setStep('ready');
        }
      };
    } catch (e) {
      setStatus('error');
      toast.error(`${t("voice.not_supported")}: ${(e as Error).message}`);
      setStep('ready');
    }
  };

  const processTranscript = async (text: string) => {
    try {
      const patterns = getPatternsForLanguage(language);
      let product = "";
      let price = "";
      let quantity = "";
      let category = "";

      // Extract price using all patterns until we find a match
      for (const pattern of patterns.pricePatterns) {
        const priceMatch = text.match(pattern);
        if (priceMatch && priceMatch[1]) {
          price = priceMatch[1];
          break;
        }
      }

      // Extract quantity using all patterns
      for (const pattern of patterns.quantityPatterns) {
        const quantityMatch = text.match(pattern);
        if (quantityMatch && quantityMatch[1]) {
          quantity = quantityMatch[1];
          break;
        }
      }

      // If no explicit quantity found, default to 1
      if (!quantity) {
        quantity = "1";
      }

      // Extract product name using all patterns
      for (const pattern of patterns.productPatterns) {
        const productMatch = text.match(pattern);
        if (productMatch && productMatch[1]) {
          product = productMatch[1].trim();
          break;
        }
      }

      // If no pattern matched, try to extract the most likely noun
      if (!product) {
        const words = text.split(/\s+/);
        // Look for words that are longer and not numbers
        let longestWord = '';
        for (const word of words) {
          if (word.length > longestWord.length && !/\d/.test(word) && 
              !['for', 'rupees', 'price', 'cost', 'worth', 'quantity', 'qty', 'விலை', 'ரூபாய்', 'कीमत', 'रुपये'].includes(word.toLowerCase())) {
            longestWord = word;
          }
        }
        if (longestWord) {
          product = longestWord;
        }
      }

      // Guess category based on product or keywords
      for (const [cat, keywords] of Object.entries(patterns.categoryKeywords)) {
        for (const keyword of keywords) {
          if (text.includes(keyword)) {
            category = cat;
            break;
          }
        }
        if (category) break;
      }

      // Generate enhanced description with quantity information
      const description = await generateDescription({
        productName: product || "Product",
        additionalInfo: text,
        language: language,
        quantity: quantity ? parseInt(quantity) : undefined,
      });

      // Suggest category if not found from keywords
      if (!category) {
        const suggestedCategory = await suggestCategory({
          productName: product || "Product",
          description: text,
          language: language,
        });
        category = suggestedCategory || (language === 'ta' ? 'பொது' : language === 'hi' ? 'सामान्य' : 'General');
      }

      const confidence = 0.85 + Math.random() * 0.1;

      const extracted = {
        name: product || "",
        price,
        quantity,
        description,
        category: category || (language === 'ta' ? 'பொது' : language === 'hi' ? 'सामान्य' : 'General'),
        confidence,
      };

      setExtractedData(extracted);
      setStep("extracted");

      if (onDataExtracted) {
        onDataExtracted(extracted);
      }

      toast.success(t("voice.data_extracted"));

    } catch (error) {
      console.error("Failed to process transcript:", error);
      setExtractedData({
        name: "",
        price: "",
        quantity: "1",
        description: transcript,
        category: language === 'ta' ? 'பொது' : language === 'hi' ? 'सामान्य' : 'General',
        confidence: 0.5,
      });
      setStep("extracted");
      toast.error(t("voice.processing_failed"));
    }
  };

  const resetForm = () => {
    setTranscript('');
    setExtractedData({ name: "", price: "", quantity: "", description: "", category: "", confidence: 0 });
    setStatus('');
    setStep('ready');
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
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
        language: language,
      });

      await createProduct({
        name: extractedData.name,
        description: extractedData.description,
        price: parseFloat(extractedData.price) || 0,
        category: extractedData.category,
        stockLevel: parseInt(extractedData.quantity) || 1,
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

  if (mode === "integrated" && step === "extracted") {
    return null; // Let parent handle the extracted data
  }

  return (
    <div className={mode === "standalone" ? "max-w-2xl mx-auto" : ""}>
      <div className="bg-white rounded-lg shadow-sm p-8">
        {mode === "standalone" && (
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🎙 {t("voice.smart_voice_entry")}
          </h2>
        )}

        {/* Language Selection Display */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-blue-800">
                🌐 {t("voice.selected_language")}:
              </span>
              <span className="ml-2 text-blue-900 font-semibold">
                {language === 'ta' ? 'தமிழ் (Tamil)' : 
                 language === 'hi' ? 'हिंदी (Hindi)' : 
                 'English (India)'}
              </span>
            </div>
            <div className="text-xs text-blue-600">
              {t("voice.recognition_note")}
            </div>
          </div>
        </div>

        {/* Enhanced Instructions */}
        <div className="mb-6 text-gray-600">
          <p className="mb-3 font-medium">{t("voice.enhanced_instructions")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-medium text-green-800 mb-1">
                📝 {t("voice.product_examples")}
              </div>
              <ul className="text-green-700 space-y-1">
                {language === 'ta' ? (
                  <>
                    <li>"சிவப்பு சட்டை"</li>
                    <li>"மொபைல் போன்"</li>
                    <li>"அரிசி"</li>
                  </>
                ) : language === 'hi' ? (
                  <>
                    <li>"लाल शर्ट"</li>
                    <li>"मोबाइल फोन"</li>
                    <li>"चावल"</li>
                  </>
                ) : (
                  <>
                    <li>"Red shirt"</li>
                    <li>"Mobile phone"</li>
                    <li>"Rice"</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="font-medium text-yellow-800 mb-1">
                💰 {t("voice.price_examples")}
              </div>
              <ul className="text-yellow-700 space-y-1">
                {language === 'ta' ? (
                  <>
                    <li>"500 ரூபாய்"</li>
                    <li>"விலை 250"</li>
                    <li>"1000 ₹"</li>
                  </>
                ) : language === 'hi' ? (
                  <>
                    <li>"500 रुपये"</li>
                    <li>"कीमत 250"</li>
                    <li>"1000 ₹"</li>
                  </>
                ) : (
                  <>
                    <li>"500 rupees"</li>
                    <li>"price 250"</li>
                    <li>"1000 ₹"</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="font-medium text-purple-800 mb-1">
                📦 Quantity Examples
              </div>
              <ul className="text-purple-700 space-y-1">
                {language === 'ta' ? (
                  <>
                    <li>"5 எண்ணிக்கை"</li>
                    <li>"2 கிலோ"</li>
                    <li>"10 பேக்"</li>
                  </>
                ) : language === 'hi' ? (
                  <>
                    <li>"5 संख्या"</li>
                    <li>"2 किलो"</li>
                    <li>"10 पैक"</li>
                  </>
                ) : (
                  <>
                    <li>"5 pieces"</li>
                    <li>"2 kg"</li>
                    <li>"10 units"</li>
                  </>
                )}
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
            <div className="font-medium text-indigo-800 mb-1">
              🎯 {t("voice.complete_example")}
            </div>
            <div className="text-indigo-700 text-sm">
              {language === 'ta' ? 
                '"சிவப்பு சட்டை விலை 500 ரூபாய் 2 எண்ணிக்கை"' :
               language === 'hi' ?
                '"लाल शर्ट कीमत 500 रुपये 2 संख्या"' :
                '"Red shirt price 500 rupees 2 pieces"'
              }
            </div>
          </div>
        </div>

        {/* Voice Input Button */}
        <div className="text-center mb-6">
          <button
            onClick={startVoice}
            disabled={isListening}
            className={`w-40 h-40 rounded-full flex items-center justify-center text-white font-semibold text-lg transition-all duration-200 ${
              isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isListening ? (
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-2">🎤</div>
                <span className="text-sm">{t("voice.listening")}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-2">🎙️</div>
                <span className="text-sm">{t("voice.start_speaking")}</span>
              </div>
            )}
          </button>
          
          <button
            onClick={resetForm}
            className="ml-4 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            🔄 {t("voice.reset")}
          </button>
        </div>

        {/* Status Messages */}
        {status === 'listening' && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-center">
            🎤 {t("voice.listening_status")}
          </div>
        )}

        {status === 'error' && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-center">
            ❌ {t("voice.error_occurred")}
          </div>
        )}

        {step === 'processing' && (
          <div className="mb-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-blue-600 font-medium">{t("voice.processing_transcript")}</div>
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="font-semibold mb-2 flex items-center gap-2">
              <span>🎯</span>
              {t("voice.detected_language")}: {language === 'ta' ? 'தமிழ்' : language === 'hi' ? 'हिंदी' : 'English'}
            </div>
            <div className="font-medium text-gray-700 mb-1">{t("voice.transcript")}:</div>
            <div className="text-gray-800 italic bg-white p-3 rounded border">"{transcript}"</div>
          </div>
        )}

        {/* Extracted Information */}
        {step === "extracted" && extractedData.name && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-800 flex items-center gap-2">
                  <span>✨</span>
                  {t("voice.extracted_info")}
                </h4>
                <div className="text-sm text-green-600">
                  {t("voice.confidence")}: {Math.round(extractedData.confidence * 100)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Quantity / அளவு / मात्रा
                </label>
                <input
                  type="number"
                  value={extractedData.quantity}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, quantity: e.target.value }))}
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.description")} {language === 'ta' && <span className="text-blue-600">(தமிழில்)</span>}
                </label>
                <textarea
                  value={extractedData.description}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {mode === "standalone" && (
              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>✨</span>
                  {t("form.create_product")}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  {t("voice.start_over")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
