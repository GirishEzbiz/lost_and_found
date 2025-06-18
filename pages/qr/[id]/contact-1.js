import { useEffect, useState } from "react";
import { IoIosArrowBack, IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Alert, Button, Form, InputGroup, Modal } from "react-bootstrap";
import { useRouter } from "next/router";
 
const Contact = () => {
  const [showLocationModal, setShowLocationModal] = useState(false); // Modal visibility state
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [location, setLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    messageA: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // 'success' or 'danger'
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission
  const [showThankYou, setShowThankYou] = useState(false);

  const [mobile, setMobile] = useState(""); // Mobile number input
  const [otp, setOtp] = useState(""); // OTP input
  const [otpSent, setOtpSent] = useState(false); // Track OTP sent state
  const [serverOtp, setServerOtp] = useState(""); // Temporary for demo only

  const [isLoading, setIsLoading] = useState(false); // Sending OTP state
  const [isSendingOtp, setIsSendingOtp] = useState(false); // Sending OTP state
  const [isVerifying, setIsVerifying] = useState(false); // Verifying OTP state
  const [userVerified, setuserVerified] = useState(false); // Verifying OTP state

  const handleBack = () => {
    router.back(); // Goes back to the previous route
  };

  const sendOtp = async () => {
    if (!validateForm()) return;
    setIsSendingOtp(true);
    setAlertMessage(""); // Clear any previous messages
    let mobile = formData.mobile;
    let name = formData.name;
    try {
      const res = await fetch("/api/sendWhatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, name }),
      });
      const data = await res.json();

      if (data.success) {
        setOtpSent(true);
        setServerOtp(data.otp); // Temporary for demo; avoid exposing OTP in production
        setAlertMessage("OTP sent successfully via WhatsApp.");
      } else {
        setAlertMessage(data.error || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      logger.error({
          message: "Error sending OTP",
          error: err.message,
          stack: err.stack,
          function: "sendOTP"
      });
  
      console.error("Error sending OTP:", err);
      setAlertMessage("Something went wrong. Please try again.");
  } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setIsVerifying(true);
    setAlertMessage("");
    try {
      const res = await fetch("/api/finderAuth/verifyOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setAlertMessage("Mobile number verified successfully!");
        setuserVerified(true);
      } else {
        setAlertMessage(data.error || "Invalid or expired OTP.");
      }
    } catch (error) {
      logger.error({
          message: "An error occurred while verifying OTP",
          error: error.message,
          stack: error.stack,
          function: "verifyOTP"
      });
  
      setAlertMessage("An error occurred while verifying OTP.");
  } finally {
      setIsVerifying(false);
      setuserVerified(true);
    }
  };
  // Fetch Item Details
  useEffect(() => {
    // sendMessage();
    if (id) {
      const fetchItem = async () => {
        try {
          const response = await fetch(`/api/item/${id}`);
          if (!response.ok) throw new Error("Failed to fetch item.");
          const data = await response.json();
          setItem(data.itemDetails);
          setOwnerData(data.ownerResult[0]);
        } catch (err) {
          logger.error({
              message: "Error fetching item",
              error: err.message,
              stack: err.stack,
              function: "fetchItem"
          });
      } finally {
          setLoading(false);
        }
      };

      fetchItem();
    }
  }, [id]);

  // Fetch Location Data
  useEffect(() => {
    const fetchLatLngAndLocation = async () => {
      setShowLocationModal(true); // Show the modal on load
    };

    if (location == null) {
      fetchLatLngAndLocation();
    }
  }, []);

  const handleAllowLocation = () => {
    setShowLocationModal(false); // Close the modal
    setAlertMessage("Fetching location data.");
    setAlertType("success");
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const apiKey = "e3a3ec086bbe4b38b75148015acc783d";
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${apiKey}`;

        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error("Failed to fetch location data.");

          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const components = data.results[0].components;
            const geometry = data.results[0].geometry;


            setLocation({
              city:
                components.city ||
                components.town ||
                components.village ||
                "Unknown",
              state: components.state || "Unknown",
              country: components.country || "Unknown",
              latitude: geometry.lat || "Unknown",
              longitude: geometry.lng || "Unknown",
            });
            setLocationLoading(false);
            setAlertMessage("");
          } else {
            throw new Error("No location data found.");
          }
        } catch (err) {
          logger.error({
              message: "Error fetching location",
              error: err.message,
              stack: err.stack,
              function: "fetchLocation"
          });
          setAlertMessage("Failed to fetch location data.");
          setAlertType("danger");
      }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setAlertMessage("Location access denied. Unable to fetch location.");
        setAlertType("danger");
        setShowLocationModal(false); // Close modal if denied
      }
    );
  };

  const handleDenyLocation = () => {
    setShowLocationModal(false);
    setAlertMessage("Location access denied. Unable to fetch location.");
    setAlertType("danger");
    setLocationLoading(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required.";
    // if (!formData.email.trim()) {
    //   errors.email = "Email is required.";
    // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    //   errors.email = "Invalid email format.";
    // }
    if (!formData.mobile.trim()) {
      errors.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      errors.mobile = "Invalid mobile number. Must be 10 digits.";
    }
    // if (!formData.messageA.trim()) errors.messageA = "Message is required.";
    if (!formData.image) errors.image = "Please capture image."; // Validate image
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!userVerified) {
      setAlertMessage("Please verify mobile");
      return;
    }
    setIsSubmitting(true); // Start submission

    try {
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

      const response = await fetch("/api/finder/contactOwner", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) throw new Error("Failed to submit form.");

      setShowThankYou(true); // Show thank-you message
      setAlertMessage("Submitted successfully!");
      setAlertType("success");
    } catch (err) {
      logger.error({
          message: "Error contacting item owner",
          error: err.message,
          stack: err.stack,
          function: "contactItemOwner"
      });
  
      setAlertMessage(
          "There was an error contacting the item owner. Please try again."
      );
      setAlertType("danger");
  } finally {
      setIsSubmitting(false); // End submission
    }
  };

  const handleTurnOnLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ latitude, longitude });
          setLocationStatus("Location enabled successfully!");
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationStatus(
                "Permission denied. Please allow location access."
              );
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationStatus("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              setLocationStatus("Location request timed out. Try again.");
              break;
            default:
              setLocationStatus("An unknown error occurred.");
          }
        }
      );
    } else {
      setLocationStatus("Geolocation is not supported by your browser.");
    }
  };

  return (
    <>
      <>
        <div className="d-flex align-items-center bg-white p-3">
          <IoIosArrowBack className="fs-3" onClick={handleBack} />
          <div className="w-100">
            <h4 className="mb-0" style={{ marginLeft: "5%" }}>
              Contact Owner
            </h4>
          </div>
        </div>
        <div className="container py-4">
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
                style={{ color: "green", marginBottom: "20px" }}
              />
              <h4 style={{ color: "green" }}>
                Thank You for Your Contribution!
              </h4>
              <p className="mt-3" style={{ fontSize: "16px", color: "#333" }}>
                Your submission has been successfully sent. We appreciate your
                help in reconnecting this item with its rightful owner.
              </p>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body">
                {/* Item Details Section */}
                <div className="text-left mb-5">
                  <h4 className="mb-1 fw-bold text-primary">
                    {item?.item_name || "Unnamed Item"}
                  </h4>
                  <p>{item?.description || "No description available."}</p>
                </div>

                <div className="row my-4">
                  <div className="col">
                    <span className="fw-medium">Brand :</span>
                    <h5 className="d-inline"> {item?.brandName || "N/A"}</h5>
                  </div>
                </div>

                {/* Owner Details Section */}
                {ownerData.privacy === 1 && (
                  <>
                    <div className="text-left mb-4">
                      <p className="mb-2 fw-bold  text-primary">
                        Owner Details
                      </p>
                      <div className="row">
                        <div className="col-12">
                          <span className="fw-medium">Name:</span>
                          <h5 className="d-inline ms-2">
                            {ownerData?.full_name}
                          </h5>
                        </div>
                        <div className="col-12">
                          <span className="fw-medium">Mobile:</span>
                          <h5 className="d-inline ms-2">{ownerData?.mobile}</h5>
                        </div>
                        <div className="col-12">
                          <span className="fw-medium">Email:</span>
                          <h5 className="d-inline ms-2">{ownerData?.email}</h5>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Alert Message Section */}
                {alertMessage && (
                  <Alert variant={alertType} className="mb-4">
                    {alertMessage}
                  </Alert>
                )}

                {/* Contact Form */}
                {locationLoading ? (
                  <div className="text-center">
                    <span
                      className="spinner-border spinner-border-lg"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <p>Loading...</p>
                  </div>
                ) : (
                  <>
                    {location ? (
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Capture Photo</Form.Label>
                          <Form.Control
                            id="image"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileInput}
                            isInvalid={!!errors.image}
                            className={
                              !!errors.image
                                ? "is-invalid"
                                : formData.image
                                ? "is-valid"
                                : ""
                            }
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.image}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Name</Form.Label>
                          <Form.Control
                            id="name"
                            value={formData.name}
                            placeholder="Enter your name"
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
                        </Form.Group>
                        {/* 
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            id="email"
                            value={formData.email}
                            placeholder="Enter your email"
                            onChange={handleInputChange}
                            isInvalid={!!errors.email}
                            className={
                              !!errors.email
                                ? "is-invalid"
                                : formData.email
                                ? "is-valid"
                                : ""
                            }
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </Form.Group> */}

                        <Form.Group className="mb-3">
                          <Form.Label>Mobile</Form.Label>
                          <InputGroup>
                            <Form.Control
                              id="mobile"
                              value={formData.mobile}
                              onChange={handleInputChange}
                              placeholder="Enter 10 digit mobile number"
                              isInvalid={!!errors.mobile}
                              className={
                                !!errors.mobile
                                  ? "is-invalid"
                                  : formData.mobile
                                  ? "is-valid"
                                  : ""
                              }
                            />
                            <Button
                              variant="primary"
                              onClick={(e) => sendOtp(e)}
                              disabled={isSendingOtp || otpSent}
                            >
                              {isSendingOtp ? "Sending..." : "Get OTP"}
                            </Button>
                            <Form.Control.Feedback type="invalid">
                              {errors.mobile}
                            </Form.Control.Feedback>
                          </InputGroup>
                        </Form.Group>
                        {otpSent && (
                          <div className="mt-4">
                            <div className="form-group mb-3">
                              <label htmlFor="otp">Enter OTP</label>
                              <input
                                type="text"
                                id="otp"
                                className="form-control"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                              />
                            </div>
                            <button
                              className="btn btn-success"
                              onClick={verifyOtp}
                              disabled={isVerifying}
                            >
                              {isVerifying ? "Verifying OTP..." : "Verify OTP"}
                            </button>
                          </div>
                        )}

                        <Form.Group className="mb-3">
                          <Form.Label>Message</Form.Label>
                          <Form.Control
                            as="textarea"
                            id="messageA"
                            value={formData.messageA}
                            onChange={handleInputChange}
                            placeholder="Type your message"
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

                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                      </Form>
                    ) : (
                      <div className="text-center">
                        <h4 style={{ color: "green" }}>
                          Please Turn On Your Location to Help the Item Owner!
                        </h4>
                        <p
                          className="mt-3"
                          style={{ fontSize: "16px", color: "#333" }}
                        >
                          To assist in reconnecting this item with its rightful
                          owner, kindly enable your location. Your contribution
                          is highly valued and appreciated!
                        </p>
                        <Button variant="primary" onClick={handleAllowLocation}>
                          Please Share Your Location
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </>
      <Modal show={showLocationModal} onHide={handleDenyLocation} centered>
        <Modal.Header closeButton>
          <Modal.Title>Allow Location Access</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-dark">
            Please Allow to share object location with owner.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDenyLocation}>
            Deny
          </Button>
          <Button variant="primary" onClick={handleAllowLocation}>
            Allow
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Rest of the Contact component */}
    </>
  );
};

export default Contact;
