import React, { useEffect, useState, useRef } from "react";
import {
  Form,
  Button,
  Alert,
  Container,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import axios from "axios";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { FaLock } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

const ForgotPassword = () => {
  const router = useRouter();

  const [step, setStep] = useState(1); // 1: verify, 2: otp, 3: reset
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(120); // 120 seconds = 2 minutes

  const [loading, setLoading] = useState(false);
  const [otptimer, setOtpTimer] = useState(false)
  const [vloading, setVLoading] = useState(false); // Track loading state
  const [userData, setUserData] = useState({
    email: '',
    mobile: ''
  })
  let { email, mobile } = userData

  useEffect(() => {
    if (step === 2) {
      setOtpTimer(false);
      setTimer(120); // Reset timer on entering OTP step
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setOtpTimer(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval); // cleanup
    }
  }, [step]);



  const formatTimer = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };



  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);

    if (!emailOrMobile.trim()) {
      setError("Email or Mobile is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/brand/verify-user", {
        identity: emailOrMobile,
      });
      // console.log("res", res)
      const data = res?.data
      if (res.status === 200) {
        setStep(2);
        setUserData({

          email: data?.user?.email,
          mobile: data?.user?.mobile
        })
      } else {
        setError("Invalid Email or Mobile.");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    if (!value && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError(null);
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Enter all 6 digits of the OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/brand/verify-otp", {
        identity: emailOrMobile,
        otp: otpCode,
      });

      if (res.data.success) {
        setStep(3);
      } else {
        setError("Invalid OTP.");
      }
    } catch (err) {
      setError("OTP verification failed.");
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/brand/reset-password", {
        identity: emailOrMobile,
        password: newPassword,
      });

      if (res.data.success) {
        router.push("/brand/login");
      } else {
        setError("Password reset failed.");
      }
    } catch (err) {
      setError("Something went wrong.");
    }
    setLoading(false);
  };



  // const resendOtp = async () => {

  //   if (!otptimer) return;
  //   setVLoading(true);
  //   // console.log("email", email)
  //   // console.log("mobile", mobile)
  //   try {
  //     let payload = {
  //       email: email,
  //       mobile: mobile
  //     }
  //     let data = await fetch("/api/auth/brand/resend-brand-otp", { method: "Post", body: JSON.stringify(payload) })
  //     setOtpTimer(false)
  //     setTimer(20);
  //   } catch (error) {
  //     console.error('Failed to resend OTP:', error);
  //   } finally {
  //     setLoading(false);
  //     setVLoading(false);
  //   }

  // }
  const resendOtp = async () => {
    if (!otptimer) return; // Prevent resending OTP if the timer is still active
  
    setVLoading(true); // Show the loading spinner
  
    try {
      let payload = {
        email: email,
        mobile: mobile,
      };
  
      // Send OTP request to the backend
      let data = await fetch("/api/auth/brand/resend-brand-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      });
  
      // Reset OTP timer and start countdown again
      setOtpTimer(false); // Allow timer to start again
      setTimer(120); // Reset the timer to 20 seconds
  
      // Restart the countdown
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval); // Stop the interval when timer reaches 0
            setOtpTimer(true); // Enable OTP resend after countdown
            return 0;
          }
          return prev - 1; // Decrease timer by 1 each second
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    } finally {
      setVLoading(false); // Hide the loading spinner
    }
  };
  
 
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #667eea, #764ba2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Container>
        <Row className="justify-content-center align-items-center">
          <Col md={6} className="d-none d-md-flex justify-content-center">
            <img
              src="/images/login-illustration.png"
              alt="Login Illustration"
              style={{ width: "80%", maxWidth: "400px" }}
            />
          </Col>

          <Col md={6} lg={5}>
            <Card className="shadow-lg rounded-4">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <Image
                    width={75}
                    height={70}
                    src="/assets/new_qritagya_logo.png"
                    alt="Logo"
                  />
                  <h3 className="fw-bold pt-2">
                    {step === 1
                      ? "Reset Password"
                      : step === 2
                        ? "Enter OTP"
                        : "Set New Password"}
                  </h3>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form
                  onSubmit={
                    step === 1
                      ? handleVerify
                      : step === 2
                        ? handleOtpVerify
                        : handlePasswordReset
                  }
                >
                  {step === 1 && (
                    <Form.Group className="mb-3">
                      <Form.Label>Email or Mobile</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter registered email or mobile"
                        value={emailOrMobile}
                        onChange={(e) => setEmailOrMobile(e.target.value)}
                      />
                    </Form.Group>
                  )}

                  {step === 2 && (
                    <>

                      <div className="d-flex justify-content-between gap-2 mb-3">
                        {otp.map((digit, idx) => (
                          <Form.Control
                            key={idx}
                            type="text"
                            maxLength={1}
                            value={digit}
                            ref={(el) => (otpRefs.current[idx] = el)}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            className="text-center"
                            style={{
                              width: "50px",
                              height: "50px",
                              fontSize: "1.5rem",
                              borderRadius: "8px",
                              border: "1px solid #ccc",
                            }}
                          />
                        ))}
                      </div>
                      <div className="text-end mt-3 ">

                      </div>
                    </>
                  )}


                  {step === 3 && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </Form.Group>
                    </>
                  )}

                  <div className="d-grid mt-3">
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading
                        ? "Please wait..."
                        : step === 1
                          ? "Send OTP"
                          : step === 2
                            ? "Verify OTP"
                            : "Reset Password"}
                    </Button>
                  </div>

                  {step === 1 && (
                    <div className="text-end mt-3">
                      <Link
                        href="/brand/login"
                        className="text-decoration-none text-primary"
                      >
                        Remember Password? Login
                      </Link>
                    </div>
                  )}
                  {step === 2 && (
                    <div className="text-end mt-3">
                      {otptimer ? (
                        <span
                          className="text-primary"
                          onClick={!vloading ? resendOtp : null}
                          style={{ cursor: vloading ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center" }}
                        >
                          {vloading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Sending...
                            </>
                          ) : (
                            "Resend OTP"
                          )}
                        </span>
                      ) : (
                        <span className="text-muted">You can resend OTP in {formatTimer(timer)}</span>
                      )}

                    </div>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword;
