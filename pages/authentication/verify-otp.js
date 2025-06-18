import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie"; // To manage cookies
import logger from "lib/logger";
import { Button } from "react-bootstrap";


const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const { email: queryEmail, mobile, context } = router.query;
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(120); // 2 minutes in seconds
  const [otptimer, setOtpTimer] = useState(false)
  const [loading, setLoading] = useState(false); // Track loading state

  useEffect(() => {
    setTimeout(() => {
      setOtpTimer(true)
    }, 120000);
    return () => clearTimeout(timer);
  }, [])

  const language = Cookies.get("preferred_language") || "en"; // Default to English if not set

  useEffect(() => {
    // Validate the query parameters
    if (!queryEmail || !["neusr", "prusr"].includes(context)) {
      setMessage("Invalid request. Redirecting...");
      setTimeout(() => {
        router.push("/error"); // Redirect to an error or safe page
      }, 2000);
    } else {
      setEmail(queryEmail);
    }

    // Start the timer countdown
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [queryEmail, context, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Email is required.");
      return;
    }

    if (!otp.trim()) {
      setMessage("Please enter the OTP.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      // API call to verify OTP
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp, email, context, language }), // Include context
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP verified successfully!");
        // Check if 'current_qr' exists in cookies
        const qrCode = Cookies.get("current_qr");

        if (qrCode) {
          // Redirect to the 'additem' page if 'current_qr' exists
          router.push("/dashboard/add-item");
        } else {
          // Redirect based on context (default to '/dashboard' for login)
          router.push({
            pathname: context === "login" ? "/dashboard" : "/dashboard",
          });
        }
      } else {
        setMessage(data.message || "Failed to verify OTP.");
      }
    } catch (error) {
      logger.error({
        message: "Error verifying OTP",
        stack: error.stack,
        function: "verifyOTP"
      });
      setMessage("An error occurred. Please try again.");
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value.slice(0, 1); // Capture only 1 character
    const newOtp = otp.split("");

    if (value) {
      newOtp[index] = value;
      setOtp(newOtp.join(""));

      // Focus next input if available
      if (index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = otp.split("");
      newOtp[index] = ""; // Clear the current input
      setOtp(newOtp.join(""));

      // Focus previous input if available
      if (index > 0) {
        document.getElementById(`otp-input-${index - 1}`).focus();
      }
    }
  };


  const resendOtp = async () => {

    if (!otptimer) return;

    setLoading(true);
    try {
      let data = await fetch("/api/resend-otp", {
        method: "post",
        body: JSON.stringify({ email: email, mobile: mobile })
      })

      console.log('OTP resent successfully!');
      // Reset timer after successful resend
      setTimer(120);            // ✅ Reset timer to 120 seconds
      setOtpTimer(false);       // ✅ Lock the resend button again
      setTimeout(() => {
        setOtpTimer(true);      // ✅ Allow resend again after 120 sec
      }, 120000);               // ✅ Restart resend lock timer

      console.log('OTP resent successfully!');
    } catch (error) {
      // Handle error
      console.error('Failed to resend OTP:', error);
    } finally {
      setLoading(false);
    }

  }


  console.log("email", email)

  return (

    <div
      style={{
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        margin: 0,
        padding: 0,
      }}
    >
      {/* 🔸 Top SVG wave */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "150px", display: "block" }}
        >
          <path
            fill="#a22191"
            fillOpacity="1"
            d="M0,160L40,170.7C80,181,160,203,240,192C320,181,400,139,480,106.7C560,75,640,53,720,90.7C800,128,880,224,960,261.3C1040,299,1120,277,1200,250.7C1280,224,1360,192,1400,176L1440,160L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z"
          ></path>
        </svg>
      </div>

      {/* 🔸 Top Image Placeholder */}
      <div
        style={{
          marginTop: "130px",
          display: "flex",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <img
          src="/assets/new_qritagya_logo.png" // ✅ top image
          alt="Top Logo"
          style={{ width: "140px", height: "auto" }}
        />
      </div>

      {/* 🔸 Heading Section */}
      <div style={{ textAlign: "center", marginTop: "20px", zIndex: 2 }}>
        <h2 style={{ fontWeight: "bold", color: "#1E1E2F" }}>OTP verification</h2>
        <p style={{ color: "#6c757d", margin: 0 }}>
         </p>
      </div>



      {/* 🔸 Middle Section */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
          paddingTop: "20px",
        }}
      >
        <div
          style={{
            width: "90%",
            maxWidth: "400px",
            padding: "16px",
            backgroundColor: "#ffffff",
            borderRadius: "10px",
          }}
        >
          {/* 🔸 Middle Image Placeholder */}
          <div className="text-center mb-4">
            <img
              src="/assets/otp.png" // ✅ middle image
              alt="OTP Illustration"
              style={{ width: "150px", height: "auto" }}
            />
          </div>

          {/* 🔸 OTP Form */}
          <form onSubmit={handleSubmit} className="text-center">
            <div className="mb-3">
              <label htmlFor="otp" className="form-label">
                Enter the OTP
              </label>
              <div className="d-flex justify-content-center">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    id={`otp-input-${index}`}
                    maxLength="1"
                    className="form-control text-center otp-input"
                    style={{
                      width: "45px",
                      height: "45px",
                      fontSize: "20px",
                      textAlign: "center",
                      boxSizing: "border-box",
                      padding: "0",
                      border: "2px solid #ccc",
                      borderRadius: "6px",
                      marginRight: index !== 5 ? "6px" : 0,
                    }}
                    value={otp[index] || ""}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleBackspace(e, index)}
                    disabled={isSubmitting}
                    pattern="[0-9]*"
                    inputMode="numeric"
                  />
                ))}
              </div>
            </div>

            <div className="text-center mb-3">
              <span className="text-muted">
                Didn’t get the code?{" "}
                <span
                  className={`p-1 text-sm font-bold ms-2 ${!otptimer ? 'text-gray-500' : 'text-black'}`}
                  onClick={resendOtp}
                  disabled={!otptimer}
                > {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> // Bootstrap spinner
                ) : (
                  'Resend-Otp'
                )}

                </span>
              </span>
            </div>
            {
              !otptimer && <div className="text-center mb-3">
                <span className="text-muted">You can resend Otp after: {formatTimer(timer)}</span>
              </div>

            }


            <button
              type="submit"
              className="btn w-100"
              style={{
                backgroundColor: "#a22191",
                color: "#fff",
                fontWeight: "bold",
              }}
              disabled={isSubmitting }
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>

            {message && (
              <div
                className={`mt-3 alert ${message.includes("successfully") ? "alert-success" : "alert-danger"
                  }`}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>






  );
};

export default VerifyOTP;
