import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import GoogleLoginButton from "pages/components/GoogleLoginButton";
import Image from "next/image";
import { HiOutlineMail } from "react-icons/hi"
import { FaPhoneAlt } from "react-icons/fa"
import { FaUser } from "react-icons/fa";

const Signup = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",

    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(false);

  // Validation helpers
  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const validateMobile = (mobile) => /^[0-9]{10}$/.test(mobile);

  const validateForm = () => {
    const { fullName, email, mobile, acceptTerms } = formData;
    const newErrors = {};

    if (!fullName.trim()) newErrors.fullName = "Full Name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!validateEmail(email))
      newErrors.email = "Please enter a valid email address.";

    if (!mobile.trim()) newErrors.mobile = "Mobile number is required.";
    else if (!validateMobile(mobile))
      newErrors.mobile = "Please enter a valid 10-digit mobile number.";



    if (!acceptTerms)
      newErrors.acceptTerms = "You must accept the terms and conditions.";

    return newErrors;
  };

  // Real-time input validation
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;

    // Update formData
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });

    // Validate the field in real-time
    const newErrors = { ...errors };

    // Real-time validation for each field
    if (id === "fullName" && !value.trim()) {
      newErrors.fullName = "Full Name is required.";
    } else {
      delete newErrors.fullName;
    }

    if (id === "email") {
      if (!value.trim()) {
        newErrors.email = "Email is required.";
      } else if (!validateEmail(value)) {
        newErrors.email = "Please enter a valid email address.";
      } else {
        delete newErrors.email;
      }
    }

    if (id === "mobile") {
      if (!value.trim()) {
        newErrors.mobile = "Mobile number is required.";
      } else if (!validateMobile(value)) {
        newErrors.mobile = "Please enter a valid 10-digit mobile number.";
      } else {
        delete newErrors.mobile;
      }
    }



    if (id === "acceptTerms" && !checked) {
      newErrors.acceptTerms = "You must accept the terms and conditions.";
    } else {
      delete newErrors.acceptTerms;
    }

    setErrors(newErrors);  // Update errors state with the real-time validation
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors on form submit

    const newErrors = validateForm();  // This runs the validation checks
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);  // Set the errors if there are any
      return;
    }

    // Continue with form submission if there are no errors
    setIsLoading(true);
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setAlert(true);
        setTimeout(() => {
          router.push({
            pathname: "/authentication/verify-otp",
            query: { email: formData.email, context: "neusr" },
          });
          setAlert(false);
        }, 1500);
      } else {
        const data = await response.json();

        // Here we handle specific errors like "email_exists" or "mobile_exists"
        if (data.error === "email_exists") {
          setErrors({
            email: data.message || "This email is already registered.",
          });
        } else if (data.error === "mobile_exists") {
          setErrors({
            mobile: data.message || "This mobile number is already registered.",
          });
        } else {
          setErrors({
            global: data.message || "Something went wrong. Please try again.",
          });
        }
      }
    } catch (error) {
      console.log("error occurred", error);

      console.error("Error:", error);
      setErrors({ global: "An error occurred. Please try again later." });
    }
    finally {
      setIsLoading(false);
    }
  };



  return (
    <div
      className="container d-flex flex-column justify-content-between px-3"
      style={{
        height: "100vh",
        backgroundColor: "#FFF",
        position: "relative",
        paddingBottom: "30px",
        overflow: "hidden",
      }}
    >
      {/* Top SVG */}
      <div className="position-absolute top-0 start-0 w-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: "220px" }}
          viewBox="0 0 1440 320"
        >
          <path
            fill="#a22191"
            fillOpacity="1"
            d="M0,160L40,170.7C80,181,160,203,240,192C320,181,400,139,480,106.7C560,75,640,53,720,90.7C800,128,880,224,960,261.3C1040,299,1120,277,1200,250.7C1280,224,1360,192,1400,176L1440,160L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z"
          ></path>
        </svg>
      </div>

      {/* Main content area */}
      <div
        className="flex-grow-1 d-flex flex-column justify-content-center"
        style={{ paddingTop: "140px", paddingBottom: "40px" }}
      >
        {/* Back Button */}
        <Link href="/">
          <MdOutlineKeyboardBackspace
            className="fs-4 text-dark position-absolute"
            style={{ top: "20px" }}
          />
        </Link>

        {/* Logo Section - slightly moved up */}
        <div className="text-center mb-3">
          <Link href="/">
            <Image
              src="/assets/new_qritagya_logo.png"
              alt="Lost and Found Logo"
              width={160} // Required width
              height={40}
              priority
            />
          </Link>
          <p className="mb-1 pt-2" style={{ color: "#474C59", fontSize: "15px" }}>
            Enter your details to sign up and receive a verification code.
          </p>
        </div>

        {/* Form */}
        <div className="d-flex justify-content-center">
          <div className="col-12" style={{ maxWidth: "500px" }}>
            <form onSubmit={handleSubmit}>
              {alert && (
                <div className="alert alert-success" role="alert">
                  Registration successful
                </div>
              )}

              {/* Full Name */}
              <div className="mb-3">
                <div className="position-relative">
                  {/* User Icon */}
                  <FaUser
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "12px",
                      transform: "translateY(-50%)",
                      color: "a22191",
                      fontSize: "16px",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Input Field */}
                  <input
                    type="text"
                    className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                    id="fullName"
                    placeholder="Enter your name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    style={{
                      paddingLeft: "42px", // leaves space for icon
                      height: "44px",
                    }}
                  />
                </div>

                {/* Error Message */}
                {errors.fullName && (
                  <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
                    {errors.fullName}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="mb-3">
                <div className="position-relative">
                  {/* Icon */}
                  <HiOutlineMail
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "12px",
                      transform: "translateY(-50%)",
                      color: "a22191",
                      fontSize: "18px",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Input */}
                  <input
                    type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    id="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      paddingLeft: "42px", // creates space for icon
                      height: "44px",       // fixed height for consistency
                    }}
                  />
                </div>

                {/* Error */}
                {errors.email && (
                  <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
                    {errors.email}
                  </div>
                )}
              </div>


              {/* Mobile */}

              <div className="mb-3">
                <div className="position-relative">
                  {/* Phone Icon */}
                  <FaPhoneAlt
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "12px",
                      transform: "translateY(-50%)",
                      color: "a22191",
                      fontSize: "16px",
                      pointerEvents: "none", // allows clicks through the icon
                    }}
                  />

                  {/* Input Field */}
                  <input
                    type="text"
                    className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
                    id="mobile"
                    placeholder="Enter your mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    style={{
                      paddingLeft: "42px", // leaves space for the icon
                      height: "44px",      // consistent height
                    }}
                  />
                </div>

                {/* Error Message */}
                {errors.mobile && (
                  <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
                    {errors.mobile}
                  </div>
                )}
              </div>

              {/* Password */}


              {/* Checkbox */}
              <div className="form-check mb-2">
                <input
                  className={`form-check-input ${errors.acceptTerms ? "is-invalid" : ""}`}
                  type="checkbox"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="acceptTerms">
                  By registering, you accept our{" "}
                  <a href="#" className="text-decoration-none" style={{ color: "#4B56E3" }}>Terms of Use</a>{" "}
                  and{" "}
                  <a href="#" className="text-decoration-none" style={{ color: "#4B56E3" }}>Privacy Policy</a>.
                </label>
                {errors.acceptTerms && (
                  <div className="invalid-feedback">{errors.acceptTerms}</div>
                )}
              </div>

              {errors.global && (
                <div className="text-danger text-center mt-2">{errors.global}</div>
              )}

              {/* Submit */}
              <div className="d-grid my-3">
                <button
                  type="submit"
                  style={{
                    backgroundColor: isLoading ? "#a22191" : "#a22191",
                    color: "#fff",
                    padding: "10px 24px",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span
                      style={{
                        display: "inline-block",
                        width: "20px",
                        height: "20px",
                        border: "2px solid #fff",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    ></span>
                  ) : (
                    "Continue"
                  )}
                </button>
                <style>
                  {`
                @keyframes spin {
                  to {
                    transform: rotate(360deg);
                  }
                }
              `}
                </style>
              </div>

              {/* Google Login */}
              <div className="d-grid mb-2">
                <GoogleLoginButton />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="text-center mb-4" style={{ fontSize: "15px" }}>
        Already have an account?{" "}
        <Link href="/authentication/sign-in" className="fs-5 txt-primary">
          Login
        </Link>
      </div>
    </div>



  );
};

export default Signup;
