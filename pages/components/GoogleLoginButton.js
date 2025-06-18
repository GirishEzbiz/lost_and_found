import { GoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";

const GoogleLoginButton = () => {
  const handleSuccess = async (credentialResponse) => {
    const res = await fetch("/api/auth/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: credentialResponse.credential }),
    });

    let qr = Cookies.get("current_qr");
    if (res.ok) {
      const data = await res.json();

      if (qr) {
        window.location.href = `/dashboard/add-item`;
      } else {
        window.location.href = "/dashboard";
      }
    } else {
      console.error("Google login failed");
    }
  };

  const handleError = () => {
    console.error("Google login failed");
  };

  return <GoogleLogin onSuccess={handleSuccess} onError={handleError} />;
};

export default GoogleLoginButton;
