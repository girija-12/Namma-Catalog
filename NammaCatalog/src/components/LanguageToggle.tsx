import { useState, useEffect } from "react";

interface LanguageToggleProps {
  language: "ta" | "en";
  onLanguageChange: (lang: "ta" | "en") => void;
}

export function LanguageToggle({ language, onLanguageChange }: LanguageToggleProps) {
  return (
    <button
      onClick={() => onLanguageChange(language === "ta" ? "en" : "ta")}
      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      title={language === "ta" ? "Switch to English" : "தமிழுக்கு மாற்று"}
    >
      <span className="text-sm font-medium">
        {language === "ta" ? "EN" : "தமிழ்"}
      </span>
      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-white"></div>
      </div>
    </button>
  );
}
