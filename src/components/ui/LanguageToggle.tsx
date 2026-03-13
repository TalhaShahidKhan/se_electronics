"use client";
import { useEffect, useState } from "react";

const GT_SCRIPT_SRC =
  "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

export default function LanguageToggle() {
  const [currentLang, setCurrentLang] = useState("en");

  function setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/`;
  }

  function applyGoogleTranslateCookie(source: string, target: string) {
    setCookie("googtrans", `/${source}/${target}`);
  }

  function loadGoogleTranslateOnce() {
    if (document.getElementById("gt-script")) return;

    (window as any).googleTranslateElementInit = () => {
      if (!(window as any).google?.translate) return;

      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,bn",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const s = document.createElement("script");
    s.src = GT_SCRIPT_SRC;
    s.id = "gt-script";
    document.body.appendChild(s);
  }

  useEffect(() => {
    loadGoogleTranslateOnce();

    const saved = localStorage.getItem("selectedLanguage") || "en";
    setCurrentLang(saved);

    if (saved === "bn") {
      applyGoogleTranslateCookie("en", "bn");
    }
  }, []);

  const handleLanguageToggle = () => {
    const next = currentLang === "en" ? "bn" : "en";

    localStorage.setItem("selectedLanguage", next);

    if (next === "bn") {
      applyGoogleTranslateCookie("en", "bn");
    } else {
      applyGoogleTranslateCookie("bn", "en");
    }

    window.location.reload();
  };

  return (
    <>
      <div id="google_translate_element" className="hidden" />

<button
  onClick={handleLanguageToggle}
  translate="no"
  className="notranslate py-2 px-3 bg-white border border-gray-300 rounded text-sm font-semibold hover:bg-gray-100 transition-all text-gray-700"
>
  {currentLang === "en" ?  "BNG" : "ENG" }
</button>
    </>
  );
}