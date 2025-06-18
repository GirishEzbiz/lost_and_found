//  

import React, { useState } from "react";
import { FaGlobe } from "react-icons/fa";

const languages = [
  { label: "English", code: "en", symbol: "EN", color: "border-primary" },
  { label: "हिंदी", code: "hi", symbol: "ह", color: "border-warning" },
  { label: "বাংলা", code: "bn", symbol: "বা", color: "border-info" },
  { label: "తెలుగు", code: "te", symbol: "తె", color: "border-warning" },
  { label: "मराठी", code: "mr", symbol: "म", color: "border-secondary" },
  { label: "தமிழ்", code: "ta", symbol: "த", color: "border-primary" },
  { label: "اردو", code: "ur", symbol: "ع", color: "border-secondary" },
  { label: "ગુજરાતી", code: "gu", symbol: "ગુ", color: "border-danger" },
  { label: "ಕನ್ನಡ", code: "kn", symbol: "ಕ", color: "border-info" },
  { label: "മലയാളം", code: "ml", symbol: "മ", color: "border-success" },
  { label: "ਪੰਜਾਬੀ", code: "pa", symbol: "ਪੰ", color: "border-danger" },
];

const LanguageSelectionPage = ({ onSelect }) => {
  const [selected, setSelected] = useState("en");
  const [showAll, setShowAll] = useState(false);

  const displayedLanguages = showAll ? languages : languages.slice(0, 3);

  const handleSelect = (code) => {
    setSelected(code);
    onSelect(code);
  };

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center text-center p-4 bg-light">
      <div className="d-flex align-items-center gap-2 mb-3 text-primary">
        <FaGlobe size={28} />
        <h1 className="h3 fw-bold">Select Your Language</h1>
      </div>
      <p className="text-muted mb-4">Choose your preferred language to continue</p>

      <div className="row row-cols-3 g-4 justify-content-center" style={{ maxWidth: "500px" }}>
        {displayedLanguages.map((lang) => (
          <div key={lang.code} className="col d-flex justify-content-center">
            <button
              onClick={() => handleSelect(lang.code)}
              className={`d-flex flex-column align-items-center justify-content-center border border-4 ${lang.color} rounded-circle text-decoration-none p-3 shadow-sm `}
              
              style={{
                width: "100px",
                height: "100px",
                transition: "all 0.3s ease",
                backgroundColor: selected === lang.code ? "#b0bec5" : "#fff",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0, 0, 0, 0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 0.25rem 0.5rem rgba(0, 0, 0, 0.075)";
              }}
            >
              <span className="fs-4 fw-bold text-dark">{lang.symbol}</span>
              <span className="small text-muted mt-1 ">{lang.label}</span>
            </button>
          </div>
        ))}
      </div>

      {!showAll && (
        <button
          className="btn btn-link mt-4 text-decoration-none"
          onClick={() => setShowAll(true)}
        >
          + More Languages
        </button>
      )}
    </div>
  );
};

export default LanguageSelectionPage;
