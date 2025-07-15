import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { ProductForm } from "./components/ProductForm";
import { VoiceRecorder } from "./components/VoiceRecorder";
import { NotificationCenter } from "./components/NotificationCenter";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { useState } from "react";

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState<"dashboard" | "add-product" | "voice">("dashboard");
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t("app.title")}
              </h1>
              <Authenticated>
                <nav className="hidden md:flex space-x-4">
                  <button
                    onClick={() => setCurrentView("dashboard")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === "dashboard"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t("nav.dashboard")}
                  </button>
                  <button
                    onClick={() => setCurrentView("add-product")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === "add-product"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t("nav.add_product")}
                  </button>
                  <button
                    onClick={() => setCurrentView("voice")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                      currentView === "voice"
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="text-lg">🎤</span>
                    {t("nav.voice")}
                  </button>
                </nav>
              </Authenticated>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === "ta" ? "en" : "ta")}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                {language === "ta" ? "EN" : "தமிழ்"}
              </button>
              <Authenticated>
                <NotificationCenter />
              </Authenticated>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <Authenticated>
        <div className="md:hidden bg-white border-b">
          <div className="flex justify-around py-2">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`flex flex-col items-center px-3 py-2 text-xs ${
                currentView === "dashboard" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <span className="text-lg mb-1">📊</span>
              {t("nav.dashboard")}
            </button>
            <button
              onClick={() => setCurrentView("add-product")}
              className={`flex flex-col items-center px-3 py-2 text-xs ${
                currentView === "add-product" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <span className="text-lg mb-1">➕</span>
              {t("nav.add_product")}
            </button>
            <button
              onClick={() => setCurrentView("voice")}
              className={`flex flex-col items-center px-3 py-2 text-xs ${
                currentView === "voice" ? "text-purple-600" : "text-gray-600"
              }`}
            >
              <span className="text-lg mb-1">🎤</span>
              {t("nav.voice")}
            </button>
          </div>
        </div>
      </Authenticated>

      <main className="flex-1">
        <Content currentView={currentView} setCurrentView={setCurrentView} />
      </main>
      
      <Toaster position="top-right" />
    </div>
  );
}

function Content({ currentView, setCurrentView }: { 
  currentView: "dashboard" | "add-product" | "voice";
  setCurrentView: (view: "dashboard" | "add-product" | "voice") => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const { t } = useLanguage();

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Unauthenticated>
        <div className="max-w-md mx-auto mt-20 p-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("auth.title")}
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              {t("auth.subtitle")}
            </p>
            <p className="text-lg text-gray-500">
              {t("auth.features")}
            </p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === "dashboard" && <Dashboard />}
          {currentView === "add-product" && (
            <ProductForm onSuccess={() => setCurrentView("dashboard")} />
          )}
          {currentView === "voice" && (
            <VoiceRecorder onSuccess={() => setCurrentView("dashboard")} />
          )}
        </div>
      </Authenticated>
    </>
  );
}
