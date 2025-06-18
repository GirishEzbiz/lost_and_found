// components/Html5QRCodeScanner.js
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Html5QRCodeScanner() {
  const [scanResult, setScanResult] = useState("No result yet"); // Display scanned text here
  const qrCodeRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(qrCodeRef.current.id);

    // Start the QR code scanner
    html5QrCode
      .start(
        { facingMode: "environment" }, // Choose the back camera on mobile devices
        { fps: 10, qrbox: { width: 250, height: 250 } }, // Set the scanning box
        (decodedText) => {
          // Display decoded text on the screen
          setScanResult(decodedText); // Update state with the decoded text
        },
        (errorMessage) => {
          console.log("Error scanning QR code:", errorMessage); // Log any scanning errors
        }
      )
      .catch((err) => {
        console.log("Failed to start QR code scanner:", err);
      });

    // Stop the scanner when component unmounts
    return () => {
      html5QrCode.stop().catch(() => {}); // Clean up on unmount
    };
  }, []);

  return (
    <div>
      <h2>QR Code Scanner</h2>
      <div
        id="qr-code-container"
        ref={qrCodeRef}
        style={{ width: "300px", height: "300px" }}
      ></div>
      <p>
        Scanned Code: <strong>{scanResult}</strong>
      </p>
    </div>
  );
}
