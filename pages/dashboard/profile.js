import React, { useEffect, useState } from "react";
import GoBack from "./backButton";
import Support from "pages/support";
import { apiRequest } from "utils/apiRequest";
import { Alert, Button, Card, Modal, Offcanvas } from "react-bootstrap";
import { ExclamationTriangleFill } from "react-bootstrap-icons";
import { TbLogout2, TbLogout } from "react-icons/tb";
import Loading from "utils/Loading";
import Cookies from "js-cookie";
import { MdOutlineCamera } from "react-icons/md";
import Image from "next/image";
import useTranslate from "utils/useTranslate";
import { FaLanguage } from "react-icons/fa";
import { useRouter } from "next/router";
import LanguageSelectionPage from "utils/language";


const ProfileCard = () => {
  const [emails, setEmails] = useState([]);
  const [mobiles, setMobiles] = useState([]);
  const [privacy, setPrivacy] = useState(true);
  const [image, setImage] = useState(null);
  const [isUserData, setIsUserData] = useState({});
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [allowScanWithoutLostReport, setAllowScanWithoutLostReport] = useState(false);

  const [showMobileInput, setShowMobileInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Error state
  const [loading, setLoading] = useState(false); // Loading state for both fetching and saving
  const MAX_ENTRIES = 3;
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [emailErrors, setEmailErrors] = useState({}); // Error state for emails
  const [mobileErrors, setMobileErrors] = useState({}); // Error state for mobile numbers
  const [showLangModal, setShowLangModal] = useState(false);
  const [language, setLanguage] = useState("en");



  const router = useRouter();

  const texts = useTranslate({
    profile: "Profile",
    profileSettings: "Profile Setting",
    emailLabel: "Emails",
    mobileLabel: "Mobiles",
    privacy: "Privacy",
    privacyDesc: "Hide/Show Your Personal Detail From Finder",
    saveUpdate: "Save/Update",
    signOut: "Sign Out",
    maxLimitAlert: "You can add up to 3 email and mobile numbers.",
    choosePic: "Choose an option to upload your profile picture:",
    openCamera: "Open Camera",
    selectGallery: "Select from Gallery",
  });



  const handlePrivacyChange = () => {
    setPrivacy(!privacy);
  };

  const handleAddEmail = () => {
    if (emails.length < MAX_ENTRIES) {
      setEmails([...emails, ""]);
    } else {
      setErrorMessage("You have reached the maximum allowed email entries."); // Error message for email
    }
  };
  const handleScanPermissionToggle = () => {
    setAllowScanWithoutLostReport(!allowScanWithoutLostReport);
  };


  const handleAddMobile = () => {
    if (mobiles.length < MAX_ENTRIES) {
      setMobiles([...mobiles, ""]);
    } else {
      setErrorMessage("You have reached the maximum allowed mobile entries."); // Error message for mobile
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };



  function validateMobile(mobile) {
    const mobileRegex = /^[6-9]\d{9}$/; // Assumes 10-digit Indian mobile numbers starting with 6-9
    return mobileRegex.test(mobile.trim());
  }



  const handleEmailChange = (index, value) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);

    // Reset error when user changes the email
    setEmailErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[index]; // Remove error if valid
      return newErrors;
    });
  };


  const handleMobileChange = (index, value) => {
    const updatedMobiles = [...mobiles];
    updatedMobiles[index] = value;
    setMobiles(updatedMobiles);

    setMobileErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[index]; // Remove error if valid
      return newErrors;
    });
  };


  useEffect(() => {
    fetchUserDetails();
  }, []);
  const fetchUserDetails = async () => {
    setLoading(true); // Show loading when fetching data
    try {
      const url = "/api/user/userDetails";
      const userDetails = await apiRequest(url, "", "GET");

      setIsUserData(userDetails.user);
      setEmails([
        userDetails.user.email_1,
        userDetails.user.email_2,
        userDetails.user.email_3,
      ]);
      setMobiles([
        userDetails.user.mobile_1,
        userDetails.user.mobile_2,
        userDetails.user.mobile_3,
      ]);
      setImage(userDetails.user?.image);
      setAllowScanWithoutLostReport(!!userDetails.user.allow_unreported_scan);

    } catch (error) {
      // Log the error for better tracking
      console.log("faild to fetch user details", error);

      setErrorMessage("Failed to fetch user details. Please try again."); // Error handling
    } finally {
      setLoading(false); // Hide loading after fetching is done
    }
  };


  const handleSaveOrUpdate = async (langg) => {
    setLoading(true); // Show loading while saving data

    let hasError = false;
    let tempEmailErrors = {};
    let tempMobileErrors = {};

    const primaryEmail = isUserData.email;
    const primaryMobile = isUserData.mobile;
    const emailSet = new Set();
    emailSet.add(primaryEmail);

    emails.forEach((email, index) => {
      if (email && !validateEmail(email)) {
        hasError = true;
        tempEmailErrors[index] = "Please Enter Valid Email";
      }
      else {
        emailSet.add(email);
      }
    });

    const mobileSet = new Set();
    mobileSet.add(primaryMobile);

    mobiles.forEach((mobile, index) => {
      if (mobile && !validateMobile(mobile)) {
        hasError = true;
        tempMobileErrors[index] = "Please Enter Valid Mobile Number";
      }
      else {
        mobileSet.add(mobile);
      }
    });

    if (hasError) {
      setEmailErrors(tempEmailErrors);
      setMobileErrors(tempMobileErrors);
      setLoading(false);
      return;
    }

    try {
      const url = "/api/user/userDetails"; // API endpoint

      const formData = new FormData();
      formData.append("email_1", emails[0] || "");
      formData.append("email_2", emails[1] || "");
      formData.append("email_3", emails[2] || "");
      formData.append("mobile_1", mobiles[0] || "");
      formData.append("mobile_2", mobiles[1] || "");
      formData.append("mobile_3", mobiles[2] || "");
      formData.append("privacy", privacy ? 1 : 0);
      formData.append("language", langg);
      formData.append("allow_unreported_scan", allowScanWithoutLostReport ? 1 : 0);


      if (image) {
        formData.append("image", image);
      }

      // console.log("formData",formData)
      const response = await fetch(url, {
        method: "PATCH",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle backend error for email and mobile
        if (data.field === "email") {
          tempEmailErrors[0] = data.message;  // Display error on email field
          setEmailErrors(tempEmailErrors);
        } else if (data.field === "mobile") {
          tempMobileErrors[0] = data.message;  // Display error on mobile field
          setMobileErrors(tempMobileErrors);
        }
        setLoading(false);
        return;
      }

      fetchUserDetails();
      setErrorMessage(""); // Clear any existing error message
    } catch (error) {
      // Log the error for better tracking
      console.log("error occurred", error);

      setErrorMessage("An error occurred while saving the details. Please try again.");
    }
    finally {
      setLoading(false); // Hide loading after saving is done
    }
  };

  const handleLanguageSelect = (langCode) => {
    Cookies.set("preferred_language", langCode, { expires: 365 });
    setLanguage(langCode);
    setShowLangModal(false);
    languageChange(langCode)


  };

  const handleSignOut = () => {
    // Remove the cookie (replace 'your_cookie_name' with the actual cookie name)
    Cookies.remove("token");

    // You can also redirect the user after signing out (optional)
    window.location.href = "/authentication/sign-in"; // Redirect to the login page
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);


  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImage(file);

      // Prepare FormData
      const formData = new FormData();
      formData.append("image", file); // Append the selected image to FormData

      // Make PATCH API call to update the image
      try {
        const url = "/api/user/userDetails"; // API endpoint

        const response = await fetch(url, {
          method: "PATCH",
          body: formData, // Send the FormData with the image
        });

        if (!response.ok) {
          throw new Error("Failed to update image.");
        }

        const data = await response.json();
        handleClose()
        fetchUserDetails(); // Update user details after image update

      } catch (error) {
        // Log the error for better tracking
        console.log("error updateing image", error);

        setErrorMessage("An error occurred while updating the image. Please try again.");
      }
    }
  };


  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  const languageChange = (language) => {
    handleSaveOrUpdate(language)

    setTimeout(() => {
      window.location.reload(); // Hard refresh
    }, 1000);
  }




  return (
    <section>
      <div className="d-flex align-items-center bg-white p-3">
        <GoBack />
        <div className="w-100">
          <h4 className="mb-0" style={{ marginLeft: "5%" }}>
            {texts.profile}
          </h4>
        </div>
      </div>
      <div className="container py-4">
        <div className="row d-flex justify-content-center align-items-start h-100">
          <div className="col-12  ">
            <div className="card mb-4">
              <div className="card-body text-center">
                <div className="mt-3 mb-4 position-relative">
                  {image ? (
                    <div
                      className=" mx-auto"
                      style={{
                        width: "56%",
                        height: "112px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={image}
                        className="rounded-circle img-fluid"
                        alt="Profile"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <img
                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp"
                        className="rounded-circle img-fluid"
                        style={{ width: "100px" }}
                        alt="Profile"
                      />
                    </>
                  )}
                  <p
                    className="btn profile-btn-icon btn-white border border-2 rounded-circle btn-dashed ms-2"
                    onClick={handleShow}
                  >
                    +
                  </p>
                </div>
                <h4 className="mb-2">{isUserData.full_name}</h4>
                <p className="text-muted mb-4">
                  {isUserData.mobile} <span className="mx-2">|</span>{" "}
                  {isUserData.email}
                </p>
              </div>

              <button
                className="btn btn-sm d-flex align-items-center gap-2 position-absolute"
                style={{
                  top: "10px",
                  right: "10px",
                  fontSize: "0.8rem",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  fontWeight: 500,
                  border: "2px solid #a22191",
                  backgroundColor: "transparent",
                  color: "#a22191",
                  zIndex: 5,
                  transition: "all 0.3s ease"
                }}
                onClick={() => setShowLangModal(true)}
              >
                <FaLanguage size={20} />
              </button>



            </div>


            <div className="card" style={{ marginBottom: "25%" }}>
              {loading ? (
                <Card.Body>
                  <Loading />
                </Card.Body>
              ) : (
                <>
                  <Card.Body>
                    <h5 className="text-center mb-5">{texts.profileSettings}</h5>
                    <Alert variant="warning">
                      <ExclamationTriangleFill size={25} className="me-1" />
                      {texts.maxLimitAlert}
                    </Alert>

                    <div className="form-group mb-3">
                      <label>{texts.emailLabel}</label>
                      {emails.map((email, index) => (
                        <div key={index}>
                          {emailErrors[index] && (
                            <small className="text-danger">{emailErrors[index]}</small>
                          )}
                          <input
                            type="email"
                            className={`form-control mt-1 ${emailErrors[index] ? "border border-danger" : ""
                              }`}
                            placeholder={`Email ${index + 1}`}
                            value={email}
                            onChange={(e) => handleEmailChange(index, e.target.value)}
                          />

                        </div>
                      ))}
                    </div>

                    <div className="form-group mb-3">
                      <label>{texts.mobileLabel}</label>
                      {mobiles.map((mobile, index) => (
                        <div key={index}>
                          {mobileErrors[index] && (
                            <small className="text-danger">{mobileErrors[index]}</small>
                          )}
                          <input
                            type="text"
                            className={`form-control mt-1 ${mobileErrors[index] ? "border border-danger" : ""}`}
                            placeholder={`Mobile ${index + 1}`}
                            value={mobile}
                            onChange={(e) => handleMobileChange(index, e.target.value)}
                          />

                        </div>
                      ))}
                    </div>


                    {errorMessage && (
                      <Alert variant="danger">{errorMessage}</Alert>
                    )}

                    <div className="form-group">
                      <label>{texts.privacy}</label>
                      <div className="d-flex justify-content-between align-items-center">
                        <p className="text-muted">
                          {texts.privacyDesc}
                        </p>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={privacy}
                            onChange={handlePrivacyChange}
                            style={{
                              backgroundColor: privacy ? '#a22191' : '#ccc',
                              borderColor: '#a22191',
                            }}
                          />
                        </div>

                      </div>
                    </div>
                    <div className="form-group mt-3">
                      <label>Deny Scan Without Lost Report</label>
                      <div className="d-flex justify-content-between align-items-center">
                        <p className="text-muted">
                          Deny others to scan your code even if no lost report is submitted.
                        </p>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={allowScanWithoutLostReport}
                            onChange={handleScanPermissionToggle}
                            style={{
                              backgroundColor: allowScanWithoutLostReport ? '#FCB454' : '#ccc',
                              borderColor: '#FCB454',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-center">
                      <button
                        style={{
                          backgroundColor: '#a22191',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                        onClick={handleSaveOrUpdate}
                      >
                        {texts.saveUpdate}
                      </button>

                    </div>
                  </Card.Body>
                  <Card.Footer className="text-danger">
                    <div onClick={handleSignOut}>
                      <TbLogout className="fs-2 me-2" />
                      {texts.signOut}
                    </div>
                  </Card.Footer>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Support />

      <Offcanvas show={show} onHide={handleClose} placement={"bottom"}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            {texts.choosePic}

          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <p className="text-center mb-4"></p>
          <div className="d-flex justify-content-around">
            {/* Camera Option */}
            <label className="btn btn-sm btn-primary">
              {texts.openCamera}
              <input
                type="file"
                accept="image/*"
                capture="camera"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </label>

            {/* Gallery Option */}
            <label className="btn btn-sm btn-secondary">
              {texts.selectGallery}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </label>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <Modal show={showLangModal} onHide={() => setShowLangModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Choose Language</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LanguageSelectionPage onSelect={handleLanguageSelect} />
        </Modal.Body>
      </Modal>

    </section>
  );
};

export default ProfileCard;
