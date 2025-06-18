import { useEffect, useState, useRef } from "react";
import { IoIosArrowBack, IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Alert, Button, Form, Modal, InputGroup } from "react-bootstrap";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

import { FiEdit } from "react-icons/fi";
import Select, { components } from "react-select";

import { BsChevronDown } from "react-icons/bs";

import {
  FaCar,
  FaMobileAlt,
  FaLaptop,
  FaBriefcase,
  FaDog,
  FaFileAlt,
  FaBoxOpen,
  FaCamera,
  FaUser,
  FaPaperPlane,
  FaEnvelope,
} from "react-icons/fa";

const categoryIconMap = {
  1: <FaCar className="me-2 text-danger" />, // Vehicle
  3: <FaMobileAlt className="me-2 text-primary" />, // Mobile Phone
  4: <FaLaptop className="me-2 text-secondary" />, // Laptop
  5: <FaBriefcase className="me-2 text-dark" />, // Bag
  8: <FaDog className="me-2 text-warning" />, // Pet
  10: <FaFileAlt className="me-2 text-info" />, // Documents
  15: <FaBoxOpen className="me-2 text-muted" />, // Others
};

const Contact = () => {
  const [showLocationModal, setShowLocationModal] = useState(false); // Modal visibility state
  const router = useRouter();
  const { id, lang, title, description, welcome, notice, support, contact } =
    router.query; // ✅ Read query params

  const [item, setItem] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [isMobileAlertShown, setIsMobileAlertShown] = useState(false); // Track alert status
  const [location, setLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    messageA: "",
    image: null,
  });
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // 'success' or 'danger'
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission
  const [showThankYou, setShowThankYou] = useState(false);
  const [messages, setMessages] = useState({});
  const [templateMessages, setTemplateMessages] = useState([]); // Stores category messages
  const [selectedLang, setSelectedLang] = useState(lang || "en");
  const [translatedText, setTranslatedText] = useState({
    title: title || "",
    description: description || "",
    welcome: welcome || "",
    notice: notice || "",
    support: support || "",
    contact: contact || "",
    allowLocation: "Please Allow location access.",
    denyLocation: "Deny",
    shareLocation: "Please Share Your Location",
    enableLocation: "Enable Location",
    fetchingLocation: "Fetching location data.",
    contactSuccess: "Thank You for Your Contribution!",
    submissionSuccess: "Your submission has been successfully sent.",
    heading: "Contact Owner",
    OwnerDetails: " Owner Details",
    detailsBrand: "Brand",
    detailsName: "Name",
    detailsMobile: "Contact",
    detailsemail: "Email",
    CapturePhoto: "Capture Photo",
    PhotoSelected: "Photo Selected",
    TemplateMessage: "Template Message",
    Message: "Message",
    Enteryourname: "Enter your name",
    Enter10digitmobilenumber: "Enter 10 digit mobile number",
    Selectatemplatemessage: " Select a template message",
    Typeyourmessage: " Type your message",
  });
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      // Optional alert or redirect
      router.replace(`/qr/${router.query.id}/contact`); // force stay
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router.query.id]);

  const handleBack = () => {
    router.back(); // Goes back to the previous route
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const brandId = Cookies.get("scanned_brand_id"); // ✅ Get stored brand_id from cookies

      if (!brandId) {
        return; // Stop execution if no brand_id
      }

      try {
        const response = await fetch(`/api/brand/alerts?brand_id=${brandId}`);
        const data = await response.json();
        if (data.messages && Array.isArray(data.messages)) {
          // ✅ Convert array to object for easy lookup
          const messagesObj = {};
          data.messages.forEach((msg) => {
            messagesObj[msg.message_key] = msg.message;
          });
          setMessages(messagesObj);
        }
      } catch (error) {
        console.log("error fetching onboarding massage", error);
      }
    };

    fetchMessages();
  }, []);
  const getMessage = (key) => {
    if (router.query[key]) {
      return router.query[key];
    }
    return messages[key] || ""; // Return message if key exists, otherwise empty string
  };

  useEffect(() => {
    if (id) {
      const fetchItem = async () => {
        try {
          const response = await fetch(`/api/item/${id}`);
          if (!response.ok) throw new Error("Failed to fetch item.");
          const data = await response.json();
          setItem(data.itemDetails);
          setOwnerData(data.ownerResult[0]);

          translateText(
            {
              title: data.itemDetails.item_name,
              description: data.itemDetails.description,
              welcome: `Welcome to ${data.itemDetails.brandName || "N/A"}`,
              notice: "Some notice message here..",
              support: "This page helps reconnect this item with its owner.",
              contact: "Contact Owner",
              allowLocation:
                "Please Turn On Your Location to Help the Item Owner!",
              denyLocation: "Deny",
              shareLocation: "Please Share Your Location",
              enableLocation:
                "To assist in reconnecting this item with its rightful owner, kindly enable your location. Your contribution is highly valued and appreciated!",
              fetchingLocation: "Fetching location data.",
              contactSuccess: "Thank You for Your Contribution!",
              submissionSuccess:
                " Your submission has been successfully sent. We appreciate your help in reconnecting this item with its rightful owner",
              heading: "Contact Owner",
              OwnerDetails: "OwnerDetails",
              detailsBrand: "Brand",
              detailsName: "Name",
              detailsMobile: "Contact",
              detailsemail: "Email",
              CapturePhoto: "Capture Photo",
              TemplateMessage: "Template Message",
              Message: "Message",
              Enteryourname: "Enter your name",
              Enter10digitmobilenumber: "Enter 10 digit mobile number",
              Selectatemplatemessage: " Select a template message",
              Typeyourmessage: " Type your message",
              submit: "Submit",
              Submitting: "Submitting...",
              nameError: "Name is required.",
              mobileError: "Mobile number is required.",
              imageError: "Please capture image.",
              vaildMobileError: "Invalid mobile number. Must be 10 digits.",
            },
            selectedLang
          );
        } catch (err) {
          console.log("Error fetching item details", err);
        } finally {
          setLoading(false);
        }
      };

      fetchItem();
    }
  }, [id, selectedLang]);

  const fetchIPBasedLocation = async () => {
    try {
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();
      const ipAddress = ipData.ip;

      const apiKey = "6x180hfpsHeC9DnJmD67CvQyILTRBndo";
      const requestOptions = {
        method: "GET",
        headers: { apikey: apiKey },
      };

      const response = await fetch(
        `https://api.apilayer.com/ip_to_location/${ipAddress}`,
        requestOptions
      );

      const ipInfoData = await response.json();

      const parsedLocation = {
        city: ipInfoData.city || "Unknown",
        state: ipInfoData.region_name || "Unknown",
        country: ipInfoData.country_name || "Unknown",
        latitude: ipInfoData.latitude || "Unknown",
        longitude: ipInfoData.longitude || "Unknown",
      };

      setLocation(parsedLocation);
    } catch (error) {
      console.error("IP location error:", error);
      setLocation({
        city: "Unknown",
        state: "Unknown",
        country: "Unknown",
        latitude: "Unknown",
        longitude: "Unknown",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const translateText = async (textObj, targetLang) => {
    if (!textObj || targetLang === "en") {
      setTranslatedText(textObj);
      return;
    }

    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY}`,
        {
          method: "POST",
          body: JSON.stringify({
            q: Array.isArray(textObj) ? textObj : Object.values(textObj),
            target: targetLang,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      const translatedValues = data.data?.translations.map(
        (t) => t.translatedText
      );

      if (Array.isArray(textObj)) {
        setTemplateMessages(translatedValues); // 👈 Set translated templates here
      } else {
        setTranslatedText({
          title: translatedValues[0],
          description: translatedValues[1],
          welcome: translatedValues[2],
          notice: translatedValues[3],
          support: translatedValues[4],
          contact: translatedValues[5],
          allowLocation: translatedValues[6],
          denyLocation: translatedValues[7],
          shareLocation: translatedValues[8],
          enableLocation: translatedValues[9],
          fetchingLocation: translatedValues[10],
          contactSuccess: translatedValues[11],
          submissionSuccess: translatedValues[12],
          heading: translatedValues[13],
          OwnerDetails: translatedValues[14],
          detailsBrand: translatedValues[15],
          detailsName: translatedValues[16],
          detailsMobile: translatedValues[17],
          detailsemail: translatedValues[18],
          CapturePhoto: translatedValues[19],
          TemplateMessage: translatedValues[20],
          Message: translatedValues[21],
          Enteryourname: translatedValues[22],
          Enter10digitmobilenumber: translatedValues[23],
          Selectatemplatemessage: translatedValues[24],
          Typeyourmessage: translatedValues[25],
          submit: translatedValues[26],
          Submitting: translatedValues[27],
          nameError: translatedValues[28],
          mobileError: translatedValues[29],
          imageError: translatedValues[30],
          vaildMobileError: translatedValues[31],
        });
      }
    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  // Fetch Location Data
  useEffect(() => {
    const fetchcateItems = async () => {
      try {
        const response = await fetch("/api/getitemcate");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        const originalMessages = [
          ...new Set(data.data.map((item) => item.category_message)),
        ];
        setItems(data.data);
        // Translate based on selectedLang
        if (selectedLang && selectedLang !== "en") {
          translateText(originalMessages, selectedLang);
        } else {
          setTemplateMessages(originalMessages); // For English
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchcateItems();
  }, [selectedLang]);

  useEffect(() => {
    const savedLocation = Cookies.get("user_location");

    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setLocation(parsed);
        setLocationLoading(false);
      } catch (err) {
        console.error("Invalid location cookie:", err);
        // fallback to modal prompt
        setShowLocationModal(true);
      }
    } else {
      // No cookie found, prompt for location
      setShowLocationModal(true);
    }
  }, []);

  const handleAllowLocation = () => {
    return true;
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = translatedText.nameError;
    // if (!formData.email.trim()) {
    //   errors.email = "Email is required.";
    // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    //   errors.email = "Invalid email format.";
    // }
    if (!formData.mobile.trim()) {
      errors.mobile = translatedText.mobileError;
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      errors.mobile = translatedText.vaildMobileError;
    }
    // if (!formData.messageA.trim()) errors.messageA = "Message is required.";
    if (!formData.image) errors.image = translatedText.imageError; // Validate image
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file, // Store the file in state
      }));
      setErrors((prev) => ({
        ...prev,
        image: "", // Clear any existing errors
      }));
    }
  };

  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true); // Start submission

    try {
      // Fetch the consent before submitting the form
      const responseConsent = await fetch("/api/admin/setting");
      const dataConsent = await responseConsent.json();

      // Get the consent data (fender_consent)
      const fenderConsent = decodeHtml(
        dataConsent.fidner_consent || "No consent available"
      );

      // Show the SweetAlert popup with the consent message
      const result = await Swal.fire({
        title: "Consent Required",
        html: fenderConsent,
        showCancelButton: true,
        confirmButtonText: "I Agree",
        cancelButtonText: "I Do Not Agree",
        customClass: {
          popup: "swal-popup", // custom class here
        },
      });

      
    

      // If the user clicks "I Agree", proceed with the form submission
      if (result.isConfirmed) {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        // formDataToSend.append("email", formData.email);
        formDataToSend.append("mobile", formData.mobile);
        formDataToSend.append("messageA", formData.messageA);
        formDataToSend.append("image", formData.image); // Add the file
        formDataToSend.append("latitude", location?.latitude || "");
        formDataToSend.append("longitude", location?.longitude || "");
        formDataToSend.append("item_id", item.item_id);
        formDataToSend.append("city", location?.city || "Unknown");
        formDataToSend.append("region_name", location?.state || "Unknown");
        formDataToSend.append("country_name", location?.country || "Unknown");
        formDataToSend.append("user_id", item.user_id);
        formDataToSend.append(
          "language",
          Cookies.get("preferred_language") || "en"
        );
        formDataToSend.append("unique_user_id", Cookies.get("unique_user_id"));

        const response = await fetch("/api/finder/contactOwner", {
          method: "POST",
          body: formDataToSend,
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // ✅ Show alert if message exists
        if (getMessage("AFTER_CONTACT_SUBMITTED")) {
          Swal.fire({
            icon: "success",
            title: "Contact Submitted",
            text: `✅ ${getMessage("AFTER_CONTACT_SUBMITTED")}`,
            confirmButtonColor: "#3085d6",
          });
        }

        const reDa = await response.json();

        if (response.status == 200 || response.status == 201) {
          router.push(
            `/qr/${id}/verifyotp?refs=${reDa.contactOwner.id}&mobile=${formData.mobile}`
          );
        } else {
          throw new Error("Failed to submit form.");
        }
      } else {
        // If the user cancels the consent, close the form submission process
      }
    } catch (err) {
      console.log("Error submitting form", err);

      setAlertMessage(
        "There was an error contacting the item owner. Please try again."
      );
      setAlertType("danger");
    } finally {
      setIsSubmitting(false); // End submission
    }
  };

  const DropdownIndicator = (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <BsChevronDown className="text-primary" />
      </components.DropdownIndicator>
    );
  };

  return (
    <>
      <>

        <style>{`

     
    

    @media (max-width: 768px) {
      .capture-button {
        margin-top: -25px!important;
      }
        .owner-custom{
          margin-bottom: -9px!important;}
    }
  `}</style>

        {/* Top Back Button and Heading */}
        <div className="d-flex align-items-center bg-white p-3">
          <IoIosArrowBack className="fs-3" onClick={handleBack} />
          <div className="w-100">
            <h4 className="mb-0" style={{ marginLeft: "5%" }}>
              {translatedText.heading}
            </h4>
          </div>
        </div>
        <div
          className="container py-4 contact-form-ui"
          style={{ minHeight: "86vh" }}
        >
          {loading ? (
            <div className="text-center">
              <span
                className="spinner-border spinner-border-lg"
                role="status"
                aria-hidden="true"
              ></span>
              <p>Loading...</p>
            </div>
          ) : showThankYou ? (
            <div className="text-center">
              <IoMdCheckmarkCircleOutline
                size={60}
                style={{ color: "#624BFF", marginBottom: "20px" }}
              />
              <h4 style={{ color: "#624BFF" }}>
                {translatedText.contactSuccess}
              </h4>
              <p className="mt-3" style={{ fontSize: "16px", color: "#333" }}>
                {translatedText.su}
              </p>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body row">
                {/* Left Column */}
                <div className="col-md-6 border-end pe-md-4 mb-4 mb-md-0">
                  <div className="mb-4">
                    <h4
                      className="fw-bold mb-2 d-flex align-items-center"
                      style={{ color: "#333" }}
                    >
                      {categoryIconMap[item?.category_id] || (
                        <FaBoxOpen className="me-2 text-muted" />
                      )}
                      {translatedText.title || "Unnamed Item"}
                    </h4>

                    <p
                      className="owner-custom bg-light px-3 py-2 my-4 mb-4 rounded position-relative"
                      style={{
                        fontWeight: "600",
                        fontStyle: "italic",
                        borderLeft: "4px solid #624BFF",
                        backgroundColor: "#f9f9f9",
                        color: "#333",
                      }}
                    >
                      <span className="text-muted">
                        “
                        {translatedText.description ||
                          "No description available."}
                        ”
                      </span>
                    </p>
                  </div>
                  {ownerData?.privacy == 1 && (
                    <div className="mb-4">
                      <h5 className="fw-bold mb-2" style={{ color: "#333" }}>
                        {translatedText.OwnerDetails}
                      </h5>
                      <div className="ms-2">
                        <div className="mb-2 d-flex align-items-center">
                          <FaUser
                            style={{ color: "#624BFF" }}
                            className="me-2"
                          />
                          <span className="fw-medium" style={{ color: "#333" }}>
                            {translatedText.detailsName}:
                          </span>
                          <h6 className="mb-0 ms-2 d-inline">
                            {ownerData?.full_name}
                          </h6>
                        </div>
                        <div className="mb-2 d-flex align-items-center">
                          <FaMobileAlt
                            style={{ color: "#624BFF" }}
                            className="me-2"
                          />

                          <span className="fw-medium" style={{ color: "#333" }}>
                            {translatedText.detailsMobile}:
                          </span>
                          <h6 className="mb-0 ms-2 d-inline">
                            {ownerData?.mobile
                              ? `${ownerData.mobile.slice(
                                  0,
                                  2
                                )}****${ownerData.mobile.slice(-3)}`
                              : "******"}
                          </h6>
                        </div>
                        <div className="d-flex align-items-center">
                          <FaEnvelope
                            style={{ color: "#624BFF" }}
                            className="me-2"
                          />
                          <span className="fw-medium" style={{ color: "#333" }}>
                            {translatedText.detailsemail}:
                          </span>
                          <h6 className="mb-0 ms-2 d-inline">
                            {ownerData?.email
                              ? `${ownerData.email.slice(0, 2)}****@${
                                  ownerData.email.split("@")[1]
                                }`
                              : "******"}
                          </h6>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="col-md-6 mt-3">
                  {alertMessage && (
                    <Alert variant={alertType} className="mb-4">
                      {alertMessage}
                    </Alert>
                  )}

                  {locationLoading ? (
                    <div className="text-center">
                      <span
                        className="spinner-border spinner-border-lg"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      <p>Loading...</p>
                    </div>
                  ) : location ? (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-4 capture-group">
                        <input
                          type="file"
                          id="image"
                          accept="image/*"
                          capture="environment"
                          ref={fileInputRef}
                          onChange={handleFileInput}
                          style={{ display: "none" }}
                        />

                        {/* Show capture button only if image not selected */}
                        {!formData.image && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="btn w-100 px-4 py-3 rounded d-flex justify-content-center align-items-center gap-2 capture-button"
                            style={{
                              border: "2px dotted #a22191",
                              backgroundColor: "#fdfbff",
                              color: "#a22191",
                              fontWeight: "500",
                            }}
                          >
                            <FaCamera />
                            {translatedText.CapturePhoto}
                          </button>
                        )}

                        {/* Show image preview with pencil icon if image is selected */}
                        {formData.image && (
                          <div
                            className="d-flex justify-content-center position-relative"
                            style={{ marginTop: "-31px" }}
                          >
                            <img
                              src={
                                typeof formData.image === "string"
                                  ? formData.image
                                  : URL.createObjectURL(formData.image)
                              }
                              alt="Preview"
                              style={{
                                width: "160px",
                                height: "160px",
                                objectFit: "cover",
                                borderRadius: "10px",
                                border: "1px solid #a22191",
                              }}
                            />
                            <FiEdit
                              onClick={() => fileInputRef.current.click()}
                              style={{
                                position: "absolute",
                                top: "8px",
                                right: "calc(50% - 70px)", // Adjust to keep icon inside image
                                color: "#a22191",
                                fontSize: "20px",
                                cursor: "pointer",
                              }}
                            />
                          </div>
                        )}

                        {errors.image && (
                          <div className="text-danger mt-2">{errors.image}</div>
                        )}
                      </Form.Group>

                      {/* Name */}
                      <Form.Group className="mb-3">
                        <InputGroup style={{ marginTop: "-4px" }}>
                          <InputGroup.Text>
                            <FaUser style={{ color: "#a22191" }} />
                          </InputGroup.Text>
                          <Form.Control
                            id="name"
                            value={formData.name}
                            placeholder={translatedText.Enteryourname}
                            onChange={handleInputChange}
                            isInvalid={!!errors.name}
                            className={
                              !!errors.name
                                ? "is-invalid"
                                : formData.name
                                ? "is-valid"
                                : ""
                            }
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.name}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>

                      {/* Contact No. */}
                      <Form.Group className="mb-3">
                        <InputGroup>
                          <InputGroup.Text>
                            <FaMobileAlt style={{ color: "#a22191" }} />
                          </InputGroup.Text>
                          <Form.Control
                            id="mobile"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            placeholder={
                              translatedText.Enter10digitmobilenumber
                            }
                            isInvalid={!!errors.mobile}
                            className={
                              !!errors.mobile
                                ? "is-invalid"
                                : formData.mobile
                                ? "is-valid"
                                : ""
                            }
                            onFocus={() => {
                              if (!isMobileAlertShown) {
                                const msg = getMessage(
                                  "CONSANT_FOR_MOBILE_AT_FINDER"
                                );
                                if (msg) {
                                  Swal.fire({
                                    icon: "info",
                                    title: "Notification",
                                    text: `📢 ${msg}`,
                                    confirmButtonColor: "#a22191",
                                  });
                                  setIsMobileAlertShown(true);
                                }
                              }
                            }}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.mobile}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>

                      {/* Template Message */}
                      {templateMessages.length > 0 && (
                        <Form.Group className="mb-3">
                          <Select
                            components={{ DropdownIndicator }}
                            options={templateMessages.map((msg) => ({
                              label: msg,
                              value: msg,
                            }))}
                            isClearable
                            onChange={(selectedOption) => {
                              if (selectedOption) {
                                setFormData((prev) => ({
                                  ...prev,
                                  messageA: prev.messageA
                                    ? prev.messageA + " " + selectedOption.value
                                    : selectedOption.value,
                                }));
                              }
                            }}
                            styles={{
                              control: (base) => ({
                                ...base,
                                borderColor: "#a22191",
                                borderRadius: "0.375rem",
                                boxShadow: "none",
                              }),
                              placeholder: (base) => ({
                                ...base,
                                color: "#a22191",
                                fontWeight: 500,
                              }),
                            }}
                            placeholder={translatedText.Selectatemplatemessage}
                          />
                        </Form.Group>
                      )}

                      {/* Message */}
                      <Form.Group className="mb-4">
                        <Form.Control
                          as="textarea"
                          id="messageA"
                          rows={4}
                          value={formData.messageA}
                          onChange={handleInputChange}
                          placeholder={`💬 ${translatedText.Typeyourmessage}`}
                          isInvalid={!!errors.messageA}
                          className={
                            !!errors.messageA
                              ? "is-invalid"
                              : formData.messageA
                              ? "is-valid"
                              : ""
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.messageA}
                        </Form.Control.Feedback>
                      </Form.Group>

                      {/* Submit */}
                      <button
                        type="submit"
                        className="btn btn-primary w-100 d-flex justify-content-center align-items-center gap-2"
                        style={{
                          backgroundColor: "#a22191",
                          borderColor: "#a22191",
                          color: "#fff",
                          fontWeight: "500",
                        }}
                        disabled={isSubmitting}
                      >
                        <FaPaperPlane />
                        {isSubmitting
                          ? translatedText.Submitting
                          : translatedText.submit}
                      </button>
                    </Form>
                  ) : (
                    <div className="text-center">
                      <h4 style={{ color: "#624BFF" }}>
                        {translatedText.allowLocation}
                      </h4>
                      <p
                        className="mt-3"
                        style={{ fontSize: "16px", color: "#333" }}
                      >
                        {translatedText.enableLocation}
                      </p>
                      <Button
                        variant="primary"
                        onClick={handleAllowLocation}
                        style={{
                          backgroundColor: "#624BFF",
                          borderColor: "#624BFF",
                        }}
                      >
                        {translatedText.shareLocation}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
      {/* 
      <Modal show={showLocationModal} onHide={handleDenyLocation} centered>
        <Modal.Header closeButton>
          <Modal.Title>{translatedText.all}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          
          {getMessage("BEFORE_LOCATION_POPUP") && (
            <Alert variant="info">{getMessage("BEFORE_LOCATION_POPUP")}</Alert>
          )}

          <p className="text-dark">{translatedText.shareLocation}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              handleDenyLocation();
              
              if (getMessage("IF_USER_DENIES_LOCATION")) {
                Swal.fire({
                  icon: "warning",
                  title: "Location Access Denied",
                  text: `🚫 ${getMessage("IF_USER_DENIES_LOCATION")}`,
                  confirmButtonColor: "#d33",
                });
              }
            }}
          >
            Deny
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleAllowLocation();
              
              if (getMessage("WHEN_REQUESTING_LOCATION")) {
                Swal.fire({
                  icon: "info",
                  title: "Location Request",
                  text: `📍 ${getMessage("WHEN_REQUESTING_LOCATION")}`,
                  confirmButtonColor: "#3085d6",
                });
              }
            }}
          >
            Allow
          </Button>
        </Modal.Footer>
      </Modal>
       */}
    </>
  );
};

export default Contact;
