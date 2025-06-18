import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import logger from "lib/logger";
import { Button } from "react-bootstrap";

const Verifyotp = () => {
  const [otp, setOtp] = useState(Array(6).fill("")); // ✅ Use array of 6 digits
  const router = useRouter();
  const { refs, mobile } = router.query;
  const [message, setMessage] = useState("");
  const [ref, setRef] = useState("");
  const unique_user_id = Cookies.get("unique_user_id");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(120); // 2 minutes
  const [otptimer, setOtpTimer] = useState(false);
  const [loading, setLoading] = useState(false); // Track loading state
  useEffect(() => {
    const handlePopState = () => {
      // Block back navigation
      router.replace(`/qr/${refs}/verifyotp?refs=${refs}&mobile=${mobile}`);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [refs, mobile]);

  useEffect(() => {
    setTimeout(() => {
      setOtpTimer(true);
    }, 120000);
    return () => clearTimeout(otptimer);
  }, []);
  useEffect(() => {
    setRef(refs);

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [refs, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.join("").trim().length < 6) {
      setMessage("Please enter the complete OTP.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      const response = await fetch("/api/finderAuth/verifyOtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: otp.join(""), ref, unique_user_id }), // ✅ Join array to string
      });

      const data = await response.json();

      if (response.status === 200) {
        setMessage("OTP verified successfully!");
        router.push("/finder-thanks");
      } else {
        setMessage(data.error || "Failed to verify OTP.");
      }
    } catch (error) {
      logger.error({
        message: "Error verifying OTP",
        error: error.message,
        stack: error.stack,
        function: "verifyOTP",
      });

      setMessage("An error occurred. Please try again.");
    } finally {
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
    const value = e.target.value.replace(/\D/g, "").slice(0, 1); // digits only
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);

      if (index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        prevInput?.focus();
      }
    }
  };
  const resendOtp = async () => {
    if (!otptimer) return;

    setLoading(true);
    try {
      let payload = { mobile, unique_user_id };
      let data = await fetch("/api/finder/resend-finder-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // 🔁 Reset timer to 2 minutes
      setTimer(120);
      setOtpTimer(false);
      setTimeout(() => {
        setOtpTimer(true);
      }, 120000);
    } catch (error) {
      console.error("Failed to resend OTP:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ zIndex: 1050 }}
    >
      {/* 🔶 SVG Background */}
      <div
        className="position-absolute top-0 start-0 w-100"
        style={{ zIndex: 0 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#a22191"
            fillOpacity="1"
            d="M0,256L40,213.3C80,171,160,85,240,64C320,43,400,85,480,117.3C560,149,640,171,720,186.7C800,203,880,213,960,181.3C1040,149,1120,75,1200,74.7C1280,75,1360,149,1400,186.7L1440,224L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z"
          ></path>
        </svg>
      </div>

      {/* 🔶 Content Section */}
      <div
        className="d-flex flex-column justify-content-center align-items-center h-100"
        style={{ position: "relative", zIndex: 1, padding: "1rem" }}
      >
        {/* Heading */}
        <h3 className="fw-bold text-center text-dark mb-2">OTP Verification</h3>
 
        {/* Description */}
        <p
          className="text-center text-dark mb-4 px-3"
          style={{ fontSize: "0.9rem", maxWidth: "400px" }}
        >
          Please enter the OTP (One-Time Password) sent to your registered
          email/phone number to complete your verification.
        </p>

        {/* OTP Illustration */}
        <img
          src="/assets/otp.png"
          alt="OTP Illustration"
          className="img-fluid mb-4"
          style={{ width: "120px", height: "auto" }}
        />

        {/* OTP Input Card */}
        <div
          className="bg-white p-4 rounded shadow"
          style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-3 d-flex justify-content-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength="1"
                  className="form-control text-center mx-1"
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    width: "45px",
                    fontWeight: "normal",
                    textAlign: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                  name={`otp-${index}-${Math.random()}`}
                  autoComplete="new-password"
                  autoCorrect="off"
                  spellCheck="false"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleBackspace(e, index)}
                  disabled={isSubmitting}
                />
              ))}
            </div>

           {
            !otptimer &&  <small className="text-muted d-block mb-2">
              You can resend Otp after : {formatTimer(timer)}
            </small>

           }
            <small className="text-dark d-block mb-3">
              OTP sent to Finder xxxxxxx{mobile?.slice(-3)}
            </small>

            <button
              type="submit"
              className="btn w-100"
              style={{
                backgroundColor: "#a22191",
                color: "#fff",
                fontWeight: 600,
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-3 alert ${
                message.includes("successfully")
                  ? "alert-success"
                  : "alert-danger"
              }`}
            >
              {message}
            </div>
          )}

          <div className="text-center my-2 ">
            <span className="text-muted">
              Didn’t get the code?{" "}
              <span
                className={` text-sm  mt-2 font-bold ms-2 ${
                  !otptimer ? "text-gray-500" : "text-black"
                }`}
                disabled={!otptimer}
                onClick={resendOtp}
              >
                {loading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span> // Bootstrap spinner
                ) : (
                  "Resend-Otp"
                )}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verifyotp;
