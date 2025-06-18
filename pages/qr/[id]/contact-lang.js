"use client";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from "next/router";
import Script from "next/script";
 

const Contact = () => {
  const [userLanguage, setUserLanguage] = useState("mr"); // Default language
  const [loading, setLoading] = useState(true); // Loading state for location-based language
  const [showTranslate, setShowTranslate] = useState(false); // Control rendering of the translate widget
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Navigate back
  };

  // Get User's Language Based on City/Area
  useEffect(() => {
    const fetchUserLanguage = async (latitude, longitude) => {
      const apiKey = "e3a3ec086bbe4b38b75148015acc783d"; // Replace with your OpenCage API key
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const components = data.results[0].components;
          const city =
            components.city ||
            components.town ||
            components.village ||
            "Unknown"; // Get city/town/village
          const region = components.state || "Unknown"; // Get region/state

          // Map cities/areas to languages
          const areaLanguageMap = {
            noida: "hi", // Hindi
            bangalore: "kn", // Kannada
            mumbai: "mr", // Marathi
            delhi: "hi", // Hindi
            "new york": "en", // English
            "san francisco": "en", // English
          };

          // Set the user's language based on city/region
          const cityKey = city.toLowerCase();

          //   setUserLanguage(areaLanguageMap[cityKey] || "en"); // Default to English if no match
        }
      } catch (error) {
        console.error("Error fetching user language:", error);
    }
     finally {
        setLoading(false);
        setShowTranslate(true); // Show the widget after determining the language
      }
    };

    // Get user's location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchUserLanguage(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
          setShowTranslate(true); // Show the widget even if location is denied
        }
      );
    } else {
      console.error("Geolocation not supported by this browser.");
      setLoading(false);
      setShowTranslate(true); // Show the widget if geolocation is unavailable
    }
  }, []);

  // Initialize Google Translate Widget
  useEffect(() => {
    if (showTranslate) {
      const initGoogleTranslate = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: userLanguage, // Dynamically set user's language
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
      };

      if (typeof window !== "undefined" && window.google) {
        initGoogleTranslate();
      } else {
        const interval = setInterval(() => {
          if (window.google) {
            initGoogleTranslate();
            clearInterval(interval);
          }
        }, 100);
      }
    }
  }, [showTranslate, userLanguage]); // Re-run when the widget should be shown or the language changes

  return (
    <>
      {/* Google Translate Script */}
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />

      {/* Back Button */}
      <div className="d-flex align-items-center bg-white p-3">
        <IoIosArrowBack className="fs-3" onClick={handleBack} />
        <div className="w-100">
          <h4 className="mb-0" style={{ marginLeft: "5%" }}>
            Contact Owner
          </h4>
        </div>
      </div>

      {/* Google Translate Dropdown */}
      {showTranslate && (
        <div id="google_translate_element" className="text-end p-3"></div>
      )}

      {/* Page Content */}
      <div className="container py-4">
        {loading ? (
          <div className="text-center">
            <span
              className="spinner-border"
              role="status"
              aria-hidden="true"
            ></span>
            <p>Please Wait...</p>
          </div>
        ) : (
          <div>Your main page content goes here!</div>
        )}
      </div>
    </>
  );
};

export default Contact;
