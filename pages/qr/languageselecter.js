import React, { useState } from "react";

const LanguageSelector = ({ onSelectLanguage }) => {
  const [selectedLang, setSelectedLang] = useState("en"); // Default English

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "bn", name: "Bengali" },
    { code: "te", name: "Telugu" },
    { code: "mr", name: "Marathi" },
    { code: "ta", name: "Tamil" },
    { code: "ur", name: "Urdu" },
    { code: "gu", name: "Gujarati" },
    { code: "kn", name: "Kannada" },
    { code: "or", name: "Odia" },
    { code: "ml", name: "Malayalam" },
    { code: "pa", name: "Punjabi" },
    { code: "as", name: "Assamese" },
    { code: "bh", name: "Bhojpuri" },
    { code: "ne", name: "Nepali" },
    { code: "si", name: "Sinhala" },
    { code: "sd", name: "Sindhi" },
    { code: "ma", name: "Manipuri" },
    { code: "kok", name: "Konkani" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
];


  const handleLanguageChange = (event) => {
    const lang = event.target.value;
    setSelectedLang(lang);
    onSelectLanguage(lang); // ✅ Auto-trigger translation
  };

  return (
    <select
      onChange={handleLanguageChange}
      value={selectedLang}
      className="form-select"
      style={{
        padding: "6px",
        width: "120px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontSize: "14px",
        marginLeft: "10px",
      }}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
