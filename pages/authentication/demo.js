import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Cookies from "js-cookie"; // To manage cookies
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import Image from "next/image";
 
const Login = () => {
  const router = useRouter();
  const [contact, setContact] = useState(""); // State to store email or mobile
  const [isEmail, setIsEmail] = useState(false); // State to determine if contact is email or mobile
  const [error, setError] = useState(""); // Error state to handle validation and API errors
  const [loading, setLoading] = useState(false); // State to track if the request is in progress

  const handleContactChange = (e) => {
    const value = e.target.value;
    setContact(value);
    setIsEmail(value.includes("@")); // Check if the input contains '@' to identify email
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const validateMobile = (mobile) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(mobile);
  };

  const handleLogin = async () => {
    setError(""); // Reset error state on each login attempt
    setLoading(true); // Set loading state to true when the process starts

    if (!contact) {
      setError("Please enter an email or mobile.");
      setLoading(false); // Set loading state to false if validation fails
      return;
    }

    // Validate email or mobile format
    if (isEmail) {
      if (!validateEmail(contact)) {
        setError("Invalid email format.");
        setLoading(false);
        return;
      }
    } else {
      if (!validateMobile(contact)) {
        setError("Invalid mobile number format.");
        setLoading(false);
        return;
      }
    }

    // API call to check if email/mobile exists in the system and send OTP
    try {
      const response = await fetch("/api/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contact }),
      });

      const data = await response.json();
      const userEmail = data.email;
      if (!response.ok) {
        // Display error if the API responds with an error (e.g., user not found)
        setError(data.message || "An error occurred. Please try again.");
      } else {
        // If OTP is sent successfully, proceed to OTP verification page
        router.push({
          pathname: "/authentication/verify-otp",
          query: { email: userEmail, context: "prusr" },
        });
      }
    } catch (error) {
      console.log("error occurred",error);

      setError("An error occurred. Please try again later.");
  }
   finally {
      setLoading(false); // Set loading state to false after the API call completes
    }
  };

  return (
    <div className="container px-3">
      <div className="position-relative">
        <Link href="/">
          <MdOutlineKeyboardBackspace
            className=" fs-4  text-dark position-absolute"
            style={{ top: "10px" }}
          />
        </Link>
      </div>
      {/* LOST & FOUND Heading */}

      <div className="d-flex align-items-center justify-content-center">
        <div className="col-12  h-100" style={{ marginTop: "38%" }}>
          <div className="mb-5">
            <div className="text-center mb-5">
              <Link href="/">
              <Image
              src="/assets/LOST__-removebg-preview.png" // Correct path (no ./)
              alt="Lost and Found Logo"
              width={192} // Required width
              height={50} // Required height
              priority // Optional: Ensures the image loads faster
            />
              </Link>
              <p className="mb-6">Enter your details to access your account.</p>
            </div>
            <form>
              <div className="mb-5">
                <h2 className="fw-bold text-left">Log in</h2>
              </div>

              <div className="mb-4">
                <label className="form-label mb-2" for="Email">
                  Email or Mobile
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="contact"
                  placeholder="Enter your email or mobile"
                  value={contact}
                  onChange={handleContactChange}
                />
              </div>

              {error && <div className="text-danger mb-4">{error}</div>}

              <div className="d-grid my-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>

              <div className="d-flex align-items-center my-4">
                <hr className="flex-grow-1 border-dark" />
                <span className="mx-2 text-muted">or</span>
                <hr className="flex-grow-1 border-dark" />
              </div>

              <div className="d-flex justify-content-between">
                <Link
                  className="fs-5 text-primary"
                  href="/authentication/sign-up"
                >
                  Create An Account
                </Link>

                {/* <Link className="fs-5 text-muted" href="/forget-password">Forgot your password?</Link>  */}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
