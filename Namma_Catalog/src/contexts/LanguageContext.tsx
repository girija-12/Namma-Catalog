import { createContext, useContext, useState, ReactNode } from "react";

type Language = "ta" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ta: {
    // Header
    "app.title": "AI பட்டியல் முகவர்",
    "nav.dashboard": "டாஷ்போர்டு",
    "nav.add_product": "தயாரிப்பு சேர்க்க",
    "nav.voice": "குரல்",
    
    // Dashboard
    "dashboard.title": "உங்கள் சரக்கு டாஷ்போர்டு",
    "dashboard.subtitle": "AI-இயங்கும் நுண்ணறிவுகளுடன் உங்கள் தயாரிப்புகளை நிர்வகிக்கவும்",
    "stats.total_products": "மொத்த தயாரிப்புகள்",
    "stats.active_products": "செயலில் உள்ள தயாரிப்புகள்",
    "stats.low_stock": "குறைந்த சரக்கு எச்சரிக்கைகள்",
    "stats.total_value": "மொத்த மதிப்பு",
    "search.placeholder": "தயாரிப்புகளைத் தேடுங்கள்...",
    "filter.all_categories": "அனைத்து வகைகளும்",
    "empty.no_products": "தயாரிப்புகள் இல்லை",
    "empty.no_products_desc": "உங்கள் முதல் தயாரிப்பைச் சேர்ப்பதன் மூலம் தொடங்குங்கள்",
    "empty.adjust_filters": "உங்கள் தேடல் அல்லது வடிப்பான்களை சரிசெய்ய முயற்சிக்கவும்",
    
    // Product Form
    "form.add_product": "புதிய தயாரிப்பு சேர்க்கவும்",
    "form.product_name": "தயாரிப்பு பெயர்",
    "form.product_name_placeholder": "தயாரிப்பு பெயரை உள்ளிடவும்",
    "form.language": "மொழி",
    "form.category": "வகை",
    "form.category_placeholder": "வகையை உள்ளிடவும்",
    "form.ai_suggest": "AI பரிந்துரை",
    "form.description": "விளக்கம்",
    "form.description_placeholder": "தயாரிப்பு விளக்கத்தை உள்ளிடவும்",
    "form.generate_description": "✨ AI விளக்கம் உருவாக்கவும்",
    "form.generating": "உருவாக்குகிறது...",
    "form.price": "விலை (₹)",
    "form.stock_level": "சரக்கு நிலை",
    "form.min_stock": "குறைந்த சரக்கு எச்சரிக்கை",
    "form.product_image": "தயாரிப்பு படம்",
    "form.create_product": "தயாரிப்பு உருவாக்கவும்",
    "form.creating": "தயாரிப்பு உருவாக்குகிறது...",
    
    // Voice Recorder
    "voice.title": "குரல் தயாரிப்பு உள்ளீடு",
    "voice.instructions": "தெளிவாக பேசுங்கள் மற்றும் சேர்க்கவும்:",
    "voice.product_name_inst": "• தயாரிப்பு பெயர்",
    "voice.price_inst": "• ரூபாயில் விலை",
    "voice.description_inst": "• சுருக்கமான விளக்கம்",
    "voice.record": "பதிவு",
    "voice.stop": "நிறுத்து",
    "voice.recording": "பதிவு செய்கிறது... இப்போது பேசுங்கள்!",
    "voice.review_title": "உங்கள் பதிவை மதிப்பாய்வு செய்யுங்கள்",
    "voice.process_recording": "பதிவை செயலாக்கவும்",
    "voice.record_again": "மீண்டும் பதிவு செய்யுங்கள்",
    "voice.processing_title": "உங்கள் குரல் உள்ளீட்டை செயலாக்குகிறது...",
    "voice.processing_desc": "AI ஆனது படியெடுத்து தயாரிப்பு தகவலை பிரித்தெடுக்கிறது",
    "voice.transcription": "படியெடுத்தல்:",
    "voice.extracted_info": "பிரித்தெடுக்கப்பட்ட தயாரிப்பு தகவல்:",
    "voice.start_over": "மீண்டும் தொடங்கவும்",
    
    // Product Card
    "card.ai_generated": "AI உருவாக்கியது",
    "card.low_stock": "குறைந்த சரக்கு",
    "card.stock": "சரக்கு:",
    "card.edit": "திருத்து",
    "card.save": "சேமி",
    "card.cancel": "ரத்து",
    "card.activate": "செயல்படுத்து",
    "card.deactivate": "செயலிழக்கச் செய்",
    "card.delete": "நீக்கு",
    
    // Notifications
    "notifications.title": "அறிவிப்புகள்",
    "notifications.mark_all_read": "அனைத்தையும் படித்ததாக குறிக்கவும்",
    "notifications.no_notifications": "இன்னும் அறிவிப்புகள் இல்லை",
    
    // Auth
    "auth.title": "உங்கள் வணிகத்தை வலுப்படுத்துங்கள்",
    "auth.subtitle": "குரல் & AI-இயங்கும் பட்டியல் நிர்வாகம்",
    "auth.features": "IT திறன்கள் தேவையில்லை • தமிழ் & ஆங்கிலம் ஆதரவு",
    
    // Messages
    "msg.product_created": "தயாரிப்பு வெற்றிகரமாக உருவாக்கப்பட்டது!",
    "msg.stock_updated": "சரக்கு நிலை புதுப்பிக்கப்பட்டது",
    "msg.product_deleted": "தயாரிப்பு நீக்கப்பட்டது",
    "msg.description_generated": "விளக்கம் வெற்றிகரமாக உருவாக்கப்பட்டது!",
    "msg.category_suggested": "வகை பரிந்துரைக்கப்பட்டது!",
    "msg.voice_product_created": "குரல் உள்ளீட்டிலிருந்து தயாரிப்பு உருவாக்கப்பட்டது!",
    "msg.fill_required_fields": "தேவையான அனைத்து புலங்களையும் நிரப்பவும்",
    "msg.enter_product_name": "முதலில் தயாரிப்பு பெயரை உள்ளிடவும்",
    "msg.failed_generate_description": "விளக்கம் உருவாக்க முடியவில்லை",
    "msg.failed_suggest_category": "வகை பரிந்துரைக்க முடியவில்லை",
    "msg.failed_create_product": "தயாரிப்பு உருவாக்க முடியவில்லை",
    "msg.failed_update_stock": "சரக்கு புதுப்பிக்க முடியவில்லை",
    "msg.failed_delete_product": "தயாரிப்பு நீக்க முடியவில்லை",
    "msg.failed_microphone": "மைக்ரோஃபோனை அணுக முடியவில்லை",
    "msg.failed_process_audio": "ஆடியோ செயலாக்க முடியவில்லை",
    "msg.ensure_fields_filled": "அனைத்து புலங்களும் நிரப்பப்பட்டுள்ளன என்பதை உறுதிப்படுத்தவும்",
    "msg.confirm_delete": "இந்த தயாரிப்பை நீக்க விரும்புகிறீர்களா?",
  },
  en: {
    // Header
    "app.title": "AI Catalog Agent",
    "nav.dashboard": "Dashboard",
    "nav.add_product": "Add Product",
    "nav.voice": "Voice",
    
    // Dashboard
    "dashboard.title": "Your Inventory Dashboard",
    "dashboard.subtitle": "Manage your products with AI-powered insights",
    "stats.total_products": "Total Products",
    "stats.active_products": "Active Products",
    "stats.low_stock": "Low Stock Alerts",
    "stats.total_value": "Total Value",
    "search.placeholder": "Search products...",
    "filter.all_categories": "All Categories",
    "empty.no_products": "No products found",
    "empty.no_products_desc": "Start by adding your first product",
    "empty.adjust_filters": "Try adjusting your search or filters",
    
    // Product Form
    "form.add_product": "Add New Product",
    "form.product_name": "Product Name",
    "form.product_name_placeholder": "Enter product name",
    "form.language": "Language",
    "form.category": "Category",
    "form.category_placeholder": "Enter category",
    "form.ai_suggest": "AI Suggest",
    "form.description": "Description",
    "form.description_placeholder": "Enter product description",
    "form.generate_description": "✨ Generate AI Description",
    "form.generating": "Generating...",
    "form.price": "Price (₹)",
    "form.stock_level": "Stock Level",
    "form.min_stock": "Min Stock Alert",
    "form.product_image": "Product Image",
    "form.create_product": "Create Product",
    "form.creating": "Creating Product...",
    
    // Voice Recorder
    "voice.title": "Voice Product Entry",
    "voice.instructions": "Speak clearly and include:",
    "voice.product_name_inst": "• Product name",
    "voice.price_inst": "• Price in rupees",
    "voice.description_inst": "• Brief description",
    "voice.record": "Record",
    "voice.stop": "Stop",
    "voice.recording": "Recording... Speak now!",
    "voice.review_title": "Review Your Recording",
    "voice.process_recording": "Process Recording",
    "voice.record_again": "Record Again",
    "voice.processing_title": "Processing Your Voice Input...",
    "voice.processing_desc": "AI is transcribing and extracting product information",
    "voice.transcription": "Transcription:",
    "voice.extracted_info": "Extracted Product Information:",
    "voice.start_over": "Start Over",
    
    // Product Card
    "card.ai_generated": "AI Generated",
    "card.low_stock": "Low Stock",
    "card.stock": "Stock:",
    "card.edit": "Edit",
    "card.save": "Save",
    "card.cancel": "Cancel",
    "card.activate": "Activate",
    "card.deactivate": "Deactivate",
    "card.delete": "Delete",
    
    // Notifications
    "notifications.title": "Notifications",
    "notifications.mark_all_read": "Mark all read",
    "notifications.no_notifications": "No notifications yet",
    
    // Auth
    "auth.title": "Empower Your Business",
    "auth.subtitle": "Voice & AI-powered catalog management",
    "auth.features": "No IT skills needed • Supports Tamil & English",
    
    // Messages
    "msg.product_created": "Product created successfully!",
    "msg.stock_updated": "Stock level updated",
    "msg.product_deleted": "Product deleted",
    "msg.description_generated": "Description generated successfully!",
    "msg.category_suggested": "Category suggested!",
    "msg.voice_product_created": "Product created from voice input!",
    "msg.fill_required_fields": "Please fill in all required fields",
    "msg.enter_product_name": "Please enter a product name first",
    "msg.failed_generate_description": "Failed to generate description",
    "msg.failed_suggest_category": "Failed to suggest category",
    "msg.failed_create_product": "Failed to create product",
    "msg.failed_update_stock": "Failed to update stock",
    "msg.failed_delete_product": "Failed to delete product",
    "msg.failed_microphone": "Failed to access microphone",
    "msg.failed_process_audio": "Failed to process audio",
    "msg.ensure_fields_filled": "Please ensure all fields are filled",
    "msg.confirm_delete": "Are you sure you want to delete this product?",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ta"); // Tamil first

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
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
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
