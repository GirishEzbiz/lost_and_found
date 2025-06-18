import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { isAuthenticated } from "lib/isAuthenticated";
import Cookies from "js-cookie";
import { Alert, Button } from "react-bootstrap";
import Image from "next/image";
import LanguageSelectionPage from "utils/language";
import { FaGlobe, FaLanguage } from "react-icons/fa";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY; // ✅ Load API Key from .env

const ItemDetail = ({ selectedLang = "en", onResetLanguage }) => {
  const router = useRouter();
  const { id } = router.query;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState({});
  const [scanStatus, setScanStatus] = useState("OK"); // default to OK
  const [scanMessage, setScanMessage] = useState(""); // for message from API

  const [invalid, setInvalid] = useState(false);
  const [Active, setActive] = useState(false);
  const [Expired, setExpired] = useState(false);
  const [Fake, SetFake] = useState(false);
  const [BlackListed, SetBlackListed] = useState(false);
  const [Inactive, SetInactive] = useState(false);
  const [NotFound, setNotfound] = useState(false);
  const [msgg, setMsg] = useState("");

  const [itemCategoryId, setItemCategoryId] = useState(null); // for item category id
  // const [scanDuration, setScanDuration] = useState(null); // for scan duration
  const scanStartTimeRef = useRef(null); // Ref to store the scan start time
  const [translatedText, setTranslatedText] = useState({
    title: "",
    description: "",
    welcome: "",
    notice: "",
    support: "",
    contact: "",
    message: "",
    p: "",
    h1: "",
    select: "",
    slogan: "",
    Item: "",
    footer: "",
  });

  const [location, setLocation] = useState({
    city: "",
    state: "",
    country: "",
    latitude: "",
    longitude: "",
    isp: "",
    asn: "",
    locationSource: "", // NEW field to indicate the source of location
  });

  useEffect(() => {
    // Save scan time when page loads
    scanStartTimeRef.current = Date.now();
    localStorage.setItem("qr_scan_time", Date.now());
  }, []);

  console.log("item", item);
  useEffect(() => {
    const fetchMessages = async () => {
      const brandId = Cookies.get("scanned_brand_id");
      if (!brandId) return;

      try {
        const response = await fetch(`/api/brand/alerts?brand_id=${brandId}`);
        const data = await response.json();
        if (data.messages && Array.isArray(data.messages)) {
          const messagesObj = {};
          data.messages.forEach((msg) => {
            messagesObj[msg.message_key] = msg.message;
          });
          setMessages(messagesObj);
        }
      } catch (error) {
        console.log("Error fetching onboarding messages", error);
      }
    };
    fetchMessages();
  }, []);

  const getMessage = (key) => messages[key] || "";

  useEffect(() => {
    if (id) {
      const fetchItem = async () => {
        try {
          const response = await fetch(`/api/item/${id}`);
          if (response.status === 205) {
            if (id) {
              Cookies.set("current_qr", id);
            }

            setRedirecting(true);
            // router.push(
            //   isAuthenticated()
            //     ? `/dashboard/add-item`
            //     : `/authentication/sign-in`
            // );
            router.push(`/connectit`);
            return;
          } else if (response.status === 203) {
            console.log("response", response);
            const data = await response.json();

            if (data.type) {
              switch (data.type) {
                case "status":
                  SetInactive(true);
                  setMsg(data.message);

                  break;
                case "expiry":
                  setExpired(true);
                  setMsg(data.message);
                  break;
                case "not_lost":
                  setNotfound(true);
                  setMsg(data.message);

                  break;
                default:
                  console.log("data", data);
                  const itemds = data.itemDetails;
                  router.push(`/dashboard/items/${itemds.item_id}`);
                  break;
              }
            } else {
              console.log("data", data);
              const itemds = data.itemDetails;
              // setRedirecting(true);
              router.push(`/dashboard/items/${itemds.item_id}`);
            }
            return;
          } else if (response.status === 404) {
            setInvalid(true);
            setError(
              response.status === 404
                ? "Item not found."
                : "Something went wrong. Please try again later."
            );
            return;
          } else {
            const data = await response.json();
            setItem(data.itemDetails);

            if (data.status) {
              setScanStatus(data.status);
            }
            if (data.message) {
              setScanMessage(data.message);
            }
          }
        } catch (error) {
          console.log("Error fetching item details", error);

          setError("Error fetching item details.");
        } finally {
          setLoading(false);
        }
      };
      fetchItem();
    }
  }, [id, router]);

  // ✅ Function to translate multiple texts
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
      0;
    }
  };

  // ✅ Automatically translate content when language changes
  useEffect(() => {
    if (item) {
      translateText(item.item_name, "title");
      translateText(item.description, "description");
      translateText(`Welcome to ${item.brandName || "N/A"}`, "welcome");
      translateText(getMessage("WHEN_OWNER_SCAN_OWN_QR"), "notice");
      translateText(
        "This page is here to help reconnect this item with its rightful owner. Thank you for your kindness and support!",
        "support"
      );
      translateText("Contact Owner", "contact");
      translateText(
        "Hi, if you found this wallet, please help me get it back. I really appreciate your kindness!",
        "p"
      );
      translateText("Helping people reunite with their belongings", "h1");
      translateText("Select Language:", "select");
      translateText("This item is protected", "slogan");
      translateText("Item", "Item");
      translateText(
        "Qritagya does not sell your data, nor will it be shared without your consent, unless we have the compulsion of law.",
        "footer"
      );
      if (item.message) {
        translateText(item.message, "message");
      }
    }
  }, [selectedLang, item]);

  useEffect(() => {
    let uniqueUserId = Cookies.get("unique_user_id");
    if (!uniqueUserId) {
      uniqueUserId = generateUniqueUserId();
      Cookies.set("unique_user_id", uniqueUserId, { expires: 365 });
    }
    setLoading(true);

    if (id) {
      handleAllowLocation(); // Trigger location fetch (GPS or IP)
    }
  }, [id]);

  // Generates a unique user ID
  const generateUniqueUserId = () => {
    return "user_" + Math.random().toString(36).substr(2, 9);
  };

  // Request location permission & fetch data
  const handleAllowLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        // Fetch location from GPS (Google Geocoding API)
        await fetchLocationData(latitude, longitude, "GPS");
      },
      async (error) => {
        console.warn("Location permission denied, using IP-based location.");
        // If GPS permission denied, fallback to IP-based location
        await fetchIPBasedLocation();
      }
    );
  };

  // Fetch both GPS and IP-based location details using Google APIs
  const fetchLocationData = async (latitude, longitude, source) => {
    try {
      // API Key for Google Geocoding (for reverse geocoding)
      const locationApiKey = "AIzaSyC73VClZHsSSrs3GFZdy2eLW02ztV1NunE"; // Your Google API Key

      // Fetch location data using Google Geocoding API
      const locationResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${locationApiKey}`
      );

      if (!locationResponse.ok) {
        throw new Error("Failed to fetch location data from Google.");
      }

      const locationData = await locationResponse.json();

      const city = locationData.results[0]?.address_components[3].long_name;
      const state = locationData.results[0]?.address_components[4].long_name;
      const country = locationData.results[0]?.address_components[5].long_name;
      const lat = locationData.results[0]?.geometry.location.lat;
      const lon = locationData.results[0]?.geometry.location.lng;

      const parsedLocation = {
        city,
        state,
        country,
        latitude: lat,
        longitude: lon,
        locationSource: source,
      };

      setLocation(parsedLocation);
      Cookies.set("user_location", JSON.stringify(parsedLocation), {
        expires: 1,
      });

      handleScan(id, parsedLocation); // Handle scan with the location data
    } catch (error) {
      console.error("Error fetching GPS location data:", error);
      setError("Failed to fetch location data.");
    }
  };

  useEffect(() => {
    if (selectedLang) {
      Cookies.set("preferred_language", selectedLang, { expires: 365 });
    }
  }, [selectedLang]);

  // Fallback: IP-based location using Google Geolocation API
  const fetchIPBasedLocation = async () => {
    try {
      const apiKey = "AIzaSyC73VClZHsSSrs3GFZdy2eLW02ztV1NunE";
      const response = await fetch(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ considerIp: true }),
        }
      );

      const data = await response.json();

      if (data.location) {
        console.log("data.location", data.location);
        const { lat, lng } = data.location;
        await fetchLocationData(lat, lng, "IP-Based");
      } else {
        console.error("Unable to get location from Google API.");
      }
    } catch (error) {
      console.error("Error fetching Google Geolocation API:", error);
    }
    // try {
    //   // First, fetch the public IP address
    //   const ipResponse = await fetch("https://api.ipify.org?format=json");
    //   const ipData = await ipResponse.json();
    //   const ipAddress = ipData.ip; // Get the IP address

    //   // API Key for IP location service (like API Layer)
    //   const apiKey = "6x180hfpsHeC9DnJmD67CvQyILTRBndo"; // API Layer Key
    //   const requestOptions = {
    //     method: "GET",
    //     headers: { apikey: apiKey },
    //   };

    //   // Use the IP address to fetch the location from the IP location service
    //   const response = await fetch(
    //     `https://api.apilayer.com/ip_to_location/${ipAddress}`,
    //     requestOptions
    //   );

    //   const ipInfoData = await response.json();

    //   // Extract location details
    //   const parsedLocation = {
    //     isp: ipInfoData.connection?.isp || "Unknown",
    //     asn: ipInfoData.connection?.asn || "Unknown",
    //     city: ipInfoData.city || "Unknown",
    //     state: ipInfoData.region_name || "Unknown",
    //     country: ipInfoData.country_name || "Unknown",
    //     latitude: ipInfoData.latitude || "Unknown",
    //     longitude: ipInfoData.longitude || "Unknown",
    //     locationSource: "IP-Based", // Indicating the source of location
    //   };
    //   // Update state with parsed location
    //   let dd = setLocation(parsedLocation);

    //   // Call handleScan with the fetched location and the IP address
    //   handleScan(id, parsedLocation, ipAddress);
    // } catch (error) {
    //   console.error("Error fetching IP-based location:", error);
    //   setError("Failed to fetch IP-based location.");
    // }
  };

  const handleScan = async (qr_code, location, ipAddress) => {
    const uniqueUserId = Cookies.get("unique_user_id");

    const durationInSeconds = scanStartTimeRef.current
      ? ((Date.now() - scanStartTimeRef.current) / 1000).toFixed(2)
      : null;

    let postData = {
      qr_code,
      location,
      unique_user_id: uniqueUserId,
      ipAddress: ipAddress || null,
      scanDuration: durationInSeconds,
    };

    try {
      const res = await fetch("/api/scan-page/saveScan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
        credentials: "include",
      });
      const data = await res.json();
      // if (!res.ok || data.status === "NOT OK") {
      //   setScanStatus("NOT OK");
      //   setScanMessage(data.message || "Invalid scan or QR code.");
      // } else {
      //   setScanStatus("OK");
      // }
    } catch (err) {
      console.log("Error occurred, please try again later", err);
      setError("There is an error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || redirecting) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div
          className="spinner-border mb-3"
          role="status"
          style={{
            width: "3rem",
            height: "3rem",
            color: "orange", // changes the spinner color
          }}
        ></div>
        <span className="text-muted" style={{ fontSize: "1rem" }}>
          Please wait...
        </span>
      </div>
    );
  }

  // here the static error
  if (invalid) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center px-3 bg-light">
        {/* Heading */}
        <h2 className="text-danger fw-bold mb-3">Invalid QR Code</h2>

        {/* Image */}
        <img
          src="https://cdn-icons-png.flaticon.com/128/16208/16208197.png"
          alt="Invalid"
          className="mb-4 rounded shadow-sm"
          style={{ width: "128px", height: "128px" }}
        />

        {/* Paragraph */}
        <p className="text-muted mb-3">
          The QR code you scanned is either invalid, expired, or not recognized
          by the system. Please try another one.
        </p>

        {/* Error message if any */}
        <h4 className="text-danger mt-2">{error}</h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center px-3">
        <Image
          src="/images/item_not_found.jpg"
          alt="Item Not Found"
          width={300}
          height={250}
          className="mb-4 rounded shadow-sm"
        />
        <h4 className="text-danger mb-2">{error}</h4>
      </div>
    );
  }

  if (Active) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center px-3 bg-light">
        {/* Heading */}
        <h2 className="text-danger fw-bold mb-3">Active QR Code</h2>

        {/* Image */}
        <img
          src="https://cdn-icons-png.flaticon.com/128/12225/12225958.png"
          alt="Invalid"
          className="mb-4 rounded shadow-sm"
          style={{ width: "128px", height: "128px" }}
        />

        {/* Paragraph */}
        <p className="text-muted mb-3">
          The QR code you scanned is either invalid, expired, or not recognized
          by the system. Please try another one.
        </p>

        {/* Error message if any */}
        <h4 className="text-danger mt-2">{error}</h4>
      </div>
    );
  }

  if (Expired) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center px-3 bg-light">
        {/* <h2 className="text-danger fw-bold mb-3">Expired QR Code</h2>

        <img
          src="https://cdn-icons-png.flaticon.com/128/5671/5671551.png"
          alt="Invalid"
          className="mb-4 rounded shadow-sm"
          style={{ width: "128px", height: "128px" }}
        />

        <p className="text-muted mb-3">
          The QR code you scanned is either invalid, expired, or not recognized
          by the system. Please try another one.
        </p>

        <h4 className="text-danger mt-2">{error}</h4> */}

        <div dangerouslySetInnerHTML={{ __html: msgg }} />
      </div>
    );
  }

  if (Fake) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center px-3 bg-light">
        {/* Heading */}
        <h2 className="text-danger fw-bold mb-3">Fake QR Code</h2>

        {/* Image */}
        <img
          src="https://cdn-icons-png.flaticon.com/128/1483/1483341.png"
          alt="Invalid"
          className="mb-4 rounded shadow-sm"
          style={{ width: "128px", height: "128px" }}
        />

        {/* Paragraph */}
        <p className="text-muted mb-3">
          The QR code you scanned is either invalid, expired, or not recognized
          by the system. Please try another one.
        </p>

        {/* Error message if any */}
        <h4 className="text-danger mt-2">{error}</h4>
      </div>
    );
  }

  if (BlackListed) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center px-3 bg-light">
        {/* Heading */}
        <h2 className="text-danger fw-bold mb-3">BlackListed QR Code</h2>

        {/* Image */}
        <img
          src="https://cdn-icons-png.flaticon.com/128/24/24801.png"
          alt="Invalid"
          className="mb-4 rounded shadow-sm"
          style={{ width: "128px", height: "128px" }}
        />

        {/* Paragraph */}
        <p className="text-muted mb-3">
          The QR code you scanned is either invalid, expired, or not recognized
          by the system. Please try another one.
        </p>

        {/* Error message if any */}
        <h4 className="text-danger mt-2">{error}</h4>
      </div>
    );
  }

  if (Inactive) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center px-3 bg-light">
        {/* <h2 className="text-danger fw-bold mb-3">Inactive QR Code</h2>

       
        <img
          src="https://cdn-icons-png.flaticon.com/128/11480/11480014.png"
          alt="Invalid"
          className="mb-4 rounded shadow-sm"
          style={{ width: "128px", height: "128px" }}
        />

        
        <p className="text-muted mb-3">
          The QR code you scanned is either invalid, expired, or not recognized
          by the system. Please try another one.
        </p>

       
        <h4 className="text-danger mt-2">{error}</h4> */}

        <div dangerouslySetInnerHTML={{ __html: msgg }} />
      </div>
    );
  }

  if (NotFound) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center px-3 bg-light">
        {/* Heading */}
        <h2 className="text-danger fw-bold mb-3">Do Not Scan it </h2>

        {/* Image */}
        <img
          src="https://cdn-icons-png.flaticon.com/128/7465/7465563.png"
          alt="Invalid"
          className="mb-4 rounded shadow-sm"
          style={{ width: "128px", height: "128px" }}
        />

        {/* Paragraph */}
        <p className="text-muted mb-3">
          "You can't scan this QR because it hasn't been reported as lost yet.
        </p>

        {/* Error message if any */}
        <h4 className="text-danger mt-2">{error}</h4>
      </div>
    );
  }

  if (!item) {
    <p>
      No item found for this QR code. Please try scanning again or link a new
      item.
    </p>;
  }

  const handleContactOwner = () => {
    const queryParams = new URLSearchParams({
      lang: selectedLang, // ✅ Pass selected language
      title: translatedText.title,
      description: translatedText.description,
      welcome: translatedText.welcome,
      notice: translatedText.notice,
      support: translatedText.support,
      contact: translatedText.contact,
      p: translatedText.p,
      h1: translatedText.h1,
      select: translatedText.select,
      slogan: translatedText.slogan,
      Item: translatedText.Item,
      message: translatedText.message,
      footer: translatedText.footer,
    }).toString();

    router.push(`/qr/${id}/contact`); // ✅ Redirect with translated content
  };

  return (
    <div
    className="min-vh-100 text-center position-relative"
    style={{
      background: "#fff4ff",
      padding: "40px 20px",
    }}
  >
  
      <img
        src="/images/qritagya.png"
        alt="Logo"
        style={{
          width: "200px", // Adjust the size as needed
          height: "auto",
          marginBottom: "20px",
        }}
      />
      <div
        className="pb-3"
        // className="d-flex justify-content-between align-items-center w-100"
        // style={{ maxWidth: "600px" }}
      >
        <h3 className="text-muted small">{translatedText.h1}</h3>

        <div className="align-items-center gap-1">
          <div
            className="text-center mb-3"
            style={{ maxWidth: "100%", paddingTop: "10px" }}
          >
            {/* Brand Image Full Width */}
            <img
              src={item?.brandImage}
              alt={item?.brandName || "Brand"}
              style={{
                width: "80%",
                maxWidth: "150px",
                height: "auto",
                borderRadius: "12px",
                objectFit: "cover",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                marginBottom: "10px",
              }}
            />

            {/* Welcome Text in New Line */}
            <div
              className="text-muted"
              style={{
                fontSize: "1rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              {item?.brandWelcomeMessage}
            </div>
          </div>
        </div>

        <div
          className="position-absolute"
          style={{ top: "15px", right: "20px" }}
        >
          {onResetLanguage && scanStatus === "OK" && (
            <button
              onClick={onResetLanguage}
              className="btn btn-sm d-flex align-items-center gap-2"
              style={{
                fontSize: "0.8rem",
                padding: "6px 15px",
                borderRadius: "8px",
                fontWeight: 500,
                border: "1px solid #a22191",
                color: "#a22191",
                backgroundColor: "transparent",
              }}
            >
              <FaLanguage size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Card for Image and Title with Transparent Background and Blue Border */}
      <div className="  ">
        {/* Image at the Top */}
        {scanStatus === "OK" ? (
          <>
            <div
              className=" "
              style={{
                width: "100%",
                height: "250px", // Fixed height for the image
                backgroundImage: `url(${
                  item?.image_url || "/default-image.png"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "10px", // Rounded corners for the image
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Soft shadow around the image
              }}
            ></div>

            {/* Text Below the Image */}
            <div className=" py-3">
              <h2
                className="fw-bold text-dark  "
                style={{
                  fontSize: "1.8rem", // Larger title
                  whiteSpace: "nowrap", // Prevent wrapping
                  overflow: "hidden", // Hide overflow if the title is too long
                  textOverflow: "ellipsis", // Show ellipsis if the title overflows
                }}
              >
                <h1 className="text-sm">
                  {" "}
                  <div
                    style={{
                      color: "#1e7f53",
                      padding: "8px",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {/* Placeholder for Image */}
                    <img
                      src="/images/shield.png"
                      alt="Protected Icon"
                      style={{ width: "20px", height: "20px" }}
                    />

                    <span>{translatedText.slogan}</span>
                  </div>
                </h1>
              </h2>
              <hr className="m-0" />
              <div className="my-3">
                <div className="d-flex justify-content-between ">
                  <div className="text-sm fw-bold text-start ">
                    <span className="fw-light fs-6 text-muted">
                      {translatedText.Item} Name{" "}
                    </span>
                    <br />
                    <span
                      className="fs-3 "
                      style={{ color: "rgb(252, 151, 56))" }}
                    >
                      {translatedText.title}
                    </span>
                  </div>
                  <div className="text-sm fw-bold text-start ">
                    <span className="fw-light fs-6 text-muted ">Status </span>
                    <br />
                    <span className="fs-3 text-danger ">Lost</span>
                  </div>
                </div>
                <p
                  className=" fs-6 my-3 p-3  text-center"
                  style={{
                    // lineHeight: "1.5",
                    // fontWeight: "500",
                    // fontStyle: "italic",
                    // backgroundColor:"#e4fff3",
                    // color:'#1f1f1f'
                    borderRadius: "50px",
                    backgroundColor: "#ffd6f8",
                    color: "rgb(0 0 0)",
                  }}
                >
                  {/* {translatedText.p} */}

                  {translatedText.message}
                </p>
              </div>
              <hr className="m-0" />
              {/* <p
                  className=" fs-6 my-3 p-3  text-center"
                  style={{
                    lineHeight: "1.5",
                    fontWeight: "500",
                    fontStyle: "italic",
                    backgroundColor:"#e4fff3",
                    color:'#1f1f1f'
                  }}
                >
                  {translatedText.p}

                  {translatedText.message}
                </p> */}
            </div>

            {/* Footer Text on the Center */}
            <div className="d-flex align-items-center flex-column ">
              {scanStatus === "OK" && (
                <p
                  className="d-flex justify-content-center align-items-center mt-3"
                  style={{
                    fontSize: "0.75rem",
                    color: "#555",
                    fontWeight: "500",
                    textAlign: "center",
                    lineHeight: "1.3",
                  }}
                >
                  <img
                    src="/images/lock.png"
                    alt="Lock Icon"
                    style={{
                      width: "18px",
                      height: "18px",
                      marginRight: "8px",
                      flexShrink: 0,
                    }}
                  />
                  {translatedText.footer}
                </p>
              )}
              <div className="mt-auto w-100 ">
                <Button
                  onClick={handleContactOwner}
                  className="rounded-pill px-3 py-2 mb-2 w-100"
                  style={{
                    background:
                      "#a22191", // Gradient background
                    border: "none",
                    fontSize: "0.6rem",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", // Stronger shadow
                    borderRadius: "12px", // Less rounded corners
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px", // Space between icon & text
                    // width: "280px", // Increased width
                    // maxWidth: "300px", // Keeps it balanced
                  }}
                >
                  {/* <img
                    src="/images/phone-call.png"
                    alt="Contact Icon"
                    style={{ width: "22px", height: "22px", opacity: "0.9" }} // Slight transparency
                  /> */}

                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    {translatedText.contact}
                  </span>
                </Button>
                <Button
                  variant="link"
                  className="rounded-pill px-3 py-2  w-100"
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    backgroundColor: "#fff4ff", // lightest orange bg
                    color: "#a22191", // orange text
                    border: "1px solid #a22191",
                  }}
                  onClick={() => router.push("/")}
                >
                  Home
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div
            className="alert alert-danger d-flex align-items-center justify-content-center mx-auto mt-3"
            style={{
              maxWidth: "500px",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "500",
              textAlign: "center",
            }}
          >
            {scanMessage || "This QR scan is not valid at this time."}
          </div>
        )}
      </div>
    </div>
  );
};

const QRPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [selectedLang, setSelectedLang] = useState(null);
  const [showLangSelector, setShowLangSelector] = useState(false);

  useEffect(() => {
    const langFromCookie = Cookies.get("preferred_language");

    if (langFromCookie) {
      setSelectedLang(langFromCookie);
      setShowLangSelector(false);
    } else {
      setShowLangSelector(true);
    }
  }, []);

  const handleLanguageSelect = (langCode) => {
    Cookies.set("preferred_language", langCode, { expires: 365 });
    setSelectedLang(langCode);
    setShowLangSelector(false);
  };

  const handleLanguageReset = () => {
    Cookies.remove("preferred_language");
    setSelectedLang(null);
    setShowLangSelector(true);
  };

  if (!id) return null;

  return (
    <>
      {showLangSelector ? (
        <LanguageSelectionPage onSelect={handleLanguageSelect} />
      ) : (
        <ItemDetail
          selectedLang={selectedLang}
          onResetLanguage={handleLanguageReset}
        />
      )}
    </>
  );
};

export default QRPage;
