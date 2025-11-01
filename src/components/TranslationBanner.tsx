import { useState, useEffect } from "react";
import { X, Globe, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TranslationBannerProps {
  onClose?: () => void;
}

export function TranslationBanner({ onClose }: TranslationBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [userLanguage, setUserLanguage] = useState<string>("");
  const [siteLanguage, setSiteLanguage] = useState<string>("en");

  useEffect(() => {
    // Check if user has dismissed the banner before
    const dismissed = localStorage.getItem("translation-banner-dismissed");
    if (dismissed === "true") {
      return;
    }

    // Detect browser language
    const browserLang = navigator.language || (navigator as any).userLanguage || "en";
    const langCode = browserLang.split("-")[0].toLowerCase();
    
    setUserLanguage(browserLang);
    
    // Check if browser language differs from site language
    if (langCode !== siteLanguage) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setShowBanner(true);
        // Add padding to body to prevent content overlap
        document.body.style.paddingTop = "70px";
      }, 2000); // Show after 2 seconds

      return () => {
        clearTimeout(timer);
      };
    }
  }, [siteLanguage]);

  const handleTranslate = () => {
    const langCode = userLanguage.split("-")[0].toLowerCase();
    
    // Show Google Translate widget
    const translateElement = document.getElementById("google_translate_element");
    if (translateElement) {
      translateElement.style.display = "block";
      
      // Wait for Google Translate to load, then select the language
      const selectLanguage = () => {
        const translateSelect = document.querySelector<HTMLSelectElement>(".goog-te-combo");
        if (translateSelect) {
          translateSelect.value = langCode;
          translateSelect.dispatchEvent(new Event("change"));
        } else {
          // Retry after a short delay if element not ready
          setTimeout(selectLanguage, 100);
        }
      };
      
      // Wait a bit for Google Translate widget to initialize
      setTimeout(selectLanguage, 500);
    }
    
    // Hide banner after initiating translation
    setShowBanner(false);
    document.body.style.paddingTop = "0";
    localStorage.setItem("translation-banner-dismissed", "true");
  };

  const handleDismiss = () => {
    setShowBanner(false);
    document.body.style.paddingTop = "0";
    localStorage.setItem("translation-banner-dismissed", "true");
    if (onClose) {
      onClose();
    }
  };

  if (!showBanner) {
    return null;
  }

  // Get language name
  const getLanguageName = (lang: string) => {
    const langNames: Record<string, string> = {
      de: "German",
      fr: "French",
      es: "Spanish",
      it: "Italian",
      nl: "Dutch",
      pl: "Polish",
      pt: "Portuguese",
      ru: "Russian",
      ar: "Arabic",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
    };
    const code = lang.split("-")[0].toLowerCase();
    return langNames[code] || lang;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-blue-600 text-white shadow-lg animate-in slide-in-from-top">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Globe className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                Would you like to translate this page to <strong>{getLanguageName(userLanguage)}</strong>?
              </p>
              <p className="text-xs opacity-90 mt-0.5">
                Your browser language is set to {userLanguage}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleTranslate}
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50 font-medium"
            >
              <Languages className="h-4 w-4 mr-2" />
              Translate
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

