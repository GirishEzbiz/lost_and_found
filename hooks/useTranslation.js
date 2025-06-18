import { useState } from "react";

const useTranslate = () => {
  const [translatedText, setTranslatedText] = useState("");

  const translateText = async (text, targetLang = "hi") => {
    if (!text) return;

    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY}`,
        {
          method: "POST",
          body: JSON.stringify({
            q: text,
            target: targetLang,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      setTranslatedText(data.data.translations[0].translatedText);
    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  return { translatedText, translateText };
};

export default useTranslate;
