import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;

const useTranslate = (initialTexts = {}) => {
  const [translatedText, setTranslatedText] = useState({});
  const selectedLang = Cookies.get("preferred_language") || "en";

  useEffect(() => {
    const translateAll = async () => {
      const entries = Object.entries(initialTexts);
      for (let [key, value] of entries) {
        await translateText(value, key);
      }
    };
    translateAll();
  }, []);

  const translateText = async (text, key) => {
    if (!text || selectedLang === "en") {
      setTranslatedText((prev) => ({ ...prev, [key]: text }));
      return;
    }

    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
        {
          method: "POST",
          body: JSON.stringify({ q: text, target: selectedLang }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      setTranslatedText((prev) => ({
        ...prev,
        [key]: data.data.translations[0].translatedText,
      }));
    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  return translatedText;
};

export default useTranslate;
