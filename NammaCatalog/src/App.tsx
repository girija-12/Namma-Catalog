import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { EnhancedCatalogAgent } from "./components/EnhancedCatalogAgent";
import { Dashboard } from "./components/Dashboard";
import { LanguageToggle } from "./components/LanguageToggle";
import { useState } from "react";
import { useTranslation, Language } from "./lib/translations";

export default function App() {
  const [activeTab, setActiveTab] = useState<"catalog" | "dashboard">("catalog");
  const [language, setLanguage] = useState<Language>("ta"); // Default to Tamil
  const t = useTranslation(language);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t("appTitle")}
            </h2>
            <Authenticated>
              <nav className="flex gap-2">
                <button
                  onClick={() => setActiveTab("catalog")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "catalog"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  📝 {t("catalog")}
                </button>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "dashboard"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  📊 {t("dashboard")}
                </button>
              </nav>
            </Authenticated>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Content activeTab={activeTab} language={language} />
      </main>
      
      <Toaster position="top-right" />
    </div>
  );
}

function Content({ activeTab, language }: { activeTab: "catalog" | "dashboard"; language: Language }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const t = useTranslation(language);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {activeTab === "catalog" ? (
            <EnhancedCatalogAgent language={language} />
          ) : (
            <Dashboard language={language} />
          )}
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="flex items-center justify-center min-h-[60vh] p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {language === "ta" ? "உங்கள் வணிகத்தை வலுப்படுத்துங்கள்" : "Empower Your Business"}
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                {language === "ta" 
                  ? "குரல் மற்றும் AI-இயங்கும் பட்டியல் மேலாண்மை"
                  : "Voice & AI-powered catalog management"
                }
              </p>
              <p className="text-gray-500">
                {language === "ta"
                  ? "IT திறன்கள் தேவையில்லை • தமிழ் + ஆங்கில ஆதரவு • உடனடி AI விளக்கங்கள்"
                  : "No IT skills needed • Tamil + English support • Instant AI descriptions"
                }
              </p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}
