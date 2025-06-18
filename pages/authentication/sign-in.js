// pages/authentication/login.js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Cookies from "js-cookie";
import { FiMail } from "react-icons/fi";
import Image from "next/image";
import GoogleLoginButton from "../components/GoogleLoginButton";

const Login = () => {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [isEmail, setIsEmail] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false); // ✅ to fix SSR layout shift

  useEffect(() => {
    setMounted(true); // ✅ ensures we only render after mount
  }, []);

  const handleContactChange = (e) => {
    const value = e.target.value;
    setContact(value);
    setIsEmail(value.includes("@"));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact }),
      });

      const data = await response.json();

      // console.log("data", data)

      if (!response.ok) {
        setError(data.message || "An error occurred. Please try again.");
      } else {
        router.push({
          pathname: "/authentication/verify-otp",
          query: { email: data.email, mobile: data.mobile, context: "prusr" },
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Prevent SSR rendering until mounted
  if (!mounted) return null;

  return (
    <div
      className="position-relative d-flex flex-column justify-content-between overflow-x-hidden"
      style={{ minHeight: "100vh", backgroundColor: "#FFF" }}
    >
      {/* Top SVG Background */}
      <div className="position-absolute top-0 start-0 w-100">
        
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#a22191" fill-opacity="1" d="M0,128L80,122.7C160,117,320,107,480,138.7C640,171,800,245,960,240C1120,235,1280,149,1360,106.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path></svg>
       
      </div>

      {/* Logo */}
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ marginTop: "80px", zIndex: 2 }}
      >
        <Link href="/">
          <Image
            src="/assets/new_qritagya_logo.png"
            alt="QRITAGYA Logo"
            width={160}
            height={40}
            priority
          />
        </Link>
      </div>

      {/* QR Code Centered */}
      <div
        className="position-relative d-flex justify-content-center align-items-center "
        style={{ zIndex: 2 }}
      >
        <Image
          src="/assets/qr-code.jpg"
          alt="QR Code"
          width={250}
          height={250}
          priority // ✅ ensures image loads during SSR
          style={{ objectFit: "contain", }}

        />
      </div>

      {/* Form Section */}
      <div className="container" style={{ zIndex: 2, marginBottom: "50px" }}>
        <form
          onSubmit={handleLogin}
          className="mx-auto p-4"
          style={{ maxWidth: "500px" }}
        >
          {/* Heading */}
          <div className="mb-4 text-start" >
            <h5 className="fs-5 fw-bold text-uppercase">
              Enter Your Email Or Mobile Number
            </h5>
            <p className="text-muted fs-6">
              6 digit code will be sent on your email or mobile no.
            </p>
          </div>

          {/* Input */}
          <div className="mb-4 position-relative">
            <span
              className="position-absolute"
              style={{
                top: "50%",
                left: "18px",
                transform: "translateY(-50%)",
                color: "#666",
                fontSize: "1.2rem",
                zIndex: 2,
              }}
            >
              <FiMail />
            </span>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Enter your email or mobile"
              value={contact}
              onChange={handleContactChange}
              required
              style={{
                paddingLeft: "50px",
                borderRadius: "0.75rem",
              }}
            />
          </div>

          {/* Error */}
          {error && <div className="text-danger mb-3 text-center">{error}</div>}

          {/* Submit Button */}
          <div className="d-grid mb-3">
            <button
              type="submit"
              className="btn btn-lg shadow"
              disabled={loading}
              style={{
                backgroundColor: "#a22191",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.75rem 1.25rem",
              }}
            >
              {loading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                "Send OTP"
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="d-flex align-items-center my-4">
            <hr className="flex-grow-1 border-dark" />
            <span className="mx-2 text-muted">or</span>
            <hr className="flex-grow-1 border-dark" />
          </div>

          {/* Google Login */}
          <div className="d-grid mb-4 rounded-3">
            <GoogleLoginButton />
          </div>

          {/* Signup Link */}
          <div className="d-flex justify-content-center mt-3">
            <Link
              href="/authentication/sign-up"
              className="text-decoration-none"
              style={{ color: "gray", fontWeight: "500" }}
            >
              New User?{" "}
              <span style={{ color: "#a22191", fontWeight: "600" }}>
                &nbsp;Create An Account
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
