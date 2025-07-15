import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ta' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // App
    "app.title": "Smart Inventory",
    
    // Auth
    "auth.title": "Smart Inventory",
    "auth.subtitle": "AI-Powered Inventory Management",
    "auth.features": "Voice Input • Multi-language • Real-time",
    
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.add_product": "Add Product",
    "nav.voice_entry": "Voice Entry",
    "nav.voice": "Voice",
    "nav.notifications": "Notifications",
    "nav.settings": "Settings",
    
    // Dashboard
    "dashboard.welcome": "Welcome to Your Smart Inventory",
    "dashboard.subtitle": "Manage your products with AI-powered tools",
    "dashboard.ai_powered": "AI Powered",
    "dashboard.voice_enabled": "Voice Enabled",
    "dashboard.mobile_ready": "Mobile Ready",
    
    // Stats
    "stats.total_products": "Total Products",
    "stats.active_products": "Active Products", 
    "stats.low_stock": "Low Stock Items",
    "stats.total_value": "Total Value",
    
    // Alerts
    "alerts.low_stock_title": "Low Stock Alert",
    "alerts.products_need_attention": "products need attention",
    
    // Search and Filter
    "search.placeholder": "Search products...",
    "filter.all_categories": "All Categories",
    "sort.newest_first": "Newest First",
    "sort.oldest_first": "Oldest First",
    "sort.name_az": "Name A-Z",
    "sort.name_za": "Name Z-A",
    "sort.price_high_low": "Price High-Low",
    "sort.price_low_high": "Price Low-High",
    "sort.stock_low_high": "Stock Low-High",
    "sort.stock_high_low": "Stock High-Low",
    
    // Insights
    "insights.top_products": "Top Products by Value",
    "insights.categories": "Category Distribution",
    
    // Empty States
    "empty.no_products": "No Products Found",
    "empty.adjust_filters": "Try adjusting your search or filters",
    "empty.no_products_desc": "Start by adding your first product",
    "empty.add_manually": "Add Manually",
    "empty.add_voice": "Add with Voice",
    "empty.add_photo": "Add with Photo",
    
    // Form
    "form.add_product": "Add New Product",
    "form.product_name": "Product Name",
    "form.product_name_placeholder": "Enter product name",
    "form.description": "Description",
    "form.description_placeholder": "Describe your product",
    "form.price": "Price (₹)",
    "form.category": "Category",
    "form.category_placeholder": "e.g., Electronics, Clothing",
    "form.stock_level": "Stock Level",
    "form.min_stock": "Minimum Stock",
    "form.product_image": "Product Image",
    "form.language": "Language",
    "form.create_product": "Create Product",
    "form.creating": "Creating...",
    "form.generate_description": "Generate Description with AI",
    "form.generating": "Generating...",
    "form.ai_suggest": "AI Suggest",
    "form.input_method": "Choose Input Method",
    "form.manual_entry": "Manual Entry",
    "form.manual_desc": "Type product details manually",
    "form.voice_entry": "Voice Entry",
    "form.voice_desc": "Speak product details naturally",
    "form.image_entry": "Image Entry",
    "form.image_desc": "Capture or upload product image",
    "form.complete": "Complete",
    "form.or": "OR",
    "form.capture_image": "Capture Image",
    "form.image_captured": "Image Captured",
    
    // Voice
    "voice.title": "Voice Product Entry",
    "voice.smart_voice_entry": "Smart Voice Product Entry",
    "voice.instructions": "Speak naturally about your product:",
    "voice.enhanced_instructions": "Speak naturally in your selected language. Include product name, price, and any details:",
    "voice.product_name_inst": "• Product name (e.g., 'Red cotton shirt')",
    "voice.price_inst": "• Price (e.g., '500 rupees' or 'price 250')",
    "voice.description_inst": "• Any additional details",
    "voice.record": "Record",
    "voice.stop": "Stop",
    "voice.recording": "Recording...",
    "voice.review_title": "Review Your Recording",
    "voice.recording_duration": "Recording Duration",
    "voice.process_recording": "Process Recording",
    "voice.record_again": "Record Again",
    "voice.processing_title": "Processing Audio...",
    "voice.processing_desc": "Analyzing your voice input and extracting product information",
    "voice.transcribing": "Transcribing audio",
    "voice.extracting_info": "Extracting product information",
    "voice.generating_content": "Generating description",
    "voice.transcription": "Transcription",
    "voice.extracted_info": "Extracted Information",
    "voice.confidence": "Confidence",
    "voice.start_over": "Start Over",
    "voice.selected_language": "Selected Language",
    "voice.recognition_note": "Voice recognition availability depends on your browser",
    "voice.product_examples": "Product Examples",
    "voice.price_examples": "Price Examples", 
    "voice.complete_example": "Complete Example",
    "voice.start_speaking": "Start Speaking",
    "voice.listening": "Listening...",
    "voice.reset": "Reset",
    "voice.listening_status": "Listening... Speak now",
    "voice.error_occurred": "An error occurred",
    "voice.processing_transcript": "Processing your speech...",
    "voice.detected_language": "Detected Language",
    "voice.transcript": "Transcript",
    "voice.data_extracted": "Product data extracted successfully!",
    "voice.processing_failed": "Failed to process speech",
    "voice.no_speech_detected": "No speech detected",
    "voice.no_microphone": "No microphone found",
    "voice.microphone_denied": "Microphone access denied",
    "voice.recognition_error": "Speech recognition error",
    "voice.listening_timeout": "Listening timed out. Try again.",
    "voice.not_supported": "Speech recognition not supported in this browser",
    
    // Image
    "image.capture_title": "Capture Product Image",
    "image.camera": "Camera",
    "image.upload": "Upload",
    "image.center_product": "Center your product in the frame",
    "image.capture": "Capture Photo",
    "image.click_upload": "Click to upload an image",
    "image.supported_formats": "Supports JPG, PNG, GIF",
    "image.captured": "Captured",
    "image.retake": "Retake",
    "image.process": "Process Image",
    "image.processing": "Processing...",
    "image.ai_processing": "AI is processing your image...",
    "image.extracting_text": "Extracting text from image",
    "image.identifying_product": "Identifying product details", 
    "image.generating_description": "Generating product description",
    "image.ocr_initializing": "Initializing OCR engine...",
    "image.ocr_loading": "Loading text recognition...",
    "image.ocr_processing": "Processing image...",
    "image.ocr_complete": "Text extraction complete!",
    
    // Product Card
    "card.ai_generated": "AI Generated",
    "card.low_stock": "Low Stock",
    "card.stock": "Stock:",
    "card.edit": "Edit",
    "card.delete": "Delete",
    "card.save": "Save",
    "card.cancel": "Cancel",
    "card.activate": "Activate",
    "card.deactivate": "Deactivate",
    
    // Messages
    "msg.product_created": "Product created successfully!",
    "msg.voice_product_created": "Product created from voice input!",
    "msg.failed_create_product": "Failed to create product",
    "msg.description_generated": "Description generated successfully!",
    "msg.failed_generate_description": "Failed to generate description",
    "msg.category_suggested": "Category suggested successfully!",
    "msg.failed_suggest_category": "Failed to suggest category",
    "msg.enter_product_name": "Please enter a product name first",
    "msg.fill_required_fields": "Please fill in all required fields",
    "msg.ensure_fields_filled": "Please ensure all fields are filled",
    "msg.failed_microphone": "Failed to access microphone",
    "msg.failed_process_audio": "Failed to process audio",
    "msg.stock_updated": "Stock level updated successfully!",
    "msg.failed_update_stock": "Failed to update stock level",
    "msg.product_deleted": "Product deleted successfully!",
    "msg.failed_delete_product": "Failed to delete product",
    "msg.confirm_delete": "Are you sure you want to delete this product?",
    "msg.image_data_extracted": "Image data extracted successfully!",
    "msg.voice_data_extracted": "Voice data extracted successfully!",
    "msg.image_processed": "Image processed successfully!",
    "msg.failed_process_image": "Failed to process image",
  },
  ta: {
    // App
    "app.title": "ஸ்மார்ட் இன்வென்டரி",
    
    // Auth
    "auth.title": "ஸ்மார்ட் இன்வென்டரி",
    "auth.subtitle": "AI-இயங்கும் இன்வென்டரி மேலாண்மை",
    "auth.features": "குரல் உள்ளீடு • பல மொழி • நேரடி",
    
    // Navigation
    "nav.dashboard": "டாஷ்போர்ட்",
    "nav.add_product": "தயாரிப்பு சேர்க்க",
    "nav.voice_entry": "குரல் உள்ளீடு",
    "nav.voice": "குரல்",
    "nav.notifications": "அறிவிப்புகள்",
    "nav.settings": "அமைப்புகள்",
    
    // Dashboard
    "dashboard.welcome": "உங்கள் ஸ்மார்ட் இன்வென்டரிக்கு வரவேற்கிறோம்",
    "dashboard.subtitle": "AI-இயங்கும் கருவிகளுடன் உங்கள் தயாரிப்புகளை நிர்வகிக்கவும்",
    "dashboard.ai_powered": "AI இயங்கும்",
    "dashboard.voice_enabled": "குரல் இயக்கப்பட்டது",
    "dashboard.mobile_ready": "மொபைல் தயார்",
    
    // Stats
    "stats.total_products": "மொத்த தயாரிப்புகள்",
    "stats.active_products": "செயலில் உள்ள தயாரிப்புகள்",
    "stats.low_stock": "குறைந்த ஸ்டாக் பொருட்கள்",
    "stats.total_value": "மொத்த மதிப்பு",
    
    // Alerts
    "alerts.low_stock_title": "குறைந்த ஸ்டாக் எச்சரிக்கை",
    "alerts.products_need_attention": "தயாரிப்புகளுக்கு கவனம் தேவை",
    
    // Search and Filter
    "search.placeholder": "தயாரிப்புகளைத் தேடுங்கள்...",
    "filter.all_categories": "அனைத்து வகைகள்",
    "sort.newest_first": "புதியது முதலில்",
    "sort.oldest_first": "பழையது முதலில்",
    "sort.name_az": "பெயர் அ-ஃ",
    "sort.name_za": "பெயர் ஃ-அ",
    "sort.price_high_low": "விலை அதிகம்-குறைவு",
    "sort.price_low_high": "விலை குறைவு-அதிகம்",
    "sort.stock_low_high": "ஸ்டாக் குறைவு-அதிகம்",
    "sort.stock_high_low": "ஸ்டாக் அதிகம்-குறைவு",
    
    // Insights
    "insights.top_products": "மதிப்பின் அடிப்படையில் சிறந்த தயாரிப்புகள்",
    "insights.categories": "வகை விநியோகம்",
    
    // Empty States
    "empty.no_products": "தயாரிப்புகள் இல்லை",
    "empty.adjust_filters": "உங்கள் தேடல் அல்லது வடிகட்டிகளை சரிசெய்ய முயற்சிக்கவும்",
    "empty.no_products_desc": "உங்கள் முதல் தயாரிப்பைச் சேர்ப்பதன் மூலம் தொடங்குங்கள்",
    "empty.add_manually": "கைமுறையாக சேர்க்கவும்",
    "empty.add_voice": "குரலுடன் சேர்க்கவும்",
    "empty.add_photo": "புகைப்படத்துடன் சேர்க்கவும்",
    
    // Form
    "form.add_product": "புதிய தயாரிப்பு சேர்க்கவும்",
    "form.product_name": "தயாரிப்பு பெயர்",
    "form.product_name_placeholder": "தயாரிப்பு பெயரை உள்ளிடவும்",
    "form.description": "விளக்கம்",
    "form.description_placeholder": "உங்கள் தயாரிப்பை விவரிக்கவும்",
    "form.price": "விலை (₹)",
    "form.category": "வகை",
    "form.category_placeholder": "எ.கா., எலெக்ட்ரானிக்ஸ், உடை",
    "form.stock_level": "ஸ்டாக் நிலை",
    "form.min_stock": "குறைந்தபட்ச ஸ்டாக்",
    "form.product_image": "தயாரிப்பு படம்",
    "form.language": "மொழி",
    "form.create_product": "தயாரிப்பு உருவாக்கவும்",
    "form.creating": "உருவாக்குகிறது...",
    "form.generate_description": "AI உடன் விளக்கம் உருவாக்கவும்",
    "form.generating": "உருவாக்குகிறது...",
    "form.ai_suggest": "AI பரிந்துரை",
    "form.input_method": "உள்ளீட்டு முறையைத் தேர்ந்தெடுக்கவும்",
    "form.manual_entry": "கைமுறை உள்ளீடு",
    "form.manual_desc": "தயாரிப்பு விவரங்களை கைமுறையாக தட்டச்சு செய்யவும்",
    "form.voice_entry": "குரல் உள்ளீடு",
    "form.voice_desc": "தயாரிப்பு விவரங்களை இயல்பாக பேசுங்கள்",
    "form.image_entry": "படம் உள்ளீடு",
    "form.image_desc": "தயாரிப்பு படத்தை எடுக்கவும் அல்லது பதிவேற்றவும்",
    "form.complete": "முழுமை",
    "form.or": "அல்லது",
    "form.capture_image": "படம் எடுக்கவும்",
    "form.image_captured": "படம் எடுக்கப்பட்டது",
    
    // Voice
    "voice.title": "குரல் தயாரிப்பு உள்ளீடு",
    "voice.smart_voice_entry": "ஸ்மார்ட் குரல் தயாரிப்பு உள்ளீடு",
    "voice.instructions": "உங்கள் தயாரிப்பைப் பற்றி இயல்பாக பேசுங்கள்:",
    "voice.enhanced_instructions": "உங்கள் தேர்ந்தெடுக்கப்பட்ட மொழியில் இயல்பாக பேசுங்கள். தயாரிப்பு பெயர், விலை மற்றும் விவரங்களை சேர்க்கவும்:",
    "voice.product_name_inst": "• தயாரிப்பு பெயர் (எ.கா., 'சிவப்பு பருத்தி சட்டை')",
    "voice.price_inst": "• விலை (எ.கா., '500 ரூபாய்' அல்லது 'விலை 250')",
    "voice.description_inst": "• கூடுதல் விவரங்கள்",
    "voice.record": "பதிவு செய்",
    "voice.stop": "நிறுத்து",
    "voice.recording": "பதிவு செய்கிறது...",
    "voice.review_title": "உங்கள் பதிவை மதிப்பாய்வு செய்யவும்",
    "voice.recording_duration": "பதிவு கால அளவு",
    "voice.process_recording": "பதிவை செயலாக்கவும்",
    "voice.record_again": "மீண்டும் பதிவு செய்யவும்",
    "voice.processing_title": "ஆடியோவை செயலாக்குகிறது...",
    "voice.processing_desc": "உங்கள் குரல் உள்ளீட்டை பகுப்பாய்வு செய்து தயாரிப்பு தகவலை பிரித்தெடுக்கிறது",
    "voice.transcribing": "ஆடியோவை டிரான்ஸ்கிரைப் செய்கிறது",
    "voice.extracting_info": "தயாரிப்பு தகவலை பிரித்தெடுக்கிறது",
    "voice.generating_content": "விளக்கம் உருவாக்குகிறது",
    "voice.transcription": "டிரான்ஸ்கிரிப்ஷன்",
    "voice.extracted_info": "பிரித்தெடுக்கப்பட்ட தகவல்",
    "voice.confidence": "நம்பிக்கை",
    "voice.start_over": "மீண்டும் தொடங்கவும்",
    "voice.selected_language": "தேர்ந்தெடுக்கப்பட்ட மொழி",
    "voice.recognition_note": "குரல் அங்கீகாரம் உங்கள் பிரவுசரைப் பொறுத்தது",
    "voice.product_examples": "தயாரிப்பு உதாரணங்கள்",
    "voice.price_examples": "விலை உதாரணங்கள்",
    "voice.complete_example": "முழுமையான உதாரணம்",
    "voice.start_speaking": "பேச தொடங்குங்கள்",
    "voice.listening": "கேட்கிறது...",
    "voice.reset": "மீட்டமை",
    "voice.listening_status": "கேட்கிறது... இப்போது பேசுங்கள்",
    "voice.error_occurred": "ஒரு பிழை ஏற்பட்டது",
    "voice.processing_transcript": "உங்கள் பேச்சை செயலாக்குகிறது...",
    "voice.detected_language": "கண்டறியப்பட்ட மொழி",
    "voice.transcript": "டிரான்ஸ்கிரிப்ட்",
    "voice.data_extracted": "தயாரிப்பு தரவு வெற்றிகரமாக பிரித்தெடுக்கப்பட்டது!",
    "voice.processing_failed": "பேச்சை செயலாக்க முடியவில்லை",
    "voice.no_speech_detected": "பேச்சு கண்டறியப்படவில்லை",
    "voice.no_microphone": "மைக்ரோஃபோன் கிடைக்கவில்லை",
    "voice.microphone_denied": "மைக்ரோஃபோன் அணுகல் மறுக்கப்பட்டது",
    "voice.recognition_error": "பேச்சு அங்கீகார பிழை",
    "voice.listening_timeout": "கேட்கும் நேரம் முடிந்தது. மீண்டும் முயற்சிக்கவும்.",
    "voice.not_supported": "இந்த பிரவுசரில் பேச்சு அங்கீகாரம் ஆதரிக்கப்படவில்லை",
    
    // Image
    "image.capture_title": "தயாரிப்பு படத்தை எடுக்கவும்",
    "image.camera": "கேமரா",
    "image.upload": "பதிவேற்றவும்",
    "image.center_product": "உங்கள் தயாரிப்பை சட்டகத்தின் மையத்தில் வைக்கவும்",
    "image.capture": "புகைப்படம் எடுக்கவும்",
    "image.click_upload": "படத்தை பதிவேற்ற கிளிக் செய்யவும்",
    "image.supported_formats": "JPG, PNG, GIF ஆதரிக்கிறது",
    "image.captured": "எடுக்கப்பட்டது",
    "image.retake": "மீண்டும் எடுக்கவும்",
    "image.process": "படத்தை செயலாக்கவும்",
    "image.processing": "செயலாக்குகிறது...",
    "image.ai_processing": "AI உங்கள் படத்தை செயலாக்குகிறது...",
    "image.extracting_text": "படத்திலிருந்து உரையை பிரித்தெடுக்கிறது",
    "image.identifying_product": "தயாரிப்பு விவரங்களை அடையாளம் காண்கிறது",
    "image.generating_description": "தயாரிப்பு விளக்கம் உருவாக்குகிறது",
    "image.ocr_initializing": "OCR இன்ஜினை துவக்குகிறது...",
    "image.ocr_loading": "உரை அங்கீகாரம் ஏற்றுகிறது...",
    "image.ocr_processing": "படத்தை செயலாக்குகிறது...",
    "image.ocr_complete": "உரை பிரித்தெடுத்தல் முடிந்தது!",
    
    // Product Card
    "card.ai_generated": "AI உருவாக்கியது",
    "card.low_stock": "குறைந்த ஸ்டாக்",
    "card.stock": "ஸ்டாக்:",
    "card.edit": "திருத்து",
    "card.delete": "நீக்கு",
    "card.save": "சேமி",
    "card.cancel": "ரத்து",
    "card.activate": "செயல்படுத்து",
    "card.deactivate": "செயலிழக்கச் செய்",
    
    // Messages
    "msg.product_created": "தயாரிப்பு வெற்றிகரமாக உருவாக்கப்பட்டது!",
    "msg.voice_product_created": "குரல் உள்ளீட்டிலிருந்து தயாரிப்பு உருவாக்கப்பட்டது!",
    "msg.failed_create_product": "தயாரிப்பு உருவாக்க முடியவில்லை",
    "msg.description_generated": "விளக்கம் வெற்றிகரமாக உருவாக்கப்பட்டது!",
    "msg.failed_generate_description": "விளக்கம் உருவாக்க முடியவில்லை",
    "msg.category_suggested": "வகை வெற்றிகரமாக பரிந்துரைக்கப்பட்டது!",
    "msg.failed_suggest_category": "வகை பரிந்துரைக்க முடியவில்லை",
    "msg.enter_product_name": "முதலில் தயாரிப்பு பெயரை உள்ளிடவும்",
    "msg.fill_required_fields": "தேவையான அனைத்து புலங்களையும் நிரப்பவும்",
    "msg.ensure_fields_filled": "அனைத்து புலங்களும் நிரப்பப்பட்டுள்ளன என்பதை உறுதிப்படுத்தவும்",
    "msg.failed_microphone": "மைக்ரோஃபோனை அணுக முடியவில்லை",
    "msg.failed_process_audio": "ஆடியோவை செயலாக்க முடியவில்லை",
    "msg.stock_updated": "ஸ்டாக் நிலை வெற்றிகரமாக புதுப்பிக்கப்பட்டது!",
    "msg.failed_update_stock": "ஸ்டாக் நிலையை புதுப்பிக்க முடியவில்லை",
    "msg.product_deleted": "தயாரிப்பு வெற்றிகரமாக நீக்கப்பட்டது!",
    "msg.failed_delete_product": "தயாரிப்பை நீக்க முடியவில்லை",
    "msg.confirm_delete": "இந்த தயாரிப்பை நீக்க விரும்புகிறீர்களா?",
    "msg.image_data_extracted": "படத் தரவு வெற்றிகரமாக பிரித்தெடுக்கப்பட்டது!",
    "msg.voice_data_extracted": "குரல் தரவு வெற்றிகரமாக பிரித்தெடுக்கப்பட்டது!",
    "msg.image_processed": "படம் வெற்றிகரமாக செயலாக்கப்பட்டது!",
    "msg.failed_process_image": "படத்தை செயலாக்க முடியவில்லை",
  },
  hi: {
    // App
    "app.title": "स्मार्ट इन्वेंटरी",
    
    // Auth
    "auth.title": "स्मार्ट इन्वेंटरी",
    "auth.subtitle": "AI-संचालित इन्वेंटरी प्रबंधन",
    "auth.features": "आवाज इनपुट • बहुभाषी • रीयल-टाइम",
    
    // Navigation
    "nav.dashboard": "डैशबोर्ड",
    "nav.add_product": "उत्पाद जोड़ें",
    "nav.voice_entry": "आवाज इनपुट",
    "nav.voice": "आवाज",
    "nav.notifications": "सूचनाएं",
    "nav.settings": "सेटिंग्स"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const langTranslations = translations[language as keyof typeof translations];
    if (!langTranslations) {
      // Fallback to English if language not supported
      return translations.en[key as keyof typeof translations.en] || key;
    }
    return langTranslations[key as keyof typeof langTranslations] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
