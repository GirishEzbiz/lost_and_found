import Cookies from "js-cookie";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;

const translateText = async (text, targetLang = Cookies.get("preferred_language") || "en") => {
  if (!text || targetLang === "en") return text;

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      {
        method: "POST",
        body: JSON.stringify({ q: text, target: targetLang }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // fallback
  }
};

export default translateText;
