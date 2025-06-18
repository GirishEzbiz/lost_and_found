import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from "lib/isAuthenticated";
import useTranslate from "utils/useTranslate";
import Cookies from "js-cookie";

const ConnectItemIntro = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [data,setData] = useState();

  const translatedText = useTranslate({
    heading: "Protect Your Item",
    description: "Connect your item to this QR code — protection begins now.",
    button: "Connect Your Item",
    learnMore: "How does it work?",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    router.push(
      isAuthenticated() ? "/dashboard/add-item" : "/authentication/sign-in"
    );
  };
  useEffect(() => {
    const qr = Cookies.get("current_qr");
    if (!qr) return;
  
    const fetchQrBrandDetails = async () => {
      try {
        const res = await fetch(`/api/getQrBrandDetails?qr=${encodeURIComponent(qr)}`);
        const data = await res.json();
        console.log("Brand details from QR:", data.brand); // ⬅️ You can use or store this
        setData(data.brand)
      } catch (err) {
        console.error("Error fetching QR brand details:", err);
      }
    };
  
    fetchQrBrandDetails();
  }, []);
  
  if (!mounted) return null;

  return (
    <div
      className="position-relative d-flex flex-column justify-content-between text-center overflow-x-hidden"
      style={{
        minHeight: "93vh",
        backgroundColor: "#FFF",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "1rem",
      }}
    >
      {/* Top Wave Background */}
      <div className="position-absolute top-0 start-0 w-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: "120px" }}
          viewBox="0 0 1440 320"
        >
          <path
            fill="#FF9149"
            fillOpacity="1"
            d="M0,160L40,170.7C80,181,160,203,240,192C320,181,400,139,480,106.7C560,75,640,53,720,90.7C800,128,880,224,960,261.3C1040,299,1120,277,1200,250.7C1280,224,1360,192,1400,176L1440,160L1440,0L0,0Z"
          ></path>
        </svg>
      </div>

      {/* Logo */}
      <div style={{ marginTop: "98px", zIndex: 2 }}>
        <Link href="/">
          <Image
            src="/assets/new_qritagya_logo.png"
            alt="Qritagya Logo"
            width={180}
            height={50}
            priority
          />
        </Link>
      </div>

      {/* QR Image */}
      <div className="mt-4" style={{ zIndex: 2 }}>
        <Image
          src="/assets/qr-code.jpg"
          alt="QR Code"
          width={260}
          height={220}
          priority
          style={{ objectFit: "contain", borderRadius: "8px" }}
        />
      </div>


      <div
  className="d-flex justify-content-center align-items-center"
  style={{ minHeight: "200px" }}
>
  <div style={{ textAlign: "center" }}>
    <img
      src={data?.brand_image}
      alt="Brand Placeholder"
      style={{
        width: "80%",           // Full container width
        maxWidth: "150px",      // Responsive max width
        height: "auto",         // Maintain aspect ratio
        borderRadius: "12px",
        objectFit: "cover",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        marginBottom: "10px",
      }}
    />
    <div
      className="text-muted"
      style={{ fontSize: "1rem", fontWeight: "500" }}
    >
      {data?.welcome_message}
    </div>
  </div>
</div>



      {/* Text Section */}
      <div className="mx-auto px-3" style={{ maxWidth: "480px", zIndex: 2 }}>
        <h2 className="fw-bold mt-4" style={{ fontSize: "1.7rem" }}>
          {translatedText.heading}
        </h2>

        <p className="text-muted" style={{ fontSize: "1rem" }}>
          {translatedText.description}
        </p>

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleClick}
          className="btn btn-lg shadow w-100 my-3"
          style={{
            backgroundColor: "#FCB454",
            color: "#fff",
            fontWeight: "600",
            borderRadius: "0.5rem",
            padding: "0.75rem 1.25rem",
            fontSize: "1.1rem",
            border: "none",
          }}
        >
          {translatedText.button}
        </button>

        {/* Learn More Link */}
        <p className="text-muted" style={{ fontSize: "0.9rem" }}>
          <Link href="/" className="fw-bold" style={{ color: "#FF9149" }}>
            {translatedText.learnMore}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ConnectItemIntro;